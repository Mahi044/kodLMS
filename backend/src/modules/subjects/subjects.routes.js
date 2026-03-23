const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const subjectsController = require('./subjects.controller');

const router = Router();

// Public: list all subjects
router.get('/', subjectsController.list);

// Public: get subject details
router.get('/:id', subjectsController.detail);

// Protected: get course tree with lock/completion status
router.get('/:id/tree', authenticate, subjectsController.tree);

module.exports = router;
