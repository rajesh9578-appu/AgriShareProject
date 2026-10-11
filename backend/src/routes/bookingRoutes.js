const express = require('express');
const router = express.Router();
const {
  getFarmerBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/auth');

router.get('/my-bookings', protect, getFarmerBookings);
router.get('/owner-bookings', protect, getOwnerBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
