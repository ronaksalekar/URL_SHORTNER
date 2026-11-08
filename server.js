require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/db/pool');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`URL shortener listening on port ${PORT}`);
});

// Graceful shutdown handling for Railway / container lifecycle events
function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await pool.end();
      console.log('PostgreSQL pool drained.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database pool shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown if cleanup takes longer than 10 seconds
  setTimeout(() => {
    console.error('Forcefully shutting down due to timeout.');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
