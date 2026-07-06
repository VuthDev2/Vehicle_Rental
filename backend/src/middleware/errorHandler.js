const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists.` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
