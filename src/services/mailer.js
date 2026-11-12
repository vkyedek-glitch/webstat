'use strict';
const nodemailer = require('nodemailer');
const systemSettings = require('./systemSettings');

function createTransport(settings) {
  if (!settings.smtpHost || !settings.smtpFrom || !settings.smtpPort) {
    throw new Error('SMTP host, port and sender address must be configured');
  }
  const options = {
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  };
  if (settings.smtpUser) options.auth = { user: settings.smtpUser, pass: settings.smtpPassword };
  return nodemailer.createTransport(options);
}

async function send(subject, text, recipient, { allowCached = false } = {}) {
  const settings = await systemSettings.getMailConfig({ allowCached });
  if (!recipient) throw new Error('Recipient email is not configured');
  const transport = createTransport(settings);
  try {
    await transport.sendMail({ from: settings.smtpFrom, to: recipient, subject, text });
  } finally {
    transport.close();
  }
}

async function testConnection() {
  const settings = await systemSettings.getMailConfig();
  const transport = createTransport(settings);
  try {
    await transport.verify();
    return settings;
  } finally {
    transport.close();
  }
}

module.exports = { send, testConnection };
