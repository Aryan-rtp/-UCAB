/**
 * Ride Routes
 * All ride-related endpoints for riders
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  bookRide,
  getFareEstimate,
  getRide,
  getUserRides,
  cancelRide,
  startRide,
  completeRide,
} = require('../controllers/rideController');

// All ride routes require authentication
router.use(protect);

router.post('/book', bookRide);
router.get('/estimate', getFareEstimate);
router.get('/history', getUserRides);
router.get('/:id', getRide);
router.post('/cancel', cancelRide);
router.post('/start', startRide);
router.post('/complete', completeRide);

module.exports = router;
