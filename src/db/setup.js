import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from '#src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log(`✅ Schema applied to: ${new URL(process.env.DATABASE_URL).pathname.slice(1)}`);
  await pool.end();
}

setup().catch((err) => {
  console.error(err);
  process.exit(1);
});