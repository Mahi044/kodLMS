const subjectsService = require('./subjects.service');

/**
 * GET /api/subjects
 * Returns all published subjects.
 */
async function list(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const result = await subjectsService.getAllSubjects(req.query.q, page, limit);
  res.json(result);
}

/**
 * GET /api/subjects/:id
 * Returns a single subject with section/video counts.
 */
async function detail(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid subject ID' });

  const subject = await subjectsService.getSubjectById(id);
  res.json({ subject });
}

/**
 * GET /api/subjects/:id/tree
 * Returns the full course tree with lock/completion status per video.
 * Requires authentication.
 */
async function tree(req, res) {
  const subjectId = parseInt(req.params.id);
  if (isNaN(subjectId)) return res.status(400).json({ error: 'Invalid subject ID' });

  const userId = req.user.id;

  // Auto-enroll the user when they view the course tree
  await subjectsService.ensureEnrollment(userId, subjectId);

  const data = await subjectsService.getSubjectTree(subjectId, userId);
  res.json(data);
}

module.exports = { list, detail, tree };
