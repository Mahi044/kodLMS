const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const videosController = require('./videos.controller');

const router = Router();

// Protected: get video details with navigation
router.get('/:id', authenticate, videosController.detail);

module.exports = router;
