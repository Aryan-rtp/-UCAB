/**
 * Admin Controller
 * Provides admin-only endpoints for platform management and analytics.
 */

const User = require('../models/User');
const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');

/**
 * GET /api/admin/dashboard
 * Returns analytics summary cards for the admin dashboard
 */
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDrivers,
      totalRides,
      completedRides,
      cancelledRides,
      activeRides,
      revenueResult,
      recentRides,
    ] = await Promise.all([
      User.countDocuments({ role: 'rider' }),
      Driver.countDocuments(),
      Ride.countDocuments(),
      Ride.countDocuments({ rideStatus: 'completed' }),
      Ride.countDocuments({ rideStatus: 'cancelled' }),
      Ride.countDocuments({ rideStatus: { $in: ['requested', 'accepted', 'started'] } }),
      Payment.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Ride.find()
        .populate('userId', 'name email')
        .populate('driverId', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalDrivers,
          totalRides,
          completedRides,
          cancelledRides,
          activeRides,
          totalRevenue,
        },
        recentRides,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Get all users with pagination
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/drivers
 * Get all drivers with pagination
 */
const getAllDrivers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      Driver.find()
        .populate('vehicle')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Driver.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: drivers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/rides
 * Get all rides with pagination and optional status filter
 */
const getAllRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const filter = {};
    if (status) filter.rideStatus = status;

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate('userId', 'name email phone')
        .populate('driverId', 'name email phone')
        .populate('paymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ride.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: rides,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/users/:id/toggle
 * Activate or deactivate a user
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/drivers/:id/verify
 * Verify or unverify a driver
 */
const toggleDriverVerification = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    driver.isVerified = !driver.isVerified;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver ${driver.isVerified ? 'verified' : 'unverified'}`,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getAllDrivers,
  getAllRides,
  toggleUserStatus,
  toggleDriverVerification,
};
