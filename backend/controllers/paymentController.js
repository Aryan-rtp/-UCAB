/**
 * Payment Controller
 * Handles payment processing for completed rides
 * and payment history retrieval.
 */

const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/payments/process
 * Process payment for a completed ride
 */
const processPayment = async (req, res, next) => {
  try {
    const { rideId, paymentMethod } = req.body;

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: 'Ride ID is required',
      });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (ride.rideStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be processed for completed rides',
      });
    }

    // Check if payment already exists
    if (ride.paymentId) {
      const existingPayment = await Payment.findById(ride.paymentId);
      if (existingPayment && existingPayment.paymentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Payment already processed for this ride',
        });
      }
    }

    // Create payment record
    // In production, this would integrate with a payment gateway (Razorpay, Stripe, etc.)
    const payment = await Payment.create({
      rideId: ride._id,
      userId: ride.userId,
      driverId: ride.driverId,
      amount: ride.fare,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'completed',
      transactionId: `TXN_${uuidv4().split('-')[0].toUpperCase()}`,
    });

    // Link payment to ride
    ride.paymentId = payment._id;
    await ride.save();

    if (req.io) {
      req.io.to(`ride_${rideId}`).emit('paymentProcessed', payment);
    }

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/history
 * Get payment history for the authenticated user
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = req.user.role === 'driver'
      ? { driverId: req.user._id }
      : { userId: req.user._id };

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate({
          path: 'rideId',
          select: 'pickupLocation dropLocation distance fare rideStatus createdAt',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
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

module.exports = { processPayment, getPaymentHistory };
