const prisma = require('../../utils/prisma');

/**
 * Get a user's progress for a specific video
 */
async function getVideoProgress(userId, videoId) {
  const progress = await prisma.videoProgress.findUnique({
    where: { user_id_video_id: { user_id: userId, video_id: videoId } },
  });

  return progress || { last_position_seconds: 0, is_completed: false, completed_at: null };
}

/**
 * Upsert video progress (update position or mark complete).
 * ENFORCES lock check — rejects progress updates on locked videos.
 */
async function upsertVideoProgress(userId, videoId, { last_position_seconds, is_completed }) {
  // First, verify the video exists and check lock status
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: { section: true },
  });

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  // Check if this video is locked (previous video not completed)
  const subjectId = video.section.subject_id;

  // Get all videos in the subject in strict order
  const allSections = await prisma.section.findMany({
    where: { subject_id: subjectId },
    orderBy: { order_index: 'asc' },
    include: { videos: { orderBy: { order_index: 'asc' } } },
  });

  const allVideos = [];
  for (const section of allSections) {
    for (const v of section.videos) {
      allVideos.push(v);
    }
  }

  const currentIndex = allVideos.findIndex((v) => v.id === videoId);

  // Enforce lock: if there's a previous video, it must be completed
  if (currentIndex > 0) {
    const prevVideo = allVideos[currentIndex - 1];
    const prevProgress = await prisma.videoProgress.findUnique({
      where: { user_id_video_id: { user_id: userId, video_id: prevVideo.id } },
    });

    if (!prevProgress || !prevProgress.is_completed) {
      const err = new Error(`Video is locked. Complete "${prevVideo.title}" first.`);
      err.statusCode = 403;
      throw err;
    }
  }

  // Build data for upsert
  const data = {};
  if (last_position_seconds !== undefined) {
    data.last_position_seconds = Math.floor(last_position_seconds);
  }
  if (is_completed) {
    data.is_completed = true;
    data.completed_at = new Date();
  }

  const progress = await prisma.videoProgress.upsert({
    where: { user_id_video_id: { user_id: userId, video_id: videoId } },
    create: {
      user_id: userId,
      video_id: videoId,
      last_position_seconds: data.last_position_seconds || 0,
      is_completed: data.is_completed || false,
      completed_at: data.completed_at || null,
    },
    update: data,
  });

  return progress;
}

/**
 * Get overall progress for a user in a subject.
 * Returns: total_videos, completed_videos, percent_complete,
 *          last_video_id, last_position_seconds (for "Continue Learning")
 */
async function getSubjectProgress(userId, subjectId) {
  // Get all videos in the subject (ordered)
  const sections = await prisma.section.findMany({
    where: { subject_id: subjectId },
    orderBy: { order_index: 'asc' },
    include: {
      videos: {
        select: { id: true },
        orderBy: { order_index: 'asc' },
      },
    },
  });

  const allVideoIds = sections.flatMap((s) => s.videos.map((v) => v.id));
  const totalVideos = allVideoIds.length;

  if (totalVideos === 0) {
    return {
      total_videos: 0,
      completed_videos: 0,
      percent_complete: 0,
      progress_percentage: 0,
      last_video_id: null,
      last_position_seconds: 0,
    };
  }

  // Count completed videos
  const completedCount = await prisma.videoProgress.count({
    where: {
      user_id: userId,
      video_id: { in: allVideoIds },
      is_completed: true,
    },
  });

  // Find the most recently watched video in this subject
  // (the one with the latest updated progress record)
  const lastWatched = await prisma.videoProgress.findFirst({
    where: {
      user_id: userId,
      video_id: { in: allVideoIds },
    },
    orderBy: { id: 'desc' }, // Most recently upserted
    select: { video_id: true, last_position_seconds: true },
  });

  const percentComplete = Math.round((completedCount / totalVideos) * 100);

  return {
    total_videos: totalVideos,
    completed_videos: completedCount,
    percent_complete: percentComplete,
    progress_percentage: percentComplete, // backward compat
    last_video_id: lastWatched?.video_id || allVideoIds[0] || null,
    last_position_seconds: lastWatched?.last_position_seconds || 0,
  };
}

module.exports = { getVideoProgress, upsertVideoProgress, getSubjectProgress };
