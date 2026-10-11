const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  toggleAvailability,
  getOwnerResources
} = require('../controllers/resourceController');
const { protect, optionalAuth, authorize } = require('../middlewares/auth');

router.get('/', optionalAuth, getAllResources);
router.get('/owner/my-resources', protect, getOwnerResources);
router.get('/:id', optionalAuth, getResourceById);

router.post('/', protect, createResource);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);
router.patch('/:id/availability', protect, toggleAvailability);

module.exports = router;
