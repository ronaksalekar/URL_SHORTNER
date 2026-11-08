const statsService = require('../services/stats.service');

async function getStats(req, res, next) {
  try {
    const { shortCode } = req.params;
    const stats = await statsService.getStatsForShortCode(shortCode);
    return res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
