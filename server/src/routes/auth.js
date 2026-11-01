const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) throw new AppError('Email already registered', 409);
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  })
);

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail(), body('password').notEmpty().withMessage('Password is required')],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) throw new AppError('Invalid email or password', 401);
    res.json({ token: sign(user), user: publicUser(user) });
  })
);

module.exports = router;
