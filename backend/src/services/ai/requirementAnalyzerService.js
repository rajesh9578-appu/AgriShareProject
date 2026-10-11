const Resource = require('../../models/Resource');
const Crop = require('../../models/Crop');
const { callLLM, safeJSONParse } = require('./aiService');

/**
 * Agricultural Requirement Analyzer:
 * Decomposes farming stage & crop into equipment categories, then queries live DB for available equipment.
 */
const analyzeAgriculturalRequirement = async ({
  crop = 'Paddy',
  landSize = 2,
  landUnit = 'acres',
  farmingStage = 'Land Preparation',
  currentRequirement = '',
  district = 'Madurai'
}) => {
  // 1. Stage-to-Equipment Domain Knowledge Mapping
  const stageCategoryMap = {
    'Land Preparation': ['Tractor', 'Rotavator', 'Cultivator', 'Disc Plough', 'Leveller'],
    'Sowing / Planting': ['Seed Drill', 'Paddy Transplanter', 'Ridge Maker', 'Broadcaster'],
    'Crop Care / Weeding': ['Power Weeder', 'Sprayer', 'Drip Irrigation Equipment', 'Water Pump'],
    'Harvesting / Threshing': ['Combine Harvester', 'Thresher', 'Paddy Reaper', 'Multi-crop Harvester'],
    'Post-Harvest & Transport': ['Tractor Trolley', 'Storage Space', 'Agricultural Transport Truck', 'Grain Dryer']
  };

  const defaultCategories = stageCategoryMap[farmingStage] || ['Tractor', 'Sprayer', 'Harvester'];

  // 2. AI Requirement Analysis
  const systemInstruction = `
You are an expert Agronomist and Agricultural Machinery Specialist.
A farmer has provided details on their crop, land size, farming stage, and current requirement.
Analyze this requirement and:
1. Identify 2 to 4 essential resource categories needed for this specific stage.
2. Provide concise agronomic guidance on the best sequence of operations.
3. Suggest the optimal equipment capacity (e.g., Tractor HP, sprayer nozzle type).

Return STRICT JSON:
{
  "suggestedCategories": ["Category1", "Category2", "Category3"],
  "stageSummary": "Concise 1-2 sentence overview of optimal operations for this stage.",
  "recommendedCapacity": "e.g., 40-50 HP Tractor with 42-blade Rotavator for wet puddling",
  "agronomicTips": [
    "Tip 1 regarding soil preparation moisture or depth",
    "Tip 2 regarding timing or equipment maintenance"
  ]
}
`;

  const prompt = `
FARMER INPUT:
- Crop: ${crop}
- Land Area: ${landSize} ${landUnit}
- Farming Stage: ${farmingStage}
- Current Requirement: "${currentRequirement || 'Need suitable machinery for operations'}"
- Location: ${district}
`;

  const llmResponse = await callLLM(systemInstruction, prompt, 0.2);
  let parsed = safeJSONParse(llmResponse, null);

  if (!parsed || !parsed.suggestedCategories || !Array.isArray(parsed.suggestedCategories)) {
    parsed = {
      suggestedCategories: defaultCategories.slice(0, 3),
      stageSummary: `For ${crop} at the ${farmingStage} stage on a ${landSize} ${landUnit} farm, efficient mechanical equipment ensures uniform soil tilth and timely planting.`,
      recommendedCapacity: `${landSize <= 3 ? '35-45 HP Tractor' : '45-60 HP Tractor'} with standard attachments`,
      agronomicTips: [
        `Ensure proper soil moisture level before starting ${farmingStage.toLowerCase()} to avoid compaction.`,
        `Inspect equipment blade sharpness and hydraulic connections before beginning field runs.`
      ]
    };
  }

  // 3. Query ACTUAL platform database resources matching the suggested categories
  const categoriesRegex = parsed.suggestedCategories.map(cat => new RegExp(cat, 'i'));
  const dbQuery = {
    verificationStatus: 'VERIFIED',
    'availability.isAvailable': true,
    $or: [
      { category: { $in: categoriesRegex } },
      { name: { $in: categoriesRegex } }
    ]
  };

  const dbResources = await Resource.find(dbQuery)
    .populate('owner', 'name phone email avatar')
    .lean();

  // Score and highlight local resources
  const actualMatchedResources = dbResources.map(r => {
    const isNearby = r.location.district.toLowerCase() === district.toLowerCase();
    return {
      _id: r._id,
      name: r.name,
      category: r.category,
      price: r.pricing.price,
      unit: r.pricing.unit,
      district: r.location.district,
      village: r.location.village,
      photos: r.photos,
      rating: r.ratingSummary?.average || 4.8,
      condition: r.condition,
      isNearby,
      owner: r.owner,
      matchReason: `Matches suggested category "${r.category}" for your ${farmingStage} in ${r.location.district}`
    };
  });

  // Sort: nearby first, then by rating
  actualMatchedResources.sort((a, b) => {
    if (a.isNearby && !b.isNearby) return -1;
    if (!a.isNearby && b.isNearby) return 1;
    return b.rating - a.rating;
  });

  return {
    input: { crop, landSize, landUnit, farmingStage, currentRequirement, district },
    aiAnalysis: {
      suggestedCategories: parsed.suggestedCategories,
      stageSummary: parsed.stageSummary,
      recommendedCapacity: parsed.recommendedCapacity,
      agronomicTips: parsed.agronomicTips
    },
    actualDatabaseResources: actualMatchedResources,
    totalPlatformMatches: actualMatchedResources.length
  };
};

module.exports = {
  analyzeAgriculturalRequirement
};
