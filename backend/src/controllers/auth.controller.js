const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validateRegistration } = require('../utils/authValidation');

async function register(req, res, next) {
  try {
    const validation = validateRegistration(req.body || {});
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the registration details.',
        errors: validation.errors
      });
    }

    const { name, email, password } = validation.values;

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: passwordHash
    });

    return res.status(201).json({
      success: true,
      message: 'Your student account has been created.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'The submitted account details are invalid.'
      });
    }
    return next(error);
  }
}


async function login(req, res, next) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(503).json({
        success: false,
        message: 'Authentication is not configured on this server.'
      });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function currentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Account could not be found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, currentUser };
