/**
 * Calculate total rental price based on pricing schema, rental type, and quantity.
 * @param {Object} pricing - { hour, day, week, month, year }
 * @param {'hour'|'day'|'week'|'month'|'year'} rentalType
 * @param {number} quantity - number of units (hours, days, weeks, etc.)
 * @returns {number}
 */
const calculatePrice = (pricing, rentalType, quantity) => {
  const rate = pricing[rentalType] || 0;
  return rate * quantity;
};

module.exports = { calculatePrice };
