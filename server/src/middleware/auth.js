const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError('Not authorised: token missing', 401));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id };
    next();
  } catch (e) { next(e); } // JsonWebTokenError -> global handler -> 401
};
