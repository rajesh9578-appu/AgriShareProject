const Resource = require('../../models/Resource');
const FarmerProfile = require('../../models/FarmerProfile');
const AIConversation = require('../../models/AIConversation');
const { callLLM, safeJSONParse } = require('./aiService');

const askFarmerAssistant = async (userId, userMessage, conversationId = null) => {
  // 1. Fetch Farmer Profile
  const profile = await FarmerProfile.findOne({ user: userId });
  const farmerContext = profile
    ? {
        district: profile.district || 'Tamil Nadu',
        landArea: `${profile.landArea || 1} ${profile.landUnit || 'acres'}`,
        soilType: profile.soilType || 'Red Soil',
        irrigationType: profile.irrigationType || 'Borewell',
        cropsCultivated: profile.cropsCultivated || ['Paddy'],
        preferredResources: profile.preferredResources || []
      }
    : {
        district: 'Madurai',
        landArea: '2 acres',
        soilType: 'Red Soil',
        irrigationType: 'Borewell',
        cropsCultivated: ['Paddy'],
        preferredResources: []
      };

  // 2. Query Candidate Resources from Database (Source of Truth)
  const candidateResources = await Resource.find({
    verificationStatus: 'VERIFIED',
    'availability.isAvailable': true
  })
    .populate('owner', 'name phone email')
    .limit(25)
    .lean();

  const formattedCandidates = candidateResources.map(r => ({
    id: r._id.toString(),
    name: r.name,
    category: r.category,
    price: `₹${r.pricing.price} / ${r.pricing.unit.replace('_', ' ')}`,
    rawPrice: r.pricing.price,
    unit: r.pricing.unit,
    district: r.location.district,
    village: r.location.village || '',
    condition: r.condition,
    suitableCrops: r.suitableCrops,
    suitableLandMin: r.suitableLandSize?.min || 0.5,
    suitableLandMax: r.suitableLandSize?.max || 100,
    withOperator: r.specs?.withOperator ? 'Yes' : 'No',
    rating: r.ratingSummary?.average || 4.5
  }));

  // 3. Construct Structured AI Prompt
  const systemInstruction = `
You are the "AgriShare Intelligent Farmer Assistant" - a specialized agricultural AI advisor for farmers and resource sharing.
Strict Rules:
1. Grounding: You must NEVER invent agricultural resources, equipment names, prices, owners, or fake availability that are not present in the CANDIDATE_RESOURCES list.
2. Agricultural Guidance: You CAN provide expert agronomy advice (e.g. ideal soil preparation, tractor HP needed for acre size, crop rotation, irrigation tips, pest mitigation tools).
3. If matching resources exist in CANDIDATE_RESOURCES: Mention them specifically and explain why they fit the farmer's land size, crop, or district.
4. If NO matching resource exists in the database for the farmer's query: State clearly: "We currently do not have this equipment listed in the platform database for your area, but here is what to look for...", then offer practical farming guidance.
5. Response Format: Return JSON with:
{
  "content": "Friendly, informative response in markdown with clear headings, bullet points, and practical advice.",
  "matchedResourceIds": ["valid_id_from_candidates_only"],
  "suggestedActions": [{"label": "View Tractor in Madurai", "action": "search", "query": "Tractor Madurai"}]
}
`;

  const prompt = `
FARMER PROFILE CONTEXT:
- District: ${farmerContext.district}
- Land Size: ${farmerContext.landArea}
- Soil: ${farmerContext.soilType}
- Irrigation: ${farmerContext.irrigationType}
- Crops Cultivated: ${farmerContext.cropsCultivated.join(', ')}

AVAILABLE PLATFORM CANDIDATE RESOURCES IN DATABASE:
${JSON.stringify(formattedCandidates, null, 2)}

FARMER'S QUESTION:
"${userMessage}"
`;

  let parsed = null;
  const llmResponse = await callLLM(systemInstruction, prompt, 0.2);

  if (llmResponse) {
    parsed = safeJSONParse(llmResponse, null);
  }

  // Fallback Rule-based Engine if LLM unavailable
  if (!parsed || !parsed.content) {
    const queryLower = userMessage.toLowerCase();
    const matched = formattedCandidates.filter(r => {
      const matchCat = r.category.toLowerCase().split(' ').some(c => queryLower.includes(c.toLowerCase()));
      const matchName = r.name.toLowerCase().split(' ').some(n => queryLower.includes(n.toLowerCase()));
      const matchDist = r.district.toLowerCase() === farmerContext.district.toLowerCase() || queryLower.includes(r.district.toLowerCase());
      const matchCrop = r.suitableCrops.some(sc => sc.toLowerCase() === 'all crops' || queryLower.includes(sc.toLowerCase()) || farmerContext.cropsCultivated.some(fc => sc.toLowerCase().includes(fc.toLowerCase())));
      return (matchCat || matchName) && (matchDist || matchCrop);
    }).slice(0, 3);

    const resourceHighlights = matched.length > 0
      ? `\n\n### Verified Platform Resources Available for You:\n` +
        matched.map(m => `- **${m.name}** (${m.category}) in ${m.district} • ${m.price} (Rating: ★${m.rating})`).join('\n')
      : `\n\n*Note: No exact equipment matches currently found in ${farmerContext.district} database for this specific item, but you can explore nearby districts.*`;

    parsed = {
      content: `Hello! Based on your farm in **${farmerContext.district}** (${farmerContext.landArea}, **${farmerContext.cropsCultivated.join(', ')}**):\n\n` +
        `For your requirement, appropriate agricultural equipment should support your soil type (**${farmerContext.soilType}**) and current crop cycle.\n` +
        resourceHighlights +
        `\n\n**Agronomy Tip**: Ensure the soil moisture is optimal before land preparation to prevent equipment strain and soil compaction.`,
      matchedResourceIds: matched.map(m => m.id),
      suggestedActions: [
        { label: 'Search Nearby Equipment', action: 'search', query: farmerContext.district },
        { label: 'Analyze Crop Requirements', action: 'analyze', query: farmerContext.cropsCultivated[0] || 'Paddy' }
      ]
    };
  }

  // 4. Validate matchedResourceIds against real candidate list (NO hallucination allowed)
  const candidateIdSet = new Set(candidateResources.map(r => r._id.toString()));
  const validMatchedIds = (parsed.matchedResourceIds || []).filter(id => candidateIdSet.has(id.toString()));

  const matchedResourcesData = candidateResources
    .filter(r => validMatchedIds.includes(r._id.toString()))
    .map(r => ({
      resourceId: r._id,
      name: r.name,
      category: r.category,
      price: r.pricing.price,
      unit: r.pricing.unit,
      location: `${r.location.district}, ${r.location.state}`,
      matchReason: `Available in ${r.location.district} suitable for ${r.suitableCrops.join(', ')}`,
      verified: r.verificationStatus === 'VERIFIED',
      photos: r.photos || []
    }));

  // 5. Store / Update AI Conversation History in DB
  let conversation;
  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, farmer: userId });
  }

  if (!conversation) {
    conversation = new AIConversation({
      farmer: userId,
      title: userMessage.length > 40 ? `${userMessage.substring(0, 37)}...` : userMessage,
      contextSnapshot: {
        crop: farmerContext.cropsCultivated[0] || '',
        landArea: parseFloat(farmerContext.landArea) || 1,
        soilType: farmerContext.soilType,
        district: farmerContext.district
      },
      messages: []
    });
  }

  // Append user & assistant messages
  conversation.messages.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  });

  conversation.messages.push({
    role: 'assistant',
    content: parsed.content,
    matchedResources: matchedResourcesData,
    suggestedActions: parsed.suggestedActions || [],
    timestamp: new Date()
  });

  await conversation.save();

  return {
    conversationId: conversation._id,
    content: parsed.content,
    matchedResources: matchedResourcesData,
    suggestedActions: parsed.suggestedActions || []
  };
};

module.exports = {
  askFarmerAssistant
};
