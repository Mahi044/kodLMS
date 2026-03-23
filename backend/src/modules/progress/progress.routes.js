const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const progressController = require('./progress.controller');

const router = Router();

// All progress routes require authentication
router.use(authenticate);

router.get('/videos/:id', progressController.getVideoProgress);
router.post('/videos/:id', progressController.upsertVideoProgress);
router.get('/subjects/:id', progressController.getSubjectProgress);

module.exports = router;
