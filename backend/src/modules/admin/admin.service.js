const prisma = require('../../utils/prisma');

async function createSubject(data) {
  const { title, description } = data;
  // Generate a basic slug
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return prisma.subject.create({
    data: { title, description, slug },
  });
}

async function updateSubject(id, data) {
  const { title, description } = data;
  return prisma.subject.update({
    where: { id },
    data: { title, description },
  });
}

async function createSection(data) {
  const { subject_id, title, order_index } = data;
  
  // Check for duplicate order_index
  const existing = await prisma.section.findFirst({
    where: { subject_id, order_index },
  });
  if (existing) {
    const err = new Error(`Section with order_index ${order_index} already exists in this subject.`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.section.create({
    data: { subject_id, title, order_index },
  });
}

async function createVideo(data) {
  const { section_id, title, description, youtube_url, order_index, duration_seconds } = data;

  // Validate YouTube URL basic format
  if (!youtube_url.includes('youtube.com') && !youtube_url.includes('youtu.be')) {
    const err = new Error('Invalid YouTube URL');
    err.statusCode = 400;
    throw err;
  }

  // Check for duplicate order_index
  const existing = await prisma.video.findFirst({
    where: { section_id, order_index },
  });
  if (existing) {
    const err = new Error(`Video with order_index ${order_index} already exists in this section.`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.video.create({
    data: { section_id, title, description, youtube_url, order_index, duration_seconds: duration_seconds || 0 },
  });
}

async function deleteVideo(id) {
  return prisma.video.delete({
    where: { id },
  });
}

module.exports = {
  createSubject,
  updateSubject,
  createSection,
  createVideo,
  deleteVideo,
};
