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

module.exports = { register };
