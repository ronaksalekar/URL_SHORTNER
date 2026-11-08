const pool = require('../db/pool');
const { toBase62 } = require('../utils/base62');

async function createUrl(longUrl, expiresAt = null) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: idRows } = await client.query(
      "SELECT nextval(pg_get_serial_sequence('urls', 'id'))::bigint AS next_id"
    );
    const nextId = idRows[0].next_id;
    const shortCode = toBase62(Number(nextId));

    const { rows } = await client.query(
      `INSERT INTO urls (id, short_code, long_url, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, short_code, long_url, created_at, expires_at, is_active`,
      [nextId, shortCode, longUrl, expiresAt]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function findByShortCode(shortCode) {
  const { rows } = await pool.query(
    `SELECT id, short_code, long_url, created_at, expires_at, is_active
     FROM urls
     WHERE short_code = $1`,
    [shortCode]
  );
  return rows[0] || null;
}

async function findActiveByShortCode(shortCode) {
  const { rows } = await pool.query(
    `SELECT id, short_code, long_url, created_at, expires_at, is_active
     FROM urls
     WHERE short_code = $1
       AND is_active = true
       AND (expires_at IS NULL OR expires_at > now())`,
    [shortCode]
  );
  return rows[0] || null;
}

module.exports = {
  createUrl,
  findByShortCode,
  findActiveByShortCode,
};
