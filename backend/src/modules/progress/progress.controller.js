const progressService = require('./progress.service');

/**
 * GET /api/progress/videos/:id
 * Returns the user's progress on a specific video.
 */
async function getVideoProgress(req, res) {
  const videoId = parseInt(req.params.id);
  if (isNaN(videoId)) return res.status(400).json({ error: 'Invalid video ID' });

  const progress = await progressService.getVideoProgress(req.user.id, videoId);
  res.json({ progress });
}

/**
 * POST /api/progress/videos/:id
 * Upserts video progress (position and/or completion).
 * Backend enforces lock check.
 */
async function upsertVideoProgress(req, res) {
  const videoId = parseInt(req.params.id);
  if (isNaN(videoId)) return res.status(400).json({ error: 'Invalid video ID' });

  const { last_position_seconds, is_completed } = req.body;

  const progress = await progressService.upsertVideoProgress(req.user.id, videoId, {
    last_position_seconds,
    is_completed,
  });

  res.json({ progress });
}

/**
 * GET /api/progress/subjects/:id
 * Returns overall completion stats for a subject.
 */
async function getSubjectProgress(req, res) {
  const subjectId = parseInt(req.params.id);
  if (isNaN(subjectId)) return res.status(400).json({ error: 'Invalid subject ID' });

  const progress = await progressService.getSubjectProgress(req.user.id, subjectId);
  res.json({ progress });
}

module.exports = { getVideoProgress, upsertVideoProgress, getSubjectProgress };
