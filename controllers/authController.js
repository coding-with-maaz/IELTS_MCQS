const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user) => {
  console.log('Generating token for user:', {
    id: user._id,
    email: user.email,
    role: user.role,
    testType: user.profile?.testType
  });
  return jwt.sign(
    { 
      id: user._id,
      email: user.email, 
      role: user.role
    },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: '24h' }
  );
};

// Set auth cookies
const setAuthCookies = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };

  res.cookie('jwt', token, cookieOptions);
  res.cookie('auth_token', token, cookieOptions);
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0].msg 
      });
    }

    const { name, email, password, testType } = req.body;
    console.log('Registration request:', { name, email, testType });

    // Validate test type
    if (!['IELTS', 'PTE'].includes(testType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test type. Must be either IELTS or PTE'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Create new user with profile
    const userData = {
      name,
      email,
      password,
      role: 'user',
      profile: {
        testType
      }
    };
    console.log('Creating user with data:', userData);

    const user = await User.create(userData);
    console.log('User created:', user);

    // Fetch the complete user object to ensure we have all fields
    const completeUser = await User.findById(user._id);
    console.log('Complete user data:', completeUser);
    console.log('Created user with testType:', completeUser.profile.testType);

    // Generate token and set cookies
    const token = generateToken(completeUser);
    setAuthCookies(res, token);

    // Send response
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: completeUser._id,
          name: completeUser.name,
          email: completeUser.email,
          role: completeUser.role,
          profile: completeUser.profile
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0].msg 
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    console.log('User testType:', user?.profile?.testType);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Fetch fresh user data to ensure we have all fields
    const freshUser = await User.findById(user._id);
    console.log('Fresh user testType:', freshUser.profile?.testType);

    // Generate token and set cookies
    const token = generateToken(freshUser);
    setAuthCookies(res, token);

    // Send response
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: freshUser._id,
          name: freshUser.name,
          email: freshUser.email,
          role: freshUser.role,
          profile: freshUser.profile,
          testType: freshUser.profile?.testType
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    res.json({
      success: true,
      data: { 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile,
          testType: user.profile?.testType
        }
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user data' 
    });
  }
};