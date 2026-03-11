/**
 * Fare Calculation Service
 *
 * Implements the fare formula: Fare = (Base Fare + Distance × Rate) × Surge Multiplier
 *
 * Vehicle-type pricing tiers ensure different rates for sedans, SUVs, etc.
 * Surge pricing multiplier can be applied during peak demand.
 */

// Pricing configuration per vehicle type (in ₹)
const PRICING = {
  bike: { baseFare: 20, ratePerKm: 6 },
  auto: { baseFare: 30, ratePerKm: 9 },
  hatchback: { baseFare: 40, ratePerKm: 10 },
  sedan: { baseFare: 50, ratePerKm: 12 },
  suv: { baseFare: 80, ratePerKm: 16 },
};

/**
 * Calculate fare for a ride
 * @param {number} distance - Distance in kilometers
 * @param {string} vehicleType - Type of vehicle (sedan, suv, etc.)
 * @param {number} surgeMultiplier - Surge pricing multiplier (1.0 = no surge)
 * @returns {object} Fare breakdown
 */
const calculateFare = (distance, vehicleType = 'sedan', surgeMultiplier = 1.0) => {
  const pricing = PRICING[vehicleType] || PRICING.sedan;
  const baseFare = pricing.baseFare;
  const distanceCharge = distance * pricing.ratePerKm;
  const subtotal = baseFare + distanceCharge;
  const totalFare = Math.round(subtotal * surgeMultiplier);

  return {
    baseFare,
    distanceCharge: Math.round(distanceCharge),
    surgeMultiplier,
    subtotal: Math.round(subtotal),
    totalFare,
    currency: 'INR',
  };
};

/**
 * Get fare estimates for all vehicle types
 * @param {number} distance - Distance in kilometers
 * @param {number} surgeMultiplier - Current surge multiplier
 * @returns {Array} List of fare estimates per vehicle type
 */
const getFareEstimates = (distance, surgeMultiplier = 1.0) => {
  return Object.keys(PRICING).map((type) => ({
    vehicleType: type,
    ...calculateFare(distance, type, surgeMultiplier),
  }));
};

/**
 * Calculate distance between two coordinate points using the Haversine formula
 * @param {Array} coord1 - [longitude, latitude]
 * @param {Array} coord2 - [longitude, latitude]
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const toRad = (deg) => deg * (Math.PI / 180);

module.exports = { calculateFare, getFareEstimates, calculateDistance, PRICING };
