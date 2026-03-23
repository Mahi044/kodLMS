const enrollmentsService = require('./enrollments.service');

/**
 * POST /api/enrollments/:subjectId
 * Enroll the authenticated user in a subject.
 */
async function enroll(req, res) {
  const subjectId = parseInt(req.params.subjectId);
  if (isNaN(subjectId)) return res.status(400).json({ error: 'Invalid subject ID' });

  const enrollment = await enrollmentsService.enrollUser(req.user.id, subjectId);
  res.status(201).json({ message: 'Enrolled successfully', enrollment });
}

/**
 * GET /api/enrollments/my
 * Returns all courses the user is enrolled in, with progress stats.
 */
async function myEnrollments(req, res) {
  const enrollments = await enrollmentsService.getMyEnrollments(req.user.id);
  res.json({ enrollments });
}

/**
 * GET /api/enrollments/check/:subjectId
 * Check if user is enrolled in a specific subject.
 */
async function checkEnrollment(req, res) {
  const subjectId = parseInt(req.params.subjectId);
  if (isNaN(subjectId)) return res.status(400).json({ error: 'Invalid subject ID' });

  const enrolled = await enrollmentsService.isEnrolled(req.user.id, subjectId);
  res.json({ enrolled });
}

module.exports = { enroll, myEnrollments, checkEnrollment };
