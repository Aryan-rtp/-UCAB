/**
 * User Routes
 * User profile and ride history
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/authController');
const { getUserRides } = require('../controllers/rideController');

router.use(protect);

router.get('/profile', getProfile);
router.get('/rides', getUserRides);

module.exports = router;
