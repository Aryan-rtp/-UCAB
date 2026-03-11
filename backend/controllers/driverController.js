/**
 * Driver Controller
 * Handles driver-specific operations: viewing ride requests,
 * accepting/rejecting rides, updating location, and viewing earnings.
 */

const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const { releaseDriver } = require('../services/rideMatchingService');

/**
 * GET /api/driver/requests
 * Get pending ride requests assigned to this driver
 */
const getRideRequests = async (req, res, next) => {
  try {
    const driverId = req.driver._id;

    const requests = await Ride.find({
      driverId,
      rideStatus: { $in: ['requested', 'accepted'] },
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/driver/accept
 * Accept a ride request
 */
const acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.rideStatus !== 'requested') {
      return res.status(400).json({
        success: false,
        message: 'Ride is no longer in requested status',
      });
    }

    ride.driverId = req.driver._id;
    ride.rideStatus = 'accepted';
    await ride.save();

    // Mark driver as unavailable
    await Driver.findByIdAndUpdate(req.driver._id, { isAvailable: false });

    const populatedRide = await Ride.findById(rideId)
      .populate('userId', 'name email phone')
      .populate({
        path: 'driverId',
        select: 'name phone rating vehicle currentLocation',
        populate: { path: 'vehicle', select: 'make model color plateNumber vehicleType' },
      });

    if (req.io) {
      req.io.to(`user_${ride.userId}`).emit('rideAccepted', populatedRide);
      req.io.to(`ride_${rideId}`).emit('rideAccepted', populatedRide);
    }

    res.status(200).json({
      success: true,
      message: 'Ride accepted',
      data: populatedRide,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/driver/reject
 * Reject a ride request
 */
const rejectRide = async (req, res, next) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    // Remove this driver from the ride and set back to requested
    ride.driverId = null;
    ride.rideStatus = 'requested';
    await ride.save();

    // Release the driver
    await releaseDriver(req.driver._id);

    if (req.io) {
      req.io.to(`user_${ride.userId}`).emit('rideRejected', {
        rideId,
        message: 'Driver unavailable — searching for another driver',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ride rejected — will be reassigned',
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/driver/location
 * Update driver's current location
 */
const updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body; // [longitude, latitude]

    if (!coordinates || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Valid coordinates [longitude, latitude] are required',
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.driver._id,
      {
        currentLocation: {
          type: 'Point',
          coordinates,
        },
      },
      { new: true }
    );

    // Broadcast location to active ride participants
    if (req.io) {
      req.io.to(`driver_${driver._id}`).emit('locationUpdated', {
        driverId: driver._id,
        coordinates,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated',
      data: { coordinates },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/driver/earnings
 * Get driver's earnings summary and ride history
 */
const getEarnings = async (req, res, next) => {
  try {
    const driverId = req.driver._id;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [rides, total, driver] = await Promise.all([
      Ride.find({ driverId, rideStatus: 'completed' })
        .populate('userId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ride.countDocuments({ driverId, rideStatus: 'completed' }),
      Driver.findById(driverId).select('totalRides totalEarnings rating'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRides: driver.totalRides,
          totalEarnings: driver.totalEarnings,
          rating: driver.rating,
        },
        rides,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRideRequests,
  acceptRide,
  rejectRide,
  updateLocation,
  getEarnings,
};
