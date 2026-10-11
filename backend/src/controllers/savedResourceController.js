const SavedResource = require('../models/SavedResource');
const Resource = require('../models/Resource');

/**
 * @desc    Save or Unsave (Bookmark) a resource
 * @route   POST /api/saved-resources/toggle
 */
const toggleSaveResource = async (req, res, next) => {
  try {
    const { resourceId, notes = '' } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const existing = await SavedResource.findOne({ farmer: req.user._id, resource: resourceId });

    if (existing) {
      await SavedResource.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Resource removed from saved bookmarks'
      });
    } else {
      await SavedResource.create({
        farmer: req.user._id,
        resource: resourceId,
        notes: notes.trim()
      });
      return res.status(201).json({
        success: true,
        isSaved: true,
        message: 'Resource bookmarked successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved resources for the farmer
 * @route   GET /api/saved-resources
 */
const getSavedResources = async (req, res, next) => {
  try {
    const saved = await SavedResource.find({ farmer: req.user._id })
      .populate({
        path: 'resource',
        populate: { path: 'owner', select: 'name phone email avatar isVerified' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      savedResources: saved.map(s => ({
        _id: s._id,
        savedAt: s.createdAt,
        notes: s.notes,
        resource: s.resource
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleSaveResource,
  getSavedResources
};
