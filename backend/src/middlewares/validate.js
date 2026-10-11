const validator = require('validator');

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || validator.isEmpty(name.trim())) {
    errors.push('Full name is required');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (role && role === 'admin') {
    errors.push('Admin accounts cannot be self-registered publicly');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, message: errors[0] });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
