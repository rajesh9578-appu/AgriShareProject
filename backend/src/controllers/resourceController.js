const Resource = require('../models/Resource');
const User = require('../models/User');
const PlatformActivity = require('../models/PlatformActivity');
const { getDefaultEquipmentImage } = require('../utils/equipmentImages');

/**
 * @desc    Get all resources with natural language & structured advanced filters
 * @route   GET /api/resources
 */
const getAllResources = async (req, res, next) => {
  try {
    const {
      q,
      category,
      district,
      crop,
      landSize,
      minPrice,
      maxPrice,
      condition,
      usageType,
      withOperator,
      availableOnly,
      lng,
      lat,
      radiusKm,
      sortBy = 'rating',
      page = 1,
      limit = 12
    } = req.query;

    const query = {
      verificationStatus: 'VERIFIED',
      isPublished: true
    };

    // Text / Natural Language Search
    if (q && q.trim() !== '') {
      const qClean = q.trim();
      const regex = new RegExp(qClean, 'i');
      query.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
        { 'location.district': regex },
        { 'location.village': regex },
        { suitableCrops: { $in: [regex, 'All Crops'] } }
      ];
    }

    if (category && category !== 'All') {
      query.category = new RegExp(category, 'i');
    }

    if (district && district !== 'All') {
      query['location.district'] = new RegExp(district, 'i');
    }

    if (crop && crop !== 'All') {
      query.suitableCrops = { $in: [new RegExp(crop, 'i'), 'All Crops'] };
    }

    if (landSize) {
      const size = Number(landSize);
      query['suitableLandSize.min'] = { $lte: size };
      query['suitableLandSize.max'] = { $gte: size };
    }

    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.price'].$lte = Number(maxPrice);
    }

    if (condition && condition !== 'All') {
      query.condition = condition.toLowerCase();
    }

    if (usageType && usageType !== 'All') {
      query.usageType = usageType;
    }

    if (withOperator === 'true') {
      query['specs.withOperator'] = true;
    }

    if (availableOnly === 'true') {
      query['availability.isAvailable'] = true;
    }

    // Proximity / Geospatial query if coordinates & radius provided
    if (lng && lat) {
      const radiusInMeters = (Number(radiusKm) || 30) * 1000;
      query.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'price_asc') sortOptions = { 'pricing.price': 1 };
    else if (sortBy === 'price_desc') sortOptions = { 'pricing.price': -1 };
    else if (sortBy === 'newest') sortOptions = { createdAt: -1 };
    else if (sortBy === 'bookings') sortOptions = { totalBookingsCount: -1 };
    else sortOptions = { 'ratingSummary.average': -1, createdAt: -1 }; // default rating

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [resources, totalCount] = await Promise.all([
      Resource.find(query)
        .populate('owner', 'name phone email avatar isVerified')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Resource.countDocuments(query)
    ]);

    // Track search activity asynchronously
    if (q || category || district) {
      PlatformActivity.create({
        action: 'RESOURCE_SEARCHED',
        category: category || 'All',
        district: district || 'All',
        metadata: { query: q, resultsCount: totalCount }
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get resource details by ID
 * @route   GET /api/resources/:id
 */
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'owner',
      'name phone email avatar isVerified createdAt'
    );

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({
      success: true,
      resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new agricultural resource
 * @route   POST /api/resources
 */
const createResource = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      location,
      availability,
      pricing,
      photos,
      suitableCrops,
      suitableLandSize,
      usageType,
      condition,
      specs
    } = req.body;

    // Automatically enable owner active status for user
    await User.findByIdAndUpdate(req.user._id, { isOwnerActive: true });

    // Build location payload
    const coords = location?.coordinates || [78.1198, 9.9252];
    const resourceLocation = {
      type: 'Point',
      coordinates: [Number(coords[0]), Number(coords[1])],
      address: location?.address || '',
      village: location?.village || '',
      taluk: location?.taluk || '',
      district: location?.district || 'Madurai',
      state: location?.state || 'Tamil Nadu'
    };

    const resource = await Resource.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      owner: req.user._id,
      location: resourceLocation,
      availability: availability || { isAvailable: true },
      pricing: {
        price: Number(pricing?.price) || 500,
        unit: pricing?.unit || 'per_day',
        deposit: Number(pricing?.deposit) || 0,
        isNegotiable: !!pricing?.isNegotiable
      },
      photos: (photos && photos.length > 0)
        ? photos
        : getDefaultEquipmentImage(category, name),
      suitableCrops: Array.isArray(suitableCrops) ? suitableCrops : ['All Crops'],
      suitableLandSize: suitableLandSize || { min: 0.5, max: 50, unit: 'acres' },
      usageType: usageType || 'rental',
      condition: condition || 'good',
      specs: specs || {},
      verificationStatus: req.user.role === 'admin' ? 'VERIFIED' : 'VERIFIED', // Set to VERIFIED for standard flow or PENDING_VERIFICATION
      ratingSummary: { average: 5.0, count: 1 }
    });

    // Log platform activity
    await PlatformActivity.create({
      user: req.user._id,
      action: 'RESOURCE_CREATED',
      category: resource.category,
      district: resource.location.district,
      metadata: { resourceId: resource._id, name: resource.name }
    });

    res.status(201).json({
      success: true,
      message: 'Resource listed successfully on the platform!',
      resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update resource
 * @route   PUT /api/resources/:id
 */
const updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check authorization: must be owner or admin
    if (resource.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this resource' });
    }

    // Format location update if provided
    if (req.body.location && req.body.location.coordinates) {
      req.body.location = {
        type: 'Point',
        coordinates: [
          Number(req.body.location.coordinates[0]),
          Number(req.body.location.coordinates[1])
        ],
        address: req.body.location.address || resource.location.address,
        village: req.body.location.village || resource.location.village,
        taluk: req.body.location.taluk || resource.location.taluk,
        district: req.body.location.district || resource.location.district,
        state: req.body.location.state || resource.location.state
      };
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 */
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle resource availability
 * @route   PATCH /api/resources/:id/availability
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this resource' });
    }

    resource.availability.isAvailable = !resource.availability.isAvailable;
    await resource.save();

    res.status(200).json({
      success: true,
      message: `Resource is now ${resource.availability.isAvailable ? 'Available' : 'Unavailable'} for booking`,
      isAvailable: resource.availability.isAvailable
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get resources owned by current logged in user
 * @route   GET /api/resources/owner/my-resources
 */
const getOwnerResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      resources
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  toggleAvailability,
  getOwnerResources
};
