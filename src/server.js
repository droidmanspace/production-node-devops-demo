import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import pg from 'pg';
import { createClient } from 'redis';

const { Pool } = pg;
const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const port = Number(process.env.PORT || 3000);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL });

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(pinoHttp({ logger }));

app.get('/health/live', (_req, res) => res.status(200).json({ status: 'ok' }));

app.get('/health/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    if (!redis.isReady) throw new Error('redis not ready');
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: error.message });
  }
});

app.get('/api/v1/stats', async (_req, res) => {
  const cached = await redis.get('demo:stats');
  if (cached) return res.json({ ...JSON.parse(cached), source: 'redis' });
  const { rows } = await pool.query('SELECT COUNT(*)::int AS visits FROM visits');
  const payload = { visits: rows[0].visits, source: 'postgres' };
  await redis.setEx('demo:stats', 30, JSON.stringify(payload));
  res.json(payload);
});

app.post('/api/v1/visits', async (_req, res) => {
  await pool.query('INSERT INTO visits DEFAULT VALUES');
  await redis.del('demo:stats');
  res.status(201).json({ created: true });
});

app.use((_req, res) => res.status(404).json({ error: 'not_found' }));
app.use((err, _req, res, _next) => {
  logger.error({ err }, 'unhandled request error');
  res.status(500).json({ error: 'internal_server_error' });
});

async function start() {
  await pool.query('CREATE TABLE IF NOT EXISTS visits (id BIGSERIAL PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  await redis.connect();
  app.listen(port, '0.0.0.0', () => logger.info({ port }, 'api started'));
}

if (process.env.NODE_ENV !== 'test') start().catch(error => { logger.fatal({ err: error }, 'startup failed'); process.exit(1); });

export default app;
