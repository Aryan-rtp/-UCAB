/**
 * Authentication Routes
 * POST /api/auth/register - Register user or driver
 * POST /api/auth/login    - Login user or driver
 */

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
