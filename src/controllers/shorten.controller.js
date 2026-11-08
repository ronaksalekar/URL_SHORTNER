const urlService = require('../services/url.service');

async function shorten(req, res, next) {
  try {
    const expiresAt = req.body.expiresAt || null;
    const row = await urlService.shortenUrl(req.validatedLongUrl, expiresAt);

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const shortUrl = `${baseUrl}/${row.short_code}`;

    res.set('Location', shortUrl);
    return res.status(201).json({
      shortCode: row.short_code,
      shortUrl,
      longUrl: row.long_url,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { shorten };
