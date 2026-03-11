/**
 * Ride Controller
 * Manages the full ride lifecycle: booking, tracking, cancellation, completion.
 * Integrates fareCalculationService and rideMatchingService for business logic.
 */

const Ride = require('../models/Ride');
const { calculateFare, getFareEstimates, calculateDistance } = require('../services/fareCalculationService');
const { assignDriver, releaseDriver } = require('../services/rideMatchingService');

/**
 * POST /api/rides/book
 * Book a new ride
 */
const bookRide = async (req, res, next) => {
  try {
    const {
      pickupAddress,
      pickupCoordinates,
      dropAddress,
      dropCoordinates,
      vehicleType,
    } = req.body;

    // Validate inputs
    if (!pickupAddress || !pickupCoordinates || !dropAddress || !dropCoordinates) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and drop locations are required',
      });
    }

    // Calculate distance and fare
    const distance = calculateDistance(pickupCoordinates, dropCoordinates);
    if (distance < 0.1) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and drop locations are too close',
      });
    }

    const surgeMultiplier = 1.0; // Can be dynamic based on demand
    const fareDetails = calculateFare(distance, vehicleType, surgeMultiplier);

    // Try to assign a driver
    const driver = await assignDriver(pickupCoordinates, vehicleType);

    // Create the ride
    const ride = await Ride.create({
      userId: req.user._id,
      driverId: driver ? driver._id : null,
      pickupLocation: {
        address: pickupAddress,
        coordinates: pickupCoordinates,
      },
      dropLocation: {
        address: dropAddress,
        coordinates: dropCoordinates,
      },
      distance,
      fare: fareDetails.totalFare,
      surgeMultiplier,
      vehicleType: vehicleType || 'sedan',
      rideStatus: driver ? 'accepted' : 'requested',
    });

    // Populate driver details in response
    const populatedRide = await Ride.findById(ride._id)
      .populate('userId', 'name email phone')
      .populate({
        path: 'driverId',
        select: 'name email phone rating vehicle currentLocation',
        populate: { path: 'vehicle', select: 'make model color plateNumber vehicleType' },
      });

    // Emit socket event for real-time updates
    if (req.io && driver) {
      req.io.to(`driver_${driver._id}`).emit('newRideRequest', populatedRide);
      req.io.to(`user_${req.user._id}`).emit('rideBooked', populatedRide);
    }

    res.status(201).json({
      success: true,
      message: driver
        ? 'Ride booked — driver assigned'
        : 'Ride booked — searching for drivers',
      data: {
        ride: populatedRide,
        fareDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rides/estimate
 * Get fare estimates without booking
 */
const getFareEstimate = async (req, res, next) => {
  try {
    const { pickupCoordinates, dropCoordinates } = req.query;

    if (!pickupCoordinates || !dropCoordinates) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and drop coordinates are required',
      });
    }

    const pickup = pickupCoordinates.split(',').map(Number);
    const drop = dropCoordinates.split(',').map(Number);
    const distance = calculateDistance(pickup, drop);
    const estimates = getFareEstimates(distance);

    res.status(200).json({
      success: true,
      data: { distance, estimates },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rides/:id
 * Get a single ride by ID
 */
const getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate({
        path: 'driverId',
        select: 'name email phone rating vehicle currentLocation',
        populate: { path: 'vehicle', select: 'make model color plateNumber vehicleType' },
      })
      .populate('paymentId');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/rides
 * Get ride history for the authenticated user (with pagination)
 */
const getUserRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      Ride.find({ userId: req.user._id })
        .populate({
          path: 'driverId',
          select: 'name phone rating vehicle',
          populate: { path: 'vehicle', select: 'make model color plateNumber' },
        })
        .populate('paymentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Ride.countDocuments({ userId: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: rides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rides/cancel
 * Cancel a ride
 */
const cancelRide = async (req, res, next) => {
  try {
    const { rideId, reason } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (['completed', 'cancelled'].includes(ride.rideStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ride that is already ${ride.rideStatus}`,
      });
    }

    ride.rideStatus = 'cancelled';
    ride.cancelledBy = req.user.role === 'driver' ? 'driver' : 'rider';
    ride.cancelReason = reason || '';
    ride.endTime = new Date();
    await ride.save();

    // Release the driver back to available pool
    if (ride.driverId) {
      await releaseDriver(ride.driverId);
    }

    // Emit socket event
    if (req.io) {
      req.io.to(`ride_${rideId}`).emit('rideCancelled', ride);
    }

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully',
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rides/start
 * Driver starts the ride
 */
const startRide = async (req, res, next) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.rideStatus !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Ride must be in accepted status to start',
      });
    }

    ride.rideStatus = 'started';
    ride.startTime = new Date();
    await ride.save();

    if (req.io) {
      req.io.to(`ride_${rideId}`).emit('rideStarted', ride);
    }

    res.status(200).json({
      success: true,
      message: 'Ride started',
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rides/complete
 * Driver completes the ride
 */
const completeRide = async (req, res, next) => {
  try {
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.rideStatus !== 'started') {
      return res.status(400).json({
        success: false,
        message: 'Ride must be in started status to complete',
      });
    }

    ride.rideStatus = 'completed';
    ride.endTime = new Date();
    await ride.save();

    // Release driver
    if (ride.driverId) {
      await releaseDriver(ride.driverId);

      // Update driver stats
      const Driver = require('../models/Driver');
      await Driver.findByIdAndUpdate(ride.driverId, {
        $inc: { totalRides: 1, totalEarnings: ride.fare },
      });
    }

    if (req.io) {
      req.io.to(`ride_${rideId}`).emit('rideCompleted', ride);
    }

    res.status(200).json({
      success: true,
      message: 'Ride completed',
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookRide,
  getFareEstimate,
  getRide,
  getUserRides,
  cancelRide,
  startRide,
  completeRide,
};
