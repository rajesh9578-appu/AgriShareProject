const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  toggleOwnerMode
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../middlewares/validate');
const { authLimiter, otpLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, validateRegister, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/me', protect, getMe);
router.put('/toggle-owner-mode', protect, toggleOwnerMode);

module.exports = router;
