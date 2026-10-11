const express = require('express');
const router = express.Router();
const { createRating, getResourceRatings } = require('../controllers/ratingController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, createRating);
router.get('/resource/:resourceId', getResourceRatings);

module.exports = router;
