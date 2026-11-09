import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../db/index.js';
import { migrate } from 'postgres-migrations';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const client = await pool.connect();
  try {
    await migrate({ client }, path.join(__dirname, '../migrations'));
    console.log('Database migrations completed successfully.');
  } finally {
    client.release();
  }
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
