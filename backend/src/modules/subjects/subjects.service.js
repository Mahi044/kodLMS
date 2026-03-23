const prisma = require('../../utils/prisma');

/**
 * Get all published subjects, optionally filtered by search query
 */
async function getAllSubjects(searchQuery) {
  const where = { is_published: true };

  if (searchQuery && searchQuery.trim()) {
    where.title = { contains: searchQuery.trim() };
  }

  return prisma.subject.findMany({
    where,
    include: {
      _count: { select: { sections: true } },
    },
    orderBy: { title: 'asc' },
  });
}

/**
 * Get a single subject by ID with stats
 */
async function getSubjectById(id) {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      sections: {
        include: { _count: { select: { videos: true } } },
        orderBy: { order_index: 'asc' },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!subject) {
    const err = new Error('Subject not found');
    err.statusCode = 404;
    throw err;
  }

  return subject;
}

/**
 * Get the full course tree (sections → videos) with lock/completion status.
 * Enforces strict sequential order: a video is locked if the previous video
 * (across all sections, ordered by section.order_index → video.order_index)
 * is not completed by the user.
 */
async function getSubjectTree(subjectId, userId) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        orderBy: { order_index: 'asc' },
        include: {
          videos: {
            orderBy: { order_index: 'asc' },
          },
        },
      },
    },
  });

  if (!subject) {
    const err = new Error('Subject not found');
    err.statusCode = 404;
    throw err;
  }

  // Flatten all videos in order across sections
  const allVideos = [];
  for (const section of subject.sections) {
    for (const video of section.videos) {
      allVideos.push(video);
    }
  }

  // Get user's progress for all videos in this subject
  const videoIds = allVideos.map((v) => v.id);
  const progressRecords = await prisma.videoProgress.findMany({
    where: { user_id: userId, video_id: { in: videoIds } },
  });

  // Create a map: video_id -> progress
  const progressMap = {};
  for (const p of progressRecords) {
    progressMap[p.video_id] = p;
  }

  // Build the tree with lock status
  // Rule: first video is unlocked. Each subsequent video is locked unless
  // the previous video (in flat order) is completed.
  const videoStatusMap = {};
  for (let i = 0; i < allVideos.length; i++) {
    const video = allVideos[i];
    const progress = progressMap[video.id];

    let locked = false;
    let unlock_reason = null;

    if (i === 0) {
      // First video is always unlocked
      locked = false;
    } else {
      const prevVideo = allVideos[i - 1];
      const prevProgress = progressMap[prevVideo.id];
      if (!prevProgress || !prevProgress.is_completed) {
        locked = true;
        unlock_reason = `Complete "${prevVideo.title}" first`;
      }
    }

    videoStatusMap[video.id] = {
      locked,
      unlock_reason,
      is_completed: progress?.is_completed || false,
      last_position_seconds: progress?.last_position_seconds || 0,
    };
  }

  // Reconstruct tree with status
  const tree = subject.sections.map((section) => ({
    id: section.id,
    title: section.title,
    order_index: section.order_index,
    videos: section.videos.map((video) => ({
      id: video.id,
      title: video.title,
      youtube_url: video.youtube_url,
      duration_seconds: video.duration_seconds,
      order_index: video.order_index,
      ...videoStatusMap[video.id],
    })),
  }));

  return { subject: { id: subject.id, title: subject.title, description: subject.description, slug: subject.slug }, sections: tree };
}

/**
 * Auto-enroll a user in a subject (if not already enrolled)
 */
async function ensureEnrollment(userId, subjectId) {
  await prisma.enrollment.upsert({
    where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    create: { user_id: userId, subject_id: subjectId },
    update: {},
  });
}

module.exports = { getAllSubjects, getSubjectById, getSubjectTree, ensureEnrollment };
