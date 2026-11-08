const test = require('node:test');
const assert = require('node:assert/strict');
const { toBase62, ALPHABET } = require('../../src/utils/base62');
const { validateLongUrl } = require('../../src/services/url.service');

test('Base62 encoding tests', async (t) => {
  await t.test('encodes 0 correctly', () => {
    assert.equal(toBase62(0), ALPHABET[0]);
  });

  await t.test('encodes single digits correctly', () => {
    assert.equal(toBase62(1), ALPHABET[1]);
    assert.equal(toBase62(61), ALPHABET[61]);
  });

  await t.test('encodes multi-character values', () => {
    assert.equal(toBase62(62), `${ALPHABET[1]}${ALPHABET[0]}`);
    assert.equal(toBase62(123456), 'Gho');
  });
});

test('URL validation tests', async (t) => {
  await t.test('accepts valid https URLs', () => {
    const res = validateLongUrl('https://example.com/some/path?param=1');
    assert.equal(res.valid, true);
    assert.equal(res.url, 'https://example.com/some/path?param=1');
  });

  await t.test('rejects non-http/https protocols', () => {
    const res = validateLongUrl('javascript:alert(1)');
    assert.equal(res.valid, false);
    assert.match(res.error, /http or https/);
  });

  await t.test('rejects empty or whitespace URLs', () => {
    const res = validateLongUrl('   ');
    assert.equal(res.valid, false);
  });
});
