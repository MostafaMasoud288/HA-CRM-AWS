/**
 * server.js — CRM Express Server
 * Reads env from K8s ConfigMap + Secret
 */

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const { pingWriter, pingReader } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (simple)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/contacts', require('./routes/contacts'));

// ── Health & Readiness probes (for K8s) ─────────────────────────────────────
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/readyz', async (_req, res) => {
  try {
    await Promise.all([pingWriter(), pingReader()]);
    res.json({ status: 'ready', writer: 'ok', reader: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

// ── Serve React build (static) ───────────────────────────────────────────────
const staticPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(staticPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  CRM Backend running on port ${PORT}`);
  console.log(`📝  Writer: ${process.env.DB_WRITER_HOST}`);
  console.log(`📖  Reader: ${process.env.DB_READER_HOST}`);
  console.log(`🗄️   DB:     ${process.env.DB_NAME}\n`);
});
