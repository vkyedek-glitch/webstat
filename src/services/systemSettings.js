'use strict';
const crypto = require('crypto');
const pool = require('../db');
const config = require('../config');

const key = Buffer.from(config.settingsEncryptionKey, 'hex');
let cached = null;

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64')).join('.');
}

function decrypt(value) {
  if (!value) return '';
  const [iv, tag, ciphertext] = value.split('.').map((part) => Buffer.from(part, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

function publicSettings(row, hasPassword = Boolean(row.smtp_password_enc)) {
  return {
    publicUrl: row.public_url,
    smtpHost: row.smtp_host || '',
    smtpPort: row.smtp_port,
    smtpSecure: row.smtp_secure,
    smtpUser: row.smtp_user || '',
    smtpFrom: row.smtp_from || '',
    alertEmail: row.alert_email || '',
    alertDaily: row.alert_daily,
    alertWeekly: row.alert_weekly,
    alertQueueErrors: row.alert_queue_errors,
    alertServiceHealth: row.alert_service_health,
    hasSmtpPassword: hasPassword,
    updatedAt: row.updated_at,
  };
}

async function getRow() {
  const result = await pool.query('SELECT * FROM system_settings WHERE id = 1');
  if (result.rowCount) {
    cached = result.rows[0];
    return cached;
  }
  const inserted = await pool.query(
    'INSERT INTO system_settings (id, public_url) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET id = 1 RETURNING *',
    [config.publicUrl]
  );
  cached = inserted.rows[0];
  return cached;
}

async function getSettings({ allowCached = false } = {}) {
  if (allowCached && cached) return publicSettings(cached);
  return publicSettings(await getRow());
}

async function getMailConfig({ allowCached = false } = {}) {
  const row = allowCached && cached ? cached : await getRow();
  return {
    ...publicSettings(row),
    smtpPassword: decrypt(row.smtp_password_enc),
  };
}

async function saveSettings(input) {
  const current = await getRow();
  const encryptedPassword = input.clearSmtpPassword
    ? null
    : (input.smtpPassword ? encrypt(input.smtpPassword) : current.smtp_password_enc);
  const result = await pool.query(
    `INSERT INTO system_settings (
       id, public_url, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_enc,
       smtp_from, alert_email, alert_daily, alert_weekly, alert_queue_errors, alert_service_health, updated_at
     ) VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
     ON CONFLICT (id) DO UPDATE SET
       public_url = EXCLUDED.public_url, smtp_host = EXCLUDED.smtp_host, smtp_port = EXCLUDED.smtp_port,
       smtp_secure = EXCLUDED.smtp_secure, smtp_user = EXCLUDED.smtp_user,
       smtp_password_enc = EXCLUDED.smtp_password_enc, smtp_from = EXCLUDED.smtp_from,
       alert_email = EXCLUDED.alert_email, alert_daily = EXCLUDED.alert_daily,
       alert_weekly = EXCLUDED.alert_weekly, alert_queue_errors = EXCLUDED.alert_queue_errors,
       alert_service_health = EXCLUDED.alert_service_health, updated_at = now()
     RETURNING *`,
    [input.publicUrl, input.smtpHost || null, input.smtpPort, input.smtpSecure, input.smtpUser || null,
      encryptedPassword, input.smtpFrom || null, input.alertEmail || null, input.alertDaily,
      input.alertWeekly, input.alertQueueErrors, input.alertServiceHealth]
  );
  cached = result.rows[0];
  return publicSettings(cached);
}

module.exports = { getSettings, getMailConfig, saveSettings, publicSettings };
