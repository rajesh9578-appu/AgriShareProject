const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getFarmerDashboard
} = require('../controllers/farmerController');
const { protect } = require('../middlewares/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getFarmerDashboard);

module.exports = router;
