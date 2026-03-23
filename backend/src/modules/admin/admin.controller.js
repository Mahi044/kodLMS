const adminService = require('./admin.service');

async function createSubject(req, res) {
  const { title, description, is_published } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  
  const subject = await adminService.createSubject({ title, description, is_published });
  res.status(201).json({ message: 'Subject created successfully', subject });
}

async function updateSubject(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid subject ID' });

  const subject = await adminService.updateSubject(id, req.body);
  res.json({ message: 'Subject updated successfully', subject });
}

async function createSection(req, res) {
  const { subject_id, title, order_index } = req.body;
  if (!subject_id || !title || order_index === undefined) {
    return res.status(400).json({ error: 'subject_id, title, and order_index are required' });
  }

  const section = await adminService.createSection({ subject_id: parseInt(subject_id), title, order_index: parseInt(order_index) });
  res.status(201).json({ message: 'Section created successfully', section });
}

async function createVideo(req, res) {
  const { section_id, title, description, youtube_url, order_index, duration_seconds } = req.body;
  if (!section_id || !title || !youtube_url || order_index === undefined) {
    return res.status(400).json({ error: 'section_id, title, youtube_url, and order_index are required' });
  }

  const video = await adminService.createVideo({
    section_id: parseInt(section_id),
    title,
    description,
    youtube_url,
    order_index: parseInt(order_index),
    duration_seconds: parseInt(duration_seconds) || 0,
  });
  
  res.status(201).json({ message: 'Video created successfully', video });
}

async function deleteVideo(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid video ID' });

  await adminService.deleteVideo(id);
  res.json({ message: 'Video deleted successfully' });
}

module.exports = {
  createSubject,
  updateSubject,
  createSection,
  createVideo,
  deleteVideo,
};
