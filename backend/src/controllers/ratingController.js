const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const PlatformActivity = require('../models/PlatformActivity');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Submit a rating and review for a completed booking
 * @route   POST /api/ratings
 */
const createRating = async (req, res, next) => {
  try {
    const { bookingId, rating, review, tags = [] } = req.body;

    const booking = await Booking.findById(bookingId).populate('resource');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Ratings can only be submitted after a booking is marked as COMPLETED.'
      });
    }

    const isFarmer = booking.farmer.toString() === req.user._id.toString();
    const isOwner = booking.owner.toString() === req.user._id.toString();

    if (!isFarmer && !isOwner) {
      return res.status(403).json({ success: false, message: 'You were not a party to this booking.' });
    }

    const revieweeId = isFarmer ? booking.owner : booking.farmer;
    const roleType = isFarmer ? 'farmer_to_owner' : 'owner_to_farmer';

    // Check if already rated
    const existingRating = await Rating.findOne({ booking: bookingId, reviewer: req.user._id });
    if (existingRating) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    const ratingVal = Number(rating);
    if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars.' });
    }

    const newRating = await Rating.create({
      booking: booking._id,
      resource: booking.resource._id,
      reviewer: req.user._id,
      reviewee: revieweeId,
      role: roleType,
      rating: ratingVal,
      review: review.trim(),
      tags: Array.isArray(tags) ? tags : []
    });

    // Update Resource Rating Summary
    if (isFarmer) {
      booking.farmerRatingGiven = true;
      await booking.save();

      const allResourceRatings = await Rating.find({ resource: booking.resource._id, role: 'farmer_to_owner' });
      const avg = allResourceRatings.reduce((acc, r) => acc + r.rating, 0) / allResourceRatings.length;
      await Resource.findByIdAndUpdate(booking.resource._id, {
        'ratingSummary.average': Number(avg.toFixed(1)),
        'ratingSummary.count': allResourceRatings.length
      });
    } else {
      booking.ownerRatingGiven = true;
      await booking.save();
    }

    // Notify reviewee
    await createNotification({
      recipient: revieweeId,
      sender: req.user._id,
      title: 'New Review Received ⭐',
      message: `${req.user.name} gave a ${ratingVal}-star review: "${review.substring(0, 60)}..."`,
      type: 'NEW_REVIEW',
      data: { bookingId: booking._id, resourceId: booking.resource._id }
    });

    // Track activity
    await PlatformActivity.create({
      user: req.user._id,
      action: 'RATING_SUBMITTED',
      category: booking.resource?.category || 'General',
      district: booking.location.district,
      metadata: { rating: ratingVal, bookingId: booking._id }
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your rating and review have been submitted.',
      rating: newRating
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ratings for a specific resource
 * @route   GET /api/ratings/resource/:resourceId
 */
const getResourceRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ resource: req.params.resourceId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      ratings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRating,
  getResourceRatings
};
