const express = require('express');
const router = express.Router();
const {
  chatWithAssistant,
  getConversations,
  getConversationById,
  deleteConversation,
  runSmartMatching,
  runRequirementAnalyzer,
  getPersonalizedRecs,
  getSeasonalDemand,
  getOwnerIntelligenceData
} = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middlewares/auth');

// AI Assistant & Chat History
router.post('/assistant/chat', protect, chatWithAssistant);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversationById);
router.delete('/conversations/:id', protect, deleteConversation);

// AI Smart Matching & Requirement Analyzer
router.post('/smart-match', optionalAuth, runSmartMatching);
router.post('/requirement-analyzer', optionalAuth, runRequirementAnalyzer);

// AI Proactive Personalized Recommendations
router.get('/recommendations', protect, getPersonalizedRecs);

// AI Seasonal Demand & Owner Intelligence
router.get('/seasonal-demand', getSeasonalDemand);
router.get('/owner-intelligence', protect, getOwnerIntelligenceData);

module.exports = router;
