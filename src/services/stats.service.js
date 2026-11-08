const urlRepository = require('../repositories/url.repository');
const clickRepository = require('../repositories/click.repository');
const { AppError } = require('./url.service');

async function getStatsForShortCode(shortCode) {
  const url = await urlRepository.findByShortCode(shortCode);

  if (!url) {
    throw new AppError('Short URL not found', 404);
  }

  const [totalClicks, clicksByDay, referrers] = await Promise.all([
    clickRepository.getTotalClicks(url.id),
    clickRepository.getClicksByDay(url.id),
    clickRepository.getReferrerBreakdown(url.id),
  ]);

  return {
    shortCode: url.short_code,
    longUrl: url.long_url,
    createdAt: url.created_at,
    expiresAt: url.expires_at,
    isActive: url.is_active,
    totalClicks,
    clicksByDay,
    referrers,
  };
}

module.exports = { getStatsForShortCode };
