/**
 * Auth Controller
 * Handles user and driver registration/login.
 * Issues JWT tokens with role-based claims.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 * Register a new rider or driver
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, licenseNumber, vehicle } = req.body;

    // Register as driver
    if (role === 'driver') {
      const existingDriver = await Driver.findOne({ email });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: 'Driver with this email already exists',
        });
      }

      const driver = await Driver.create({
        name,
        email,
        password,
        phone,
        licenseNumber,
      });

      // Create vehicle record if provided
      if (vehicle) {
        const newVehicle = await Vehicle.create({
          driver: driver._id,
          ...vehicle,
        });
        driver.vehicle = newVehicle._id;
        await driver.save();
      }

      const token = generateToken(driver._id, 'driver');

      return res.status(201).json({
        success: true,
        message: 'Driver registered successfully',
        data: {
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          role: 'driver',
          token,
        },
      });
    }

    // Register as rider (default)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === 'admin' ? 'admin' : 'rider',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user or driver and return token
 */
const login = async (req, res, next) => {
  try {
    const { email, password, loginAs } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Login as driver
    if (loginAs === 'driver') {
      const driver = await Driver.findOne({ email }).select('+password');
      if (!driver) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await driver.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      if (!driver.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account has been deactivated',
        });
      }

      const token = generateToken(driver._id, 'driver');

      return res.status(200).json({
        success: true,
        message: 'Driver login successful',
        data: {
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          role: 'driver',
          isVerified: driver.isVerified,
          token,
        },
      });
    }

    // Login as rider/admin
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/profile
 * Get the authenticated user's profile
 */
const getProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'driver') {
      const driver = await Driver.findById(req.user._id).populate('vehicle');
      return res.status(200).json({ success: true, data: driver });
    }

    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
