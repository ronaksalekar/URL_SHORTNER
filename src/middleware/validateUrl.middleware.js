const { validateLongUrl } = require('../services/url.service');

/**
 * Ensures POST /api/shorten body contains a parseable longUrl field.
 * Structural problems → 400. Semantically invalid URL → 400 (per spec).
 */
function validateUrlBody(req, res, next) {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }

  const { longUrl } = req.body;

  if (longUrl === undefined || longUrl === null) {
    return res.status(400).json({ error: 'longUrl is required' });
  }

  const result = validateLongUrl(longUrl);
  if (!result.valid) {
    return res.status(400).json({ error: result.error });
  }

  req.validatedLongUrl = result.url;
  next();
}

module.exports = { validateUrlBody };
