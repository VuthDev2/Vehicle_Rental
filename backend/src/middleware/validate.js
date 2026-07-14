const { body, param, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidation,
];

const resetPasswordRules = [
  param('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const createVehicleRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900, max: 2100 }).withMessage('Valid year is required'),
  body('type').isIn(['Car', 'SUV', 'Van', 'Truck', 'Motorcycle', 'Bike', 'E-Bike', 'Tuk-Tuk']).withMessage('Invalid vehicle type'),
  body('fuel').isIn(['Petrol', 'Diesel', 'Hybrid', 'Electric', 'N/A']).withMessage('Invalid fuel type'),
  body('transmission').isIn(['Automatic', 'Manual']).withMessage('Invalid transmission'),
  body('seats').isInt({ min: 1 }).withMessage('Seats must be at least 1'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('pricing').isObject().withMessage('Pricing is required'),
  body('pricing.hour').optional().isFloat({ min: 0 }),
  body('pricing.day').optional().isFloat({ min: 0 }),
  body('pricing.week').optional().isFloat({ min: 0 }),
  body('pricing.month').optional().isFloat({ min: 0 }),
  body('pricing.year').optional().isFloat({ min: 0 }),
  handleValidation,
];

const mongoIdRule = (field = 'id') => [
  param(field).isMongoId().withMessage(`Invalid ${field}`),
  handleValidation,
];

const createBookingRules = [
  body('vehicleId').isMongoId().withMessage('Valid vehicle ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('rentalType').isIn(['hour', 'day', 'week', 'month', 'year']).withMessage('Invalid rental type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('promoCode').optional().trim(),
  body('notes').optional().trim(),
  handleValidation,
];

const createPaymentRules = [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('method').isIn(['Card', 'PayPal', 'Cash', 'ABA Pay', 'Wing']).withMessage('Invalid payment method'),
  handleValidation,
];

const createReviewRules = [
  body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
  handleValidation,
];

const createPromotionRules = [
  body('code').trim().notEmpty().withMessage('Code is required'),
  body('discountType').isIn(['percent', 'fixed']).withMessage('Discount type must be percent or fixed'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('minAmount').optional().isFloat({ min: 0 }),
  body('maxUses').optional().isInt({ min: 1 }),
  body('expiresAt').optional().isISO8601(),
  handleValidation,
];

const updateUserRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
  body('avatar').optional().trim(),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  handleValidation,
];

const updateBookingStatusRules = [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),
  handleValidation,
];

module.exports = {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  createVehicleRules,
  createBookingRules,
  createPaymentRules,
  createReviewRules,
  createPromotionRules,
  updateUserRules,
  updateBookingStatusRules,
  mongoIdRule,
};
