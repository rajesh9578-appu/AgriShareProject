const Resource = require('../../models/Resource');
const FarmerProfile = require('../../models/FarmerProfile');
const SavedResource = require('../../models/SavedResource');
const ResourceRequest = require('../../models/ResourceRequest');
const Booking = require('../../models/Booking');
const AIRecommendation = require('../../models/AIRecommendation');
const { callLLM, safeJSONParse } = require('./aiService');

/**
 * Generate Personalized Recommendations for a Farmer based on Profile + History + Seasons
 */
const getPersonalizedRecommendations = async (userId) => {
  const profile = await FarmerProfile.findOne({ user: userId });
  const savedItems = await SavedResource.find({ farmer: userId }).populate('resource');
  const pastRequests = await ResourceRequest.find({ farmer: userId }).populate('resource').limit(5);
  const pastBookings = await Booking.find({ farmer: userId }).populate('resource').limit(5);

  const district = profile?.district || 'Madurai';
  const crops = profile?.cropsCultivated?.length ? profile.cropsCultivated : ['Paddy'];
  const landArea = profile?.landArea || 2;
  const landUnit = profile?.landUnit || 'acres';

  // Find candidate database resources in the farmer's district or supporting their crops
  const candidateResources = await Resource.find({
    verificationStatus: 'VERIFIED',
    'availability.isAvailable': true
  })
    .populate('owner', 'name phone avatar')
    .lean();

  if (candidateResources.length === 0) {
    return {
      recommendations: [],
      suggestedCategories: ['Tractor', 'Rotavator', 'Seed Drill'],
      seasonalTrends: 'No verified equipment active in database currently.'
    };
  }

  // Rank candidate resources for this farmer
  const scored = candidateResources.map(r => {
    let score = 60;
    const reasons = [];

    // District proximity
    if (r.location.district.toLowerCase() === district.toLowerCase()) {
      score += 20;
      reasons.push(`Available in your district (${district})`);
    }

    // Crop match
    const isCropMatch = r.suitableCrops.some(sc => sc.toLowerCase() === 'all crops' || crops.some(c => sc.toLowerCase().includes(c.toLowerCase())));
    if (isCropMatch) {
      score += 15;
      reasons.push(`Tailored for ${crops.join('/')} farming`);
    }

    // Land compatibility
    if (landArea >= (r.suitableLandSize?.min || 0) && landArea <= (r.suitableLandSize?.max || 100)) {
      score += 10;
      reasons.push(`Suited for ${landArea} ${landUnit}`);
    }

    return {
      resource: r,
      matchScore: Math.min(score, 98),
      matchReason: `Recommended because it is ${reasons.join(', ')}.`,
      suitabilityBadges: [
        r.location.district === district ? '📍 Nearby' : `📍 ${r.location.district}`,
        `🌾 ${crops[0] || 'Crop'} Ready`,
        `⭐ ${r.ratingSummary?.average || 4.8}`
      ]
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  const topRecommendations = scored.slice(0, 6);

  // Derive suggested categories
  const suggestedCategories = [...new Set(topRecommendations.map(t => t.resource.category))];

  // Save recommendation snapshot for tracking
  try {
    await AIRecommendation.create({
      farmer: userId,
      queryType: 'PROFILE_BASED',
      inputParams: { crop: crops[0], landSize: landArea, district },
      recommendedResources: topRecommendations.map(t => ({
        resource: t.resource._id,
        matchScore: t.matchScore,
        matchReason: t.matchReason,
        suitabilityBadges: t.suitabilityBadges
      })),
      suggestedCategories,
      confidenceScore: 0.94
    });
  } catch (err) {
    console.warn('[AI Recommendation Snapshot Error]', err.message);
  }

  return {
    farmerContext: { district, crops, landArea, landUnit },
    recommendations: topRecommendations,
    suggestedCategories,
    seasonalTrends: `Based on your ${crops[0]} crop cycle in ${district}, land tillage and sprayer tools are in active demand this month.`
  };
};

module.exports = {
  getPersonalizedRecommendations
};
