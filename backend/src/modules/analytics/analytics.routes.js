const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const requireRole = require('../../middleware/requireRole');
const analyticsController = require('./analytics.controller');

const router = Router();

// All analytics routes require admin role
router.use(authenticate, requireRole('admin'));

router.get('/overview', analyticsController.getOverview);
router.get('/courses', analyticsController.getCourses);

module.exports = router;
