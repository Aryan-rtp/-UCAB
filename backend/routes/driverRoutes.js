/**
 * Driver Routes
 * Endpoints for driver-specific operations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getRideRequests,
  acceptRide,
  rejectRide,
  updateLocation,
  getEarnings,
} = require('../controllers/driverController');

// All driver routes require authentication + driver role
router.use(protect, authorize('driver'));

router.get('/requests', getRideRequests);
router.post('/accept', acceptRide);
router.post('/reject', rejectRide);
router.put('/location', updateLocation);
router.get('/earnings', getEarnings);

module.exports = router;
