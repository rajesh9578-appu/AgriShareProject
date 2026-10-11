const FarmerProfile = require('../models/FarmerProfile');
const User = require('../models/User');
const ResourceRequest = require('../models/ResourceRequest');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const SavedResource = require('../models/SavedResource');
const Notification = require('../models/Notification');
const { getPersonalizedRecommendations } = require('../services/ai/recommendationService');

/**
 * @desc    Get current farmer profile
 * @route   GET /api/farmers/profile
 */
const getProfile = async (req, res, next) => {
  try {
    let profile = await FarmerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await FarmerProfile.create({
        user: req.user._id,
        district: 'Madurai',
        state: 'Tamil Nadu',
        landArea: 2,
        landUnit: 'acres'
      });
    }

    res.status(200).json({
      success: true,
      profile,
      user: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        avatar: req.user.avatar,
        role: req.user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update farmer profile
 * @route   PUT /api/farmers/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      avatar,
      village,
      taluk,
      district,
      state,
      landArea,
      landUnit,
      soilType,
      irrigationType,
      cropsCultivated,
      farmingExperience,
      preferredResources,
      coordinates,
      address
    } = req.body;

    // Update User model fields if provided
    if (name || phone !== undefined || avatar !== undefined) {
      await User.findByIdAndUpdate(req.user._id, {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(avatar !== undefined && { avatar })
      });
    }

    let profile = await FarmerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new FarmerProfile({ user: req.user._id });
    }

    if (village !== undefined) profile.village = village.trim();
    if (taluk !== undefined) profile.taluk = taluk.trim();
    if (district) profile.district = district.trim();
    if (state) profile.state = state.trim();
    if (landArea !== undefined) profile.landArea = Number(landArea);
    if (landUnit) profile.landUnit = landUnit;
    if (soilType) profile.soilType = soilType;
    if (irrigationType) profile.irrigationType = irrigationType;
    if (cropsCultivated) {
      profile.cropsCultivated = Array.isArray(cropsCultivated)
        ? cropsCultivated
        : cropsCultivated.split(',').map(c => c.trim()).filter(Boolean);
    }
    if (farmingExperience !== undefined) profile.farmingExperience = Number(farmingExperience);
    if (preferredResources) {
      profile.preferredResources = Array.isArray(preferredResources)
        ? preferredResources
        : preferredResources.split(',').map(r => r.trim()).filter(Boolean);
    }

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      profile.location = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])],
        address: address || profile.location?.address || ''
      };
    } else if (address) {
      if (!profile.location) profile.location = { type: 'Point', coordinates: [78.1198, 9.9252] };
      profile.location.address = address;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Farmer profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Farmer Dashboard comprehensive data
 * @route   GET /api/farmers/dashboard
 */
const getFarmerDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parallel aggregate queries for speed
    const [
      profile,
      myRequests,
      myBookings,
      myResources,
      savedCount,
      unreadNotificationsCount,
      aiRecommendations
    ] = await Promise.all([
      FarmerProfile.findOne({ user: userId }),
      ResourceRequest.find({ farmer: userId })
        .populate('resource', 'name category photos pricing location')
        .populate('owner', 'name phone')
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.find({ farmer: userId })
        .populate('resource', 'name category photos pricing location')
        .populate('owner', 'name phone')
        .sort({ createdAt: -1 }),
      Resource.find({ owner: userId }),
      SavedResource.countDocuments({ farmer: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      getPersonalizedRecommendations(userId)
    ]);

    const activeBookings = myBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'ACTIVE');
    const completedBookings = myBookings.filter(b => b.status === 'COMPLETED');
    const pendingRequests = myRequests.filter(r => r.status === 'PENDING');

    res.status(200).json({
      success: true,
      dashboard: {
        profile: profile || { completionPercentage: 20, district: 'Madurai' },
        stats: {
          profileCompletion: profile ? profile.completionPercentage : 20,
          activeBookingsCount: activeBookings.length,
          completedBookingsCount: completedBookings.length,
          pendingRequestsCount: pendingRequests.length,
          mySharedResourcesCount: myResources.length,
          savedResourcesCount: savedCount,
          unreadNotificationsCount
        },
        recentRequests: myRequests,
        activeBookings,
        completedBookings: completedBookings.slice(0, 5),
        aiRecommendations: aiRecommendations.recommendations.slice(0, 4),
        seasonalInsight: aiRecommendations.seasonalTrends
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getFarmerDashboard
};
