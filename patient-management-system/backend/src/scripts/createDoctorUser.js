import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import bcrypt from 'bcryptjs';
import { pool } from '../db/index.js';

const rl = readline.createInterface({ input, output });
try {
  const fullName = (await rl.question('Doctor full name: ')).trim();
  const email = (await rl.question('Doctor login email: ')).trim().toLowerCase();
  const password = await rl.question('Temporary password (min 12 characters): ');
  if (!fullName || !email.includes('@') || password.length < 12) {
    throw new Error('Enter a name, a valid email and a password of at least 12 characters.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'doctor')`,
    [fullName, email, passwordHash]
  );
  console.log(`Doctor login created for ${email}.`);
} catch (error) {
  if (error.code === '23505') console.error('A user with that email already exists.');
  else console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await pool.end();
}
