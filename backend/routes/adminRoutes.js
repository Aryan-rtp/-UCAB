/**
 * Admin Routes
 * Protected endpoints for platform administration
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getDashboard,
  getAllUsers,
  getAllDrivers,
  getAllRides,
  toggleUserStatus,
  toggleDriverVerification,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/drivers', getAllDrivers);
router.get('/rides', getAllRides);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/drivers/:id/verify', toggleDriverVerification);

module.exports = router;
