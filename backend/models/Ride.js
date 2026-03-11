/**
 * Ride Model
 * Represents a cab ride from pickup to drop.
 * Relationships:
 *   User → Ride (Many-to-One via userId)
 *   Driver → Ride (Many-to-One via driverId)
 *   Ride → Payment (One-to-One via paymentId)
 *
 * Ride Status Lifecycle: requested → accepted → started → completed | cancelled
 */

const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup address is required'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Pickup coordinates are required'],
      },
    },
    dropLocation: {
      address: {
        type: String,
        required: [true, 'Drop address is required'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Drop coordinates are required'],
      },
    },
    distance: {
      type: Number, // in kilometers
      required: [true, 'Distance is required'],
      min: [0.1, 'Distance must be at least 0.1 km'],
    },
    fare: {
      type: Number,
      required: [true, 'Fare is required'],
      min: [0, 'Fare cannot be negative'],
    },
    surgeMultiplier: {
      type: Number,
      default: 1.0,
      min: 1.0,
      max: 5.0,
    },
    vehicleType: {
      type: String,
      enum: ['sedan', 'suv', 'hatchback', 'auto', 'bike'],
      default: 'sedan',
    },
    rideStatus: {
      type: String,
      enum: ['requested', 'accepted', 'started', 'completed', 'cancelled'],
      default: 'requested',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ['rider', 'driver', 'system', null],
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
rideSchema.index({ userId: 1, createdAt: -1 });
rideSchema.index({ driverId: 1, createdAt: -1 });
rideSchema.index({ rideStatus: 1 });
rideSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);
