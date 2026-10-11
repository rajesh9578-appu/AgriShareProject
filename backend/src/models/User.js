const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'farmer', 'resource_owner'],
      default: 'user'
    },
    // Allows user to perform both Seeker and Provider activities
    isOwnerActive: {
      type: Boolean,
      default: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    otp: {
      codeHash: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
      lastResentAt: { type: Date, default: null },
      purpose: {
        type: String,
        enum: ['registration', 'password_reset', 'login_verify'],
        default: 'registration'
      }
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check OTP rate limits & cooldown
userSchema.methods.canResendOTP = function (cooldownSeconds = 60) {
  if (!this.otp.lastResentAt) return true;
  const elapsed = (Date.now() - new Date(this.otp.lastResentAt).getTime()) / 1000;
  return elapsed >= cooldownSeconds;
};

// Verify OTP method
userSchema.methods.verifyOTPCode = async function (candidateOTP) {
  if (!this.otp || !this.otp.codeHash || !this.otp.expiresAt) {
    return { valid: false, message: 'No active OTP found. Please request a new one.' };
  }

  if (new Date() > new Date(this.otp.expiresAt)) {
    return { valid: false, message: 'OTP has expired. Please request a new code.' };
  }

  if (this.otp.attempts >= 5) {
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(candidateOTP.toString(), this.otp.codeHash);
  if (!isMatch) {
    this.otp.attempts += 1;
    await this.save();
    return {
      valid: false,
      message: `Invalid OTP. ${5 - this.otp.attempts} attempt(s) remaining.`
    };
  }

  // Clear OTP on success
  this.otp.codeHash = null;
  this.otp.expiresAt = null;
  this.otp.attempts = 0;
  this.isVerified = true;
  await this.save();

  return { valid: true, message: 'OTP verified successfully.' };
};

module.exports = mongoose.model('User', userSchema);
