const pool = require('../db/pool');

async function recordClick(urlId, { referrer, ipAddress, userAgent }) {
  await pool.query(
    `INSERT INTO clicks (url_id, referrer, ip_address, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [urlId, referrer || null, ipAddress || null, userAgent || null]
  );
}

async function getTotalClicks(urlId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM clicks WHERE url_id = $1',
    [urlId]
  );
  return rows[0].total;
}

async function getClicksByDay(urlId) {
  const { rows } = await pool.query(
    `SELECT DATE(clicked_at AT TIME ZONE 'UTC') AS date,
            COUNT(*)::int AS count
     FROM clicks
     WHERE url_id = $1
     GROUP BY DATE(clicked_at AT TIME ZONE 'UTC')
     ORDER BY date DESC`,
    [urlId]
  );
  return rows;
}

async function getReferrerBreakdown(urlId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(referrer, 'direct') AS referrer,
            COUNT(*)::int AS count
     FROM clicks
     WHERE url_id = $1
     GROUP BY COALESCE(referrer, 'direct')
     ORDER BY count DESC`,
    [urlId]
  );
  return rows;
}

module.exports = {
  recordClick,
  getTotalClicks,
  getClicksByDay,
  getReferrerBreakdown,
};
