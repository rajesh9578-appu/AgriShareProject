const Resource = require('../../models/Resource');
const FarmerProfile = require('../../models/FarmerProfile');
const { callLLM, safeJSONParse } = require('./aiService');

/**
 * Intelligent Multi-Factor Matching between Farmer requirements and Database Resources
 */
const matchResources = async ({
  userId = null,
  crop = 'Paddy',
  landSize = 2,
  landUnit = 'acres',
  district = '',
  category = '',
  activity = 'Land Preparation',
  requiredStartDate = null,
  requiredEndDate = null,
  maxBudget = null,
  condition = null,
  withOperator = false
}) => {
  // If user provided, merge with their farmer profile
  let farmerContext = { district, crop, landSize, landUnit };
  if (userId) {
    const profile = await FarmerProfile.findOne({ user: userId });
    if (profile) {
      if (!district) district = profile.district;
      if (!crop && profile.cropsCultivated?.length > 0) crop = profile.cropsCultivated[0];
      if (!landSize) landSize = profile.landArea;
      farmerContext = {
        district: profile.district,
        crop: profile.cropsCultivated?.[0] || 'Paddy',
        landSize: profile.landArea || 2,
        landUnit: profile.landUnit || 'acres',
        soilType: profile.soilType
      };
    }
  }

  // 1. Database Candidate Query
  const query = {
    verificationStatus: 'VERIFIED',
    'availability.isAvailable': true
  };

  if (category && category !== 'All') {
    query.category = new RegExp(category, 'i');
  }

  const candidateResources = await Resource.find(query)
    .populate('owner', 'name phone email avatar')
    .lean();

  if (candidateResources.length === 0) {
    return {
      success: true,
      matches: [],
      summary: `No verified resources found matching category "${category || 'All'}".`
    };
  }

  // 2. Score Candidates Algorithmic Baseline
  const scoredCandidates = candidateResources.map(res => {
    let score = 50; // base score
    const matchReasons = [];
    const suitabilityBadges = [];

    // District / Location factor (30 pts)
    const isSameDistrict = district && res.location.district.toLowerCase() === district.toLowerCase();
    if (isSameDistrict) {
      score += 25;
      matchReasons.push(`Located directly in your district (${res.location.district})`);
      suitabilityBadges.push('📍 Local Resource');
    } else {
      score += 10;
      suitabilityBadges.push(`📍 ${res.location.district}`);
    }

    // Crop Suitability factor (20 pts)
    const supportsCrop = res.suitableCrops.some(
      c => c.toLowerCase() === 'all crops' || (crop && c.toLowerCase().includes(crop.toLowerCase()))
    );
    if (supportsCrop) {
      score += 15;
      matchReasons.push(`Optimized for ${crop} cultivation`);
      suitabilityBadges.push(`🌾 ${crop} Compatible`);
    }

    // Land Size Suitability (15 pts)
    const minLand = res.suitableLandSize?.min || 0;
    const maxLand = res.suitableLandSize?.max || 999;
    if (landSize >= minLand && landSize <= maxLand) {
      score += 15;
      matchReasons.push(`Fits your land size of ${landSize} ${landUnit} (Capacity: ${minLand}-${maxLand} ${res.suitableLandSize?.unit || 'acres'})`);
      suitabilityBadges.push('📐 Land Fit');
    }

    // Category / Activity factor (15 pts)
    if (category && res.category.toLowerCase().includes(category.toLowerCase())) {
      score += 15;
      matchReasons.push(`Exact category match for ${res.category}`);
    }

    // Operator requirement match
    if (withOperator && res.specs?.withOperator) {
      score += 10;
      matchReasons.push('Includes skilled operator/driver');
      suitabilityBadges.push('👨‍🌾 With Operator');
    }

    // High rating boost (10 pts)
    if (res.ratingSummary?.average >= 4.5) {
      score += 5;
      suitabilityBadges.push(`⭐ Top Rated (${res.ratingSummary.average})`);
    }

    // Verification badge
    if (res.verificationStatus === 'VERIFIED') {
      suitabilityBadges.push('🛡️ Verified Equipment');
    }

    const finalScore = Math.min(Math.round(score), 99);
    const fallbackReason = matchReasons.length > 0
      ? `Recommended because it ${matchReasons.join(', and ')}.`
      : `Available platform resource supporting agricultural operations.`;

    return {
      resource: res,
      resourceId: res._id.toString(),
      matchScore: finalScore,
      matchReason: fallbackReason,
      suitabilityBadges,
      details: {
        name: res.name,
        category: res.category,
        district: res.location.district,
        price: `₹${res.pricing.price}/${res.pricing.unit.replace('_', ' ')}`,
        rating: res.ratingSummary?.average
      }
    };
  });

  // Sort by score descending
  scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
  const topCandidates = scoredCandidates.slice(0, 10);

  // 3. AI Enrichment for deep natural language "Why this resource matches you"
  const systemInstruction = `
You are the AgriShare Smart Matchmaker. 
Review the top candidate database resources for the farmer.
For each resource, generate a concise, persuasive, and 100% accurate "Why this resource matches you" explanation based ONLY on the provided attributes (location, crop suitability, price, horsepower, land size).
Return JSON:
{
  "matches": [
    {
      "resourceId": "must_match_candidate_id",
      "refinedReason": "1-2 sentence reason highlighting location, crop match, or equipment power.",
      "keyHighlight": "e.g. 55 HP Diesel Tractor ideal for 3-acre wet paddy tillage"
    }
  ],
  "agronomicSummary": "Short advice for this operation"
}
`;

  const prompt = `
FARMER CRITERIA:
- Crop: ${crop}
- Land Area: ${landSize} ${landUnit}
- Activity/Stage: ${activity}
- District: ${district || 'Madurai'}
- With Operator Required: ${withOperator ? 'Yes' : 'No'}

CANDIDATES:
${JSON.stringify(topCandidates.map(c => ({ id: c.resourceId, ...c.details })), null, 2)}
`;

  const llmResult = await callLLM(systemInstruction, prompt, 0.2);
  const parsed = safeJSONParse(llmResult, null);

  // Merge AI refined reasons if valid
  if (parsed && parsed.matches && Array.isArray(parsed.matches)) {
    const reasonMap = new Map(parsed.matches.map(m => [m.resourceId, m]));
    topCandidates.forEach(c => {
      const aiMatch = reasonMap.get(c.resourceId);
      if (aiMatch && aiMatch.refinedReason) {
        c.matchReason = aiMatch.refinedReason;
      }
      if (aiMatch && aiMatch.keyHighlight) {
        c.keyHighlight = aiMatch.keyHighlight;
      }
    });
  }

  return {
    success: true,
    matches: topCandidates,
    agronomicSummary: parsed?.agronomicSummary || `Identified ${topCandidates.length} high-compatibility resources in the platform database for your ${crop} field.`
  };
};

module.exports = {
  matchResources
};
