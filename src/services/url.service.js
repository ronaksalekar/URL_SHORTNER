const urlRepository = require('../repositories/url.repository');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Validates that a string is a well-formed http/https URL.
 * Rejects dangerous schemes (javascript:, data:, etc.).
 */
function validateLongUrl(longUrl) {
  if (typeof longUrl !== 'string') {
    return { valid: false, error: 'longUrl must be a string' };
  }

  const trimmed = longUrl.trim();
  if (!trimmed) {
    return { valid: false, error: 'longUrl is required' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: 'longUrl must be a valid URL' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return {
      valid: false,
      error: 'longUrl must use http or https protocol',
    };
  }

  if (!parsed.hostname) {
    return { valid: false, error: 'longUrl must include a valid hostname' };
  }

  return { valid: true, url: parsed.href };
}

async function shortenUrl(longUrl, expiresAt = null) {
  const validation = validateLongUrl(longUrl);
  if (!validation.valid) {
    throw new AppError(validation.error, 400);
  }

  const row = await urlRepository.createUrl(validation.url, expiresAt);
  return row;
}

function isUrlExpired(url) {
  if (!url.expires_at) return false;
  return new Date(url.expires_at) <= new Date();
}

function isUrlAvailable(url) {
  return url.is_active && !isUrlExpired(url);
}

async function resolveRedirect(shortCode) {
  const url = await urlRepository.findByShortCode(shortCode);

  if (!url) {
    throw new AppError('Short URL not found', 404);
  }

  if (!url.is_active || isUrlExpired(url)) {
    throw new AppError('Short URL is no longer available', 410);
  }

  return url;
}

module.exports = {
  AppError,
  validateLongUrl,
  shortenUrl,
  resolveRedirect,
  isUrlAvailable,
};
