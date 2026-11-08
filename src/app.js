require('dotenv').config();

const express = require('express');
const shortenRoutes = require('./routes/shorten.routes');
const redirectRoutes = require('./routes/redirect.routes');
const statsRoutes = require('./routes/stats.routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();

app.set('trust proxy', 1);
app.use(express.json());

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  next(err);
});

// Health check endpoint for PaaS uptime monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Ignore browser favicon requests to avoid unnecessary short-code lookups
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'URL Shortener',
    endpoints: {
      health: 'GET /health',
      shorten: 'POST /api/shorten  { "longUrl": "https://..." }',
      stats: 'GET /api/stats/:shortCode',
      redirect: 'GET /:shortCode',
    },
  });
});

app.use('/api/shorten', shortenRoutes);
app.use('/api/stats', statsRoutes);
app.use('/', redirectRoutes);

app.use(errorHandler);

module.exports = app;
