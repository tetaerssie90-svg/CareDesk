import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';
import { pool } from '../db/index.js';

const rl = readline.createInterface({ input, output });
try {
  const email = (await rl.question('Administrator email: ')).trim().toLowerCase();
  const password = await rl.question('Administrator password (min 12 characters): ');
  if (!email.includes('@') || password.length < 12) {
    throw new Error('Enter a valid email and a password of at least 12 characters.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ['System Administrator', email, passwordHash]
  );
  console.log('Admin account created (or already existed).');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await pool.end();
}
