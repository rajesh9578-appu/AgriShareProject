const express = require('express');
const router = express.Router();
const {
  createRequest,
  getFarmerRequests,
  getOwnerRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest
} = require('../controllers/requestController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, createRequest);
router.get('/my-requests', protect, getFarmerRequests);
router.get('/owner-requests', protect, getOwnerRequests);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/reject', protect, rejectRequest);
router.put('/:id/cancel', protect, cancelRequest);

module.exports = router;
