const { calculatePrice } = require('../utils/pricingCalculator');

describe('Pricing Calculator', () => {
  const pricing = { hour: 10, day: 50, week: 280, month: 900, year: 9000 };

  it('calculates hourly price', () => {
    expect(calculatePrice(pricing, 'hour', 5)).toBe(50);
  });

  it('calculates daily price', () => {
    expect(calculatePrice(pricing, 'day', 3)).toBe(150);
  });

  it('calculates weekly price', () => {
    expect(calculatePrice(pricing, 'week', 2)).toBe(560);
  });

  it('calculates monthly price', () => {
    expect(calculatePrice(pricing, 'month', 1)).toBe(900);
  });

  it('calculates yearly price', () => {
    expect(calculatePrice(pricing, 'year', 1)).toBe(9000);
  });

  it('returns 0 for unknown rental type', () => {
    expect(calculatePrice(pricing, 'unknown', 5)).toBe(0);
  });

  it('returns 0 for quantity 0', () => {
    expect(calculatePrice(pricing, 'day', 0)).toBe(0);
  });
});
