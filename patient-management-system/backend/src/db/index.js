import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing. Configure backend/.env first.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

export const query = (text, params = []) => pool.query(text, params);
export const connectDatabase = async () => {
  const result = await pool.query('SELECT current_database() AS database');
  return result.rows[0].database;
};
