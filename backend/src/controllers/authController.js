const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const env = require('../config/env');
const { sendOTP } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

/**
 * @desc    Register a new user (Farmer / Resource Owner)
 * @route   POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone = '' } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      // If user exists but not verified, allow resending OTP
      if (!existingUser.isVerified) {
        await sendOTP(existingUser, 'registration');
        return res.status(200).json({
          success: true,
          isUnverified: true,
          message: 'Account exists but is unverified. A new verification OTP has been sent to your email.',
          email: existingUser.email
        });
      }
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please login instead.'
      });
    }

    const isAdminEmail = env.ADMIN.EMAIL && email.toLowerCase().trim() === env.ADMIN.EMAIL.toLowerCase().trim();
    const finalRole = isAdminEmail ? 'admin' : 'user';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: finalRole,
      isOwnerActive: true,
      phone: phone.trim(),
      isVerified: false
    });

    // Create initial Farmer Profile for the user
    await FarmerProfile.create({
      user: user._id,
      district: 'Madurai',
      state: 'Tamil Nadu',
      landArea: 2,
      landUnit: 'acres',
      soilType: 'Red Soil',
      irrigationType: 'Borewell / Well',
      cropsCultivated: ['Paddy']
    });

    // Send OTP verification
    const otpResult = await sendOTP(user, 'registration');

    res.status(201).json({
      success: true,
      message: otpResult.success
        ? 'Registration successful! Please check your email for the 6-digit OTP code to verify your account.'
        : 'Account created, but we could not send the OTP email. Please use "Resend OTP" in a moment.',
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Email OTP
 * @route   POST /api/auth/verify-otp
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const verifyResult = await user.verifyOTPCode(otp.toString().trim());

    if (!verifyResult.valid) {
      return res.status(400).json({ success: false, message: verifyResult.message });
    }

    const token = generateToken(user._id, user.role);

    await createNotification({
      recipient: user._id,
      title: 'Welcome to AgriShare! 🌾',
      message: 'Your account has been verified successfully. Explore equipment sharing and AI farmer assistance.',
      type: 'SYSTEM'
    });

    res.status(200).json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOwnerActive: user.isOwnerActive,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend Email OTP
 * @route   POST /api/auth/resend-otp
 */
const resendOTP = async (req, res, next) => {
  try {
    const { email, purpose = 'registration' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (!user.canResendOTP(60)) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 60 seconds before requesting another OTP.'
      });
    }

    const result = await sendOTP(user, purpose);

    res.status(200).json({
      success: true,
      message: result.success ? 'New OTP code sent to your email.' : result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform support.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      await sendOTP(user, 'registration');
      return res.status(200).json({
        success: true,
        isUnverified: true,
        message: 'Your email is not yet verified. An OTP has been sent to your email.',
        email: user.email
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOwnerActive: user.isOwnerActive,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Forgot Password - Request Reset OTP
 * @route   POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset OTP has been sent.'
      });
    }

    const result = await sendOTP(user, 'password_reset');

    res.status(200).json({
      success: true,
      message: result.success
        ? 'Password reset OTP has been sent to your email.'
        : 'Could not send the OTP email. Please try again later.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset Password with OTP
 * @route   POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const verifyResult = await user.verifyOTPCode(otp.toString().trim());
    if (!verifyResult.valid) {
      return res.status(400).json({ success: false, message: verifyResult.message });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user info
 * @route   GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const profile = await FarmerProfile.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOwnerActive: user.isOwnerActive,
        isVerified: user.isVerified,
        avatar: user.avatar,
        phone: user.phone,
        createdAt: user.createdAt
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Farmer <-> Resource Owner mode (No separate account needed)
 * @route   PUT /api/auth/toggle-owner-mode
 */
const toggleOwnerMode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.isOwnerActive = !user.isOwnerActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isOwnerActive
        ? 'Resource Owner mode enabled. You can now list and manage equipment.'
        : 'Switched back to standard Farmer mode.',
      isOwnerActive: user.isOwnerActive
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  toggleOwnerMode
};
