const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const enrollmentsController = require('./enrollments.controller');

const router = Router();

// All enrollment routes require authentication
router.use(authenticate);

// Enroll in a subject
router.post('/:subjectId', enrollmentsController.enroll);

// Get my enrollments (for dashboard)
router.get('/my', enrollmentsController.myEnrollments);

// Check enrollment status
router.get('/check/:subjectId', enrollmentsController.checkEnrollment);

module.exports = router;
