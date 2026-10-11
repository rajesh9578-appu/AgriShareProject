const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');
const notificationService = require('./notificationService');

// Generate unique booking reference
const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `AGRI-${year}-${randomStr}${randomNum}`;
};

/**
 * Check if a resource has an overlapping confirmed or active booking
 */
const checkResourceAvailability = async (resourceId, startDate, endDate, excludeBookingId = null) => {
  const reqStart = new Date(startDate);
  const reqEnd = new Date(endDate);

  if (reqStart > reqEnd) {
    return { available: false, message: 'Start date cannot be after end date.' };
  }

  // Check if resource is generally available
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return { available: false, message: 'Resource not found.' };
  }

  if (!resource.availability.isAvailable) {
    return { available: false, message: 'Resource is currently marked unavailable by owner.' };
  }

  if (resource.verificationStatus !== 'VERIFIED') {
    return { available: false, message: 'Resource is awaiting admin verification.' };
  }

  // Query conflicting active/confirmed bookings
  const query = {
    resource: resourceId,
    status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
    // Overlap condition: (StartA <= EndB) and (EndA >= StartB)
    startDate: { $lte: reqEnd },
    endDate: { $gte: reqStart }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);

  if (conflictingBooking) {
    return {
      available: false,
      message: `Resource is already booked from ${new Date(conflictingBooking.startDate).toLocaleDateString()} to ${new Date(conflictingBooking.endDate).toLocaleDateString()}.`
    };
  }

  return { available: true, resource };
};

/**
 * Create a confirmed booking from an accepted request
 */
const createBookingFromRequest = async (requestId, acceptedByUserId) => {
  const request = await ResourceRequest.findById(requestId).populate('resource').populate('farmer').populate('owner');
  if (!request) {
    throw new Error('Resource request not found.');
  }

  if (request.owner._id.toString() !== acceptedByUserId.toString()) {
    throw new Error('Unauthorized. Only the resource owner can accept this request.');
  }

  if (request.status !== 'PENDING') {
    throw new Error(`Request is already marked as ${request.status}.`);
  }

  // Check availability
  const availabilityCheck = await checkResourceAvailability(
    request.resource._id,
    request.requiredStartDate,
    request.requiredEndDate
  );

  if (!availabilityCheck.available) {
    throw new Error(availabilityCheck.message);
  }

  // Calculate pricing
  const resource = request.resource;
  const duration = request.durationDays || 1;
  const pricePerUnit = resource.pricing.price || 0;
  const totalAmount = pricePerUnit * duration;

  const booking = await Booking.create({
    bookingReference: generateBookingReference(),
    request: request._id,
    farmer: request.farmer._id,
    resource: resource._id,
    owner: request.owner._id,
    startDate: request.requiredStartDate,
    endDate: request.requiredEndDate,
    durationDays: duration,
    location: {
      address: request.location.address || resource.location.address,
      village: request.location.village || resource.location.village,
      district: request.location.district || resource.location.district,
      state: request.location.state || resource.location.state
    },
    pricing: {
      pricePerUnit,
      unit: resource.pricing.unit,
      totalAmount,
      deposit: resource.pricing.deposit || 0
    },
    status: 'CONFIRMED',
    confirmedAt: new Date()
  });

  // Update request status
  request.status = 'ACCEPTED';
  request.respondedAt = new Date();
  await request.save();

  // Update resource total bookings count
  await Resource.findByIdAndUpdate(resource._id, { $inc: { totalBookingsCount: 1 } });

  // Send notifications
  await notificationService.notifyRequestStatusChange(request, 'ACCEPTED');
  await notificationService.notifyBookingConfirmed(booking, resource.name);

  return booking;
};

module.exports = {
  generateBookingReference,
  checkResourceAvailability,
  createBookingFromRequest
};
