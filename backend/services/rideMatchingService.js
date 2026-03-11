/**
 * Ride Matching Service
 *
 * Implements the driver matching algorithm:
 * 1. Find available drivers within a search radius
 * 2. Sort by proximity to pickup location
 * 3. Assign the nearest driver
 *
 * Uses MongoDB 2dsphere geospatial queries for efficient location-based search.
 */

const Driver = require('../models/Driver');

// Maximum search radius in meters (10 km)
const MAX_SEARCH_RADIUS = 10000;

/**
 * Find available drivers near a pickup location
 * @param {Array} pickupCoordinates - [longitude, latitude]
 * @param {string} vehicleType - Desired vehicle type
 * @param {number} maxDistance - Search radius in meters
 * @returns {Array} List of available drivers sorted by proximity
 */
const findNearbyDrivers = async (
  pickupCoordinates,
  vehicleType = null,
  maxDistance = MAX_SEARCH_RADIUS
) => {
  const query = {
    isAvailable: true,
    isActive: true,
    isVerified: true,
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: pickupCoordinates,
        },
        $maxDistance: maxDistance,
      },
    },
  };

  // Filter by vehicle type if specified
  let drivers = await Driver.find(query)
    .populate('vehicle')
    .limit(20)
    .lean();

  if (vehicleType) {
    drivers = drivers.filter(
      (d) => d.vehicle && d.vehicle.vehicleType === vehicleType
    );
  }

  return drivers;
};

/**
 * Assign the nearest available driver to a ride
 * @param {Array} pickupCoordinates - [longitude, latitude]
 * @param {string} vehicleType - Desired vehicle type
 * @returns {object|null} The assigned driver or null if none found
 */
const assignDriver = async (pickupCoordinates, vehicleType = null) => {
  const drivers = await findNearbyDrivers(pickupCoordinates, vehicleType);

  if (drivers.length === 0) {
    return null;
  }

  // The $near query already sorts by proximity, so first result is nearest
  const nearestDriver = drivers[0];

  // Mark the driver as unavailable
  await Driver.findByIdAndUpdate(nearestDriver._id, { isAvailable: false });

  return nearestDriver;
};

/**
 * Release a driver (mark as available again)
 * Called when a ride is completed or cancelled
 * @param {string} driverId
 */
const releaseDriver = async (driverId) => {
  await Driver.findByIdAndUpdate(driverId, { isAvailable: true });
};

module.exports = { findNearbyDrivers, assignDriver, releaseDriver };
