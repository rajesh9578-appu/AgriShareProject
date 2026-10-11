const express = require('express');
const router = express.Router();
const { toggleSaveResource, getSavedResources } = require('../controllers/savedResourceController');
const { protect } = require('../middlewares/auth');

router.post('/toggle', protect, toggleSaveResource);
router.get('/', protect, getSavedResources);

module.exports = router;
