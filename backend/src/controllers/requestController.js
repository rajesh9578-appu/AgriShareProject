const ResourceRequest = require('../models/ResourceRequest');
const Resource = require('../models/Resource');
const User = require('../models/User');
const PlatformActivity = require('../models/PlatformActivity');
const { createBookingFromRequest, checkResourceAvailability } = require('../services/bookingService');
const { notifyNewRequest, notifyRequestStatusChange } = require('../services/notificationService');

/**
 * @desc    Submit a new resource request
 * @route   POST /api/resource-requests
 */
const createRequest = async (req, res, next) => {
  try {
    const {
      resourceId,
      requiredStartDate,
      requiredEndDate,
      durationDays = 1,
      purpose,
      crop = 'General Farming',
      landArea = { value: 1, unit: 'acres' },
      location,
      additionalMessage = ''
    } = req.body;

    const resource = await Resource.findById(resourceId).populate('owner');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own equipment.' });
    }

    if (!resource.availability.isAvailable) {
      return res.status(400).json({ success: false, message: 'This resource is currently marked unavailable.' });
    }

    // Check availability
    const availCheck = await checkResourceAvailability(resource._id, requiredStartDate, requiredEndDate);
    if (!availCheck.available) {
      return res.status(400).json({ success: false, message: availCheck.message });
    }

    const duration = Number(durationDays) || 1;
    const estimatedCost = (resource.pricing?.price || 0) * duration;

    const requestLocation = location || {
      address: resource.location.address,
      village: resource.location.village,
      district: resource.location.district,
      state: resource.location.state
    };

    const newRequest = await ResourceRequest.create({
      farmer: req.user._id,
      resource: resource._id,
      owner: resource.owner._id,
      requiredStartDate: new Date(requiredStartDate),
      requiredEndDate: new Date(requiredEndDate),
      durationDays: duration,
      purpose: purpose.trim(),
      crop,
      landArea,
      location: requestLocation,
      additionalMessage: additionalMessage.trim(),
      estimatedCost,
      status: 'PENDING'
    });

    // Notify owner
    await notifyNewRequest(newRequest, resource.name, req.user.name);

    // Track activity
    await PlatformActivity.create({
      user: req.user._id,
      action: 'REQUEST_SUBMITTED',
      category: resource.category,
      district: requestLocation.district || resource.location.district,
      crop,
      metadata: { requestId: newRequest._id, resourceId: resource._id }
    });

    res.status(201).json({
      success: true,
      message: 'Resource request submitted successfully! The owner has been notified.',
      request: newRequest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get requests made by the logged-in farmer
 * @route   GET /api/resource-requests/my-requests
 */
const getFarmerRequests = async (req, res, next) => {
  try {
    const requests = await ResourceRequest.find({ farmer: req.user._id })
      .populate('resource', 'name category photos pricing location ratingSummary')
      .populate('owner', 'name phone email avatar isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get requests received by resource owner
 * @route   GET /api/resource-requests/owner-requests
 */
const getOwnerRequests = async (req, res, next) => {
  try {
    const requests = await ResourceRequest.find({ owner: req.user._id })
      .populate('resource', 'name category photos pricing location')
      .populate('farmer', 'name phone email avatar isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept a resource request (Creates a confirmed booking)
 * @route   PUT /api/resource-requests/:id/accept
 */
const acceptRequest = async (req, res, next) => {
  try {
    const booking = await createBookingFromRequest(req.params.id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Request accepted successfully! Confirmed booking has been created.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a resource request
 * @route   PUT /api/resource-requests/:id/reject
 */
const rejectRequest = async (req, res, next) => {
  try {
    const { reason = 'Owner is unavailable during the requested timeframe' } = req.body;
    const request = await ResourceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to reject this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    request.status = 'REJECTED';
    request.rejectionReason = reason;
    request.respondedAt = new Date();
    await request.save();

    await notifyRequestStatusChange(request, 'REJECTED');

    res.status(200).json({
      success: true,
      message: 'Request declined.',
      request
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a resource request (Farmer or Admin)
 * @route   PUT /api/resource-requests/:id/cancel
 */
const cancelRequest = async (req, res, next) => {
  try {
    const request = await ResourceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Cannot cancel request in ${request.status} status` });
    }

    request.status = 'CANCELLED';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      request
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getFarmerRequests,
  getOwnerRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest
};
