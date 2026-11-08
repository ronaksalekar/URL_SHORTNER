const urlService = require('../services/url.service');
const clickRepository = require('../repositories/click.repository');

async function redirect(req, res, next) {
  try {
    const { shortCode } = req.params;
    const url = await urlService.resolveRedirect(shortCode);

    await clickRepository.recordClick(url.id, {
      referrer: req.get('referer') || null,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null,
    });

    return res.redirect(302, url.long_url);
  } catch (err) {
    next(err);
  }
}

module.exports = { redirect };
