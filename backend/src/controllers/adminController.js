const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');
const Booking = require('../models/Booking');
const ResourceCategory = require('../models/ResourceCategory');
const Crop = require('../models/Crop');
const PlatformActivity = require('../models/PlatformActivity');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get Admin Dashboard Platform Overview Statistics
 * @route   GET /api/admin/stats
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalRegularUsers,
      totalAdmins,
      totalResources,
      verifiedResources,
      pendingResources,
      totalRequests,
      totalBookings,
      completedBookings,
      cancelledBookings,
      categoriesCount,
      cropsCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'admin' }),
      Resource.countDocuments(),
      Resource.countDocuments({ verificationStatus: 'VERIFIED' }),
      Resource.countDocuments({ verificationStatus: 'PENDING_VERIFICATION' }),
      ResourceRequest.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'COMPLETED' }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      ResourceCategory.countDocuments(),
      Crop.countDocuments()
    ]);

    // Popular categories by resource count
    const categoryStats = await Resource.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Popular locations/districts
    const locationStats = await Resource.aggregate([
      { $group: { _id: '$location.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // Recent platform activities
    const recentActivities = await PlatformActivity.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalRegularUsers,
        totalAdmins,
        totalFarmers: totalRegularUsers,
        totalResourceOwners: totalRegularUsers,
        totalResources,
        verifiedResources,
        pendingResources,
        totalRequests,
        totalBookings,
        completedBookings,
        cancelledBookings,
        categoriesCount,
        cropsCount,
        categoryStats,
        locationStats,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with search and role filters
 * @route   GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, isVerified, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && role !== 'All') {
      if (role === 'user' || role === 'User') {
        query.role = { $in: ['user', 'farmer', 'resource_owner'] };
      } else if (role === 'admin' || role === 'Admin') {
        query.role = 'admin';
      } else {
        query.role = role;
      }
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    if (isVerified !== undefined && isVerified !== 'All') {
      query.isVerified = isVerified === 'true';
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-password -otp').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user status (Active / Suspended)
 * @route   PATCH /api/admin/users/:id/status
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin status cannot be modified' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${user.isActive ? 'Active' : 'Suspended'}`,
      isActive: user.isActive
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resources for admin review
 * @route   GET /api/admin/resources
 */
const getAllAdminResources = async (req, res, next) => {
  try {
    const { status, category, district, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== 'All') query.verificationStatus = status;
    if (category && category !== 'All') query.category = new RegExp(category, 'i');
    if (district && district !== 'All') query['location.district'] = new RegExp(district, 'i');
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { category: regex }, { 'location.district': regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .populate('owner', 'name email phone avatar isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Resource.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      resources,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify or Reject Resource
 * @route   PATCH /api/admin/resources/:id/verify
 */
const updateResourceVerification = async (req, res, next) => {
  try {
    const { status, rejectionReason = '' } = req.body;
    const resource = await Resource.findById(req.params.id).populate('owner');

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (!['VERIFIED', 'REJECTED', 'CORRECTION_REQUIRED', 'PENDING_VERIFICATION'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    resource.verificationStatus = status;
    resource.rejectionReason = rejectionReason;
    if (status === 'VERIFIED') {
      resource.verifiedAt = new Date();
      resource.verifiedBy = req.user._id;
    }
    await resource.save();

    // Send notification to owner
    await createNotification({
      recipient: resource.owner._id,
      title: status === 'VERIFIED' ? 'Resource Verified! 🛡️' : 'Resource Verification Update',
      message:
        status === 'VERIFIED'
          ? `Your resource "${resource.name}" has been verified by admin and is now eligible for premium discovery.`
          : `Verification status for "${resource.name}" updated to ${status}: ${rejectionReason}`,
      type: status === 'VERIFIED' ? 'RESOURCE_VERIFIED' : 'RESOURCE_REJECTED',
      data: { resourceId: resource._id, actionUrl: '/owner/my-resources' }
    });

    res.status(200).json({
      success: true,
      message: `Resource verification status updated to ${status}`,
      resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resource Category Management (List / Create / Delete)
 * @route   GET, POST, DELETE /api/admin/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await ResourceCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, suggestedUnits, typicalOperations } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = await ResourceCategory.create({
      name: name.trim(),
      slug,
      description,
      icon,
      suggestedUnits,
      typicalOperations
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await ResourceCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crop Configuration Management
 * @route   GET, POST, DELETE /api/admin/crops
 */
const getCrops = async (req, res, next) => {
  try {
    const crops = await Crop.find().sort({ name: 1 });
    res.status(200).json({ success: true, crops });
  } catch (error) {
    next(error);
  }
};

const createCrop = async (req, res, next) => {
  try {
    const { name, category, seasons, soilTypes, stages, commonEquipmentNeeded } = req.body;
    const crop = await Crop.create({
      name: name.trim(),
      category,
      seasons,
      soilTypes,
      stages,
      commonEquipmentNeeded
    });
    res.status(201).json({ success: true, crop });
  } catch (error) {
    next(error);
  }
};

const deleteCrop = async (req, res, next) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Crop configuration deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings across the platform
 * @route   GET /api/admin/bookings
 */
const getAllAdminBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('farmer', 'name email phone avatar')
        .populate('owner', 'name email phone avatar')
        .populate('resource', 'name category photos pricing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      bookings,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  getAllAdminResources,
  updateResourceVerification,
  getCategories,
  createCategory,
  deleteCategory,
  getCrops,
  createCrop,
  deleteCrop,
  getAllAdminBookings
};
