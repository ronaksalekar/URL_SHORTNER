const express = require('express');
const { redirect } = require('../controllers/redirect.controller');

const router = express.Router();

router.get('/:shortCode', redirect);

module.exports = router;
