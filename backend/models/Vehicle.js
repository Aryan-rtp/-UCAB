/**
 * Vehicle Model
 * Represents a vehicle assigned to a driver.
 * Relationship: Driver → Vehicle (One-to-One)
 */

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
      unique: true, // Enforces one-to-one relationship
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
      min: [2000, 'Vehicle must be year 2000 or newer'],
    },
    color: {
      type: String,
      required: [true, 'Vehicle color is required'],
      trim: true,
    },
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      enum: ['sedan', 'suv', 'hatchback', 'auto', 'bike'],
      default: 'sedan',
    },
    capacity: {
      type: Number,
      default: 4,
      min: 1,
      max: 8,
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index({ driver: 1 });
vehicleSchema.index({ plateNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
