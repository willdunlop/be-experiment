const express = require('express');
const router = express.Router();

// const users = require('./users');

router.use('/users', require('./users'));

module.exports = router;