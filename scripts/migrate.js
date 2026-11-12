'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL tanımlı değil');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8'));
  await client.end();
  console.log('Şema uygulandı.');
})().catch((e) => { console.error(e.message); process.exit(1); });
