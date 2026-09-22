/**
 * Calculate total rental price based on pricing schema, rental type, and quantity.
 * @param {Object} pricing - { hour, day, week, month, year }
 * @param {'hour'|'day'|'week'|'month'|'year'} rentalType
 * @param {number} durationUnits - duration in selected units
 * @param {number} quantity - number of vehicles
 * @returns {number}
 */
const calculatePrice = (pricing, rentalType, durationUnits, quantity) => {
  const rate = pricing[rentalType] || 0;
  return rate * durationUnits * quantity;
};

module.exports = { calculatePrice };
