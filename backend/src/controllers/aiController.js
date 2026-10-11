const AIConversation = require('../models/AIConversation');
const PlatformActivity = require('../models/PlatformActivity');
const { askFarmerAssistant } = require('../services/ai/farmerAssistantService');
const { matchResources } = require('../services/ai/matchingService');
const { getPersonalizedRecommendations } = require('../services/ai/recommendationService');
const { analyzeAgriculturalRequirement } = require('../services/ai/requirementAnalyzerService');
const { getSeasonalDemandAnalysis } = require('../services/ai/demandAnalysisService');
const { getOwnerIntelligence } = require('../services/ai/ownerIntelligenceService');

/**
 * @desc    Chat with Grounded AI Farmer Assistant
 * @route   POST /api/ai/assistant/chat
 */
const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const result = await askFarmerAssistant(req.user._id, message.trim(), conversationId);

    // Track platform activity
    await PlatformActivity.create({
      user: req.user._id,
      action: 'AI_QUERY_PERFORMED',
      metadata: { query: message.substring(0, 80) }
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's AI conversations list
 * @route   GET /api/ai/conversations
 */
const getConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({ farmer: req.user._id })
      .select('title createdAt updatedAt contextSnapshot messages')
      .sort({ updatedAt: -1 });

    const formatted = conversations.map(c => ({
      _id: c._id,
      title: c.title,
      updatedAt: c.updatedAt,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.content.substring(0, 60) || ''
    }));

    res.status(200).json({
      success: true,
      conversations: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single AI conversation with all messages
 * @route   GET /api/ai/conversations/:id
 */
const getConversationById = async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOne({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an AI conversation
 * @route   DELETE /api/ai/conversations/:id
 */
const deleteConversation = async (req, res, next) => {
  try {
    const result = await AIConversation.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user._id
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Smart Resource Matching
 * @route   POST /api/ai/smart-match
 */
const runSmartMatching = async (req, res, next) => {
  try {
    const result = await matchResources({
      userId: req.user?._id,
      ...req.body
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Agricultural Requirement Analyzer
 * @route   POST /api/ai/requirement-analyzer
 */
const runRequirementAnalyzer = async (req, res, next) => {
  try {
    const { crop, landSize, landUnit, farmingStage, currentRequirement, district } = req.body;

    const result = await analyzeAgriculturalRequirement({
      crop,
      landSize,
      landUnit,
      farmingStage,
      currentRequirement,
      district
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized proactive AI recommendations for current farmer
 * @route   GET /api/ai/recommendations
 */
const getPersonalizedRecs = async (req, res, next) => {
  try {
    const result = await getPersonalizedRecommendations(req.user._id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI Seasonal Resource Demand Analysis
 * @route   GET /api/ai/seasonal-demand
 */
const getSeasonalDemand = async (req, res, next) => {
  try {
    const { district, crop } = req.query;
    const result = await getSeasonalDemandAnalysis(district, crop);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resource Owner Intelligence & Fleet Insights
 * @route   GET /api/ai/owner-intelligence
 */
const getOwnerIntelligenceData = async (req, res, next) => {
  try {
    const result = await getOwnerIntelligence(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant,
  getConversations,
  getConversationById,
  deleteConversation,
  runSmartMatching,
  runRequirementAnalyzer,
  getPersonalizedRecs,
  getSeasonalDemand,
  getOwnerIntelligenceData
};
