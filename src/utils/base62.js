const ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Encode a non-negative integer to a base62 string.
 * Used after INSERT so short_code is derived from BIGSERIAL id (collision-free).
 */
function toBase62(num) {
  if (num === 0) return ALPHABET[0];

  let result = '';
  let n = num;

  while (n > 0) {
    result = ALPHABET[n % 62] + result;
    n = Math.floor(n / 62);
  }

  return result;
}

module.exports = { toBase62, ALPHABET };
