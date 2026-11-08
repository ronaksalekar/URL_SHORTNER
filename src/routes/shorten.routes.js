const express = require('express');
const { shorten } = require('../controllers/shorten.controller');
const { validateUrlBody } = require('../middleware/validateUrl.middleware');
const { shortenLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.post('/', shortenLimiter, validateUrlBody, shorten);

module.exports = router;
