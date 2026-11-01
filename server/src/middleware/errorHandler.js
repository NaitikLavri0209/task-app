const AppError = require('../utils/AppError');

const notFound = (req, res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path}: ${err.value}`; }
  else if (err.code === 11000) { status = 409; message = 'Duplicate value: that record already exists'; }
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') { status = 401; message = 'Invalid or expired token'; }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Malformed JSON body'; }

  if (status >= 500 && process.env.NODE_ENV !== 'test') console.error(err);
  res.status(status).json({ message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message });
};
module.exports = { notFound, errorHandler };
