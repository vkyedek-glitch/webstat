'use strict';
const pool = require('../db');
const mailer = require('./mailer');
const systemSettings = require('./systemSettings');

const REPORT_LOCK = 727003;
let healthWasUp = true;
let lastQueueAlertAt = 0;
const reportRetryAt = new Map();
let timer = null;

async function sendAlert(subject, text) {
  const settings = await systemSettings.getMailConfig({ allowCached: true });
  if (!settings.alertEmail) return;
  await mailer.send(subject, text, settings.alertEmail, { allowCached: true });
}

async function notifyQueueFailure(message) {
  const now = Date.now();
  if (now - lastQueueAlertAt < 30 * 60_000) return;
  lastQueueAlertAt = now;
  const settings = await systemSettings.getSettings({ allowCached: true });
  if (!settings.alertQueueErrors) return;
  try {
    await sendAlert('Webstat: database write queue error', `A write batch failed and was scheduled for retry.\n\nError: ${message}`);
  } catch (error) {
    console.error('[alerts] queue error email failed:', error.message);
  }
}

async function checkDatabaseHealth() {
  const settings = await systemSettings.getSettings({ allowCached: true });
  let healthError = null;
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    healthError = error;
  }
  if (healthError) {
    if (healthWasUp && settings.alertServiceHealth) {
      try {
        await sendAlert('Webstat: database unavailable', `Webstat cannot reach its database.\n\nError: ${healthError.message}`);
      } catch (mailError) {
        console.error('[alerts] database failure email failed:', mailError.message);
      }
    }
    healthWasUp = false;
    return;
  }
  if (!healthWasUp && settings.alertServiceHealth) {
    try {
      await sendAlert('Webstat: database recovered', 'The Webstat database connection has recovered.');
    } catch (mailError) {
      console.error('[alerts] database recovery email failed:', mailError.message);
    }
  }
  healthWasUp = true;
}

async function sendReport(kind, from, to, today) {
  if ((reportRetryAt.get(kind) || 0) > Date.now()) return;
  const client = await pool.connect();
  try {
    const lock = await client.query('SELECT pg_try_advisory_lock($1) AS ok', [REPORT_LOCK]);
    if (!lock.rows[0].ok) return;
    try {
      const settings = await systemSettings.getMailConfig();
      const enabled = kind === 'daily' ? settings.alertDaily : settings.alertWeekly;
      if (!enabled || !settings.alertEmail) return;
      const markColumn = kind === 'daily' ? 'last_daily_sent' : 'last_weekly_sent';
      const sent = await client.query(`SELECT ${markColumn} AS last_sent FROM system_settings WHERE id = 1`);
      if (sent.rows[0] && String(sent.rows[0].last_sent || '').slice(0, 10) === today) return;

      const result = await client.query(
        `SELECT w.name, w.domain_name, count(DISTINCT s.id)::int AS sessions,
                count(DISTINCT s.visitor_hash)::int AS visitors,
                (SELECT count(*)::int FROM pageviews p
                  WHERE p.website_id = w.id AND p.created_at >= $1 AND p.created_at < $2) AS pageviews
           FROM websites w
           LEFT JOIN sessions s ON s.website_id = w.id AND s.started_at >= $1 AND s.started_at < $2
          GROUP BY w.id ORDER BY w.name`,
        [from, to]
      );
      const title = kind === 'daily' ? 'Daily' : 'Weekly';
      const lines = result.rows.length
        ? result.rows.map((row) => `${row.name} (${row.domain_name}): ${row.visitors} visitors, ${row.sessions} sessions, ${row.pageviews} pageviews`)
        : ['No websites configured.'];
      try {
        await mailer.send(`Webstat ${title} analytics report`, `${title} analytics summary (UTC)\n${from.toISOString()} – ${to.toISOString()}\n\n${lines.join('\n')}`, settings.alertEmail);
        reportRetryAt.delete(kind);
      } catch (error) {
        reportRetryAt.set(kind, Date.now() + 15 * 60_000);
        throw error;
      }
      await client.query(`UPDATE system_settings SET ${markColumn} = $1 WHERE id = 1`, [today]);
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [REPORT_LOCK]);
    }
  } finally {
    client.release();
  }
}

function utcDayStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function checkReports() {
  const settings = await systemSettings.getSettings();
  const now = new Date();
  if (now.getUTCHours() < 9 || (!settings.alertDaily && !settings.alertWeekly)) return;

  const todayStart = utcDayStart(now);
  const today = todayStart.toISOString().slice(0, 10);
  if (settings.alertDaily) {
    const from = new Date(todayStart.getTime() - 86_400_000);
    await sendReport('daily', from, todayStart, today);
  }
  if (settings.alertWeekly && now.getUTCDay() === 1) {
    const from = new Date(todayStart.getTime() - 7 * 86_400_000);
    await sendReport('weekly', from, todayStart, today);
  }
}

async function run() {
  await checkDatabaseHealth();
  await checkReports();
}

async function start() {
  await systemSettings.getSettings();
  timer = setInterval(() => run().catch((error) => console.error('[alerts]', error.message)), 60_000);
  timer.unref();
  await run();
}

function stop() {
  clearInterval(timer);
}

module.exports = { start, stop, notifyQueueFailure };
