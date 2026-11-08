const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || '';
const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

// Configure SSL dynamically for cloud databases (e.g. Railway, Neon, Supabase)
let sslOption = false;
if (process.env.DATABASE_SSL === 'true') {
  sslOption = { rejectUnauthorized: false };
} else if (process.env.DATABASE_SSL === 'false') {
  sslOption = false;
} else if (isProduction && !isLocalhost && !databaseUrl.includes('postgres.railway.internal')) {
  sslOption = { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslOption,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
