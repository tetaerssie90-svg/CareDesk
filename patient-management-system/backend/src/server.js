import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase, pool } from './db/index.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) { next(error); }
});
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;
try {
  const database = await connectDatabase();
  console.log(`PostgreSQL connected: ${database}`);
  app.listen(port, () => console.log(`Patient Management API listening on port ${port}`));
} catch (error) {
  console.error('PostgreSQL connection failed:', error.message);
  process.exit(1);
}

process.on('SIGTERM', async () => { await pool.end(); process.exit(0); });
