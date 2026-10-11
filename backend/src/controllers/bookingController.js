const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const PlatformActivity = require('../models/PlatformActivity');
const { notifyBookingCompleted } = require('../services/notificationService');

/**
 * @desc    Get bookings for logged-in farmer
 * @route   GET /api/bookings/my-bookings
 */
const getFarmerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ farmer: req.user._id })
      .populate('resource')
      .populate('owner', 'name phone email avatar isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bookings for logged-in resource owner
 * @route   GET /api/bookings/owner-bookings
 */
const getOwnerBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('resource')
      .populate('farmer', 'name phone email avatar isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get booking details by ID
 * @route   GET /api/bookings/:id
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('resource')
      .populate('farmer', 'name phone email avatar')
      .populate('owner', 'name phone email avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization check
    const isFarmer = booking.farmer._id.toString() === req.user._id.toString();
    const isOwner = booking.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status (e.g., ACTIVE, COMPLETED)
 * @route   PATCH /api/bookings/:id/status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('resource');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isFarmer = booking.farmer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFarmer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!['CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid booking status' });
    }

    booking.status = status;
    if (status === 'COMPLETED') {
      booking.completedAt = new Date();
      await notifyBookingCompleted(booking, booking.resource?.name || 'Equipment');
      await PlatformActivity.create({
        user: req.user._id,
        action: 'BOOKING_COMPLETED',
        category: booking.resource?.category || 'General',
        district: booking.location.district,
        metadata: { bookingId: booking._id, reference: booking.bookingReference }
      });
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking updated to ${status}`,
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a booking
 * @route   PATCH /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { reason = 'Cancelled by user' } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      booking.farmer.toString() !== req.user._id.toString() &&
      booking.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFarmerBookings,
  getOwnerBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};
