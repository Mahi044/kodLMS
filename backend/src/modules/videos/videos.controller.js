const videosService = require('./videos.service');

/**
 * GET /api/videos/:id
 * Returns video details with navigation and lock status.
 */
async function detail(req, res) {
  const videoId = parseInt(req.params.id);
  if (isNaN(videoId)) return res.status(400).json({ error: 'Invalid video ID' });

  const video = await videosService.getVideoWithNavigation(videoId, req.user.id);
  res.json({ video });
}

module.exports = { detail };
