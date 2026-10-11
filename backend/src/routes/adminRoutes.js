const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  getAllAdminResources,
  updateResourceVerification,
  getCategories,
  createCategory,
  deleteCategory,
  getCrops,
  createCrop,
  deleteCrop,
  getAllAdminBookings
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

// All admin routes strictly require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);

router.get('/resources', getAllAdminResources);
router.patch('/resources/:id/verify', updateResourceVerification);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/crops', getCrops);
router.post('/crops', createCrop);
router.delete('/crops/:id', deleteCrop);

router.get('/bookings', getAllAdminBookings);

module.exports = router;
