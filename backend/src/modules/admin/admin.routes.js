const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const adminController = require('./admin.controller');

const router = Router();

// Protect all admin routes with authentication and admin role requirement
router.use(authenticate, requireRole('admin'));

// Subjects
router.post('/subjects', adminController.createSubject);
router.put('/subjects/:id', adminController.updateSubject);

// Sections
router.post('/sections', adminController.createSection);

// Videos
router.post('/videos', adminController.createVideo);
router.delete('/videos/:id', adminController.deleteVideo);

// Admin Requests
router.get('/users/requests', adminController.getAdminRequests);
router.post('/users/:id/approve', adminController.approveAdmin);
router.post('/users/:id/reject', adminController.rejectAdmin);

module.exports = router;
