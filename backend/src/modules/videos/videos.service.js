const prisma = require('../../utils/prisma');

/**
 * Get video details with previous/next video IDs and lock status.
 * Lock is determined by the strict sequential order within the subject.
 */
async function getVideoWithNavigation(videoId, userId) {
  // Get the video with its section and subject
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      section: {
        include: { subject: true },
      },
    },
  });

  if (!video) {
    const err = new Error('Video not found');
    err.statusCode = 404;
    throw err;
  }

  const subjectId = video.section.subject_id;

  // Get ALL videos in this subject in order (across all sections)
  const allSections = await prisma.section.findMany({
    where: { subject_id: subjectId },
    orderBy: { order_index: 'asc' },
    include: {
      videos: { orderBy: { order_index: 'asc' } },
    },
  });

  // Flatten videos
  const allVideos = [];
  for (const section of allSections) {
    for (const v of section.videos) {
      allVideos.push(v);
    }
  }

  // Find the current video's index in the global order
  const currentIndex = allVideos.findIndex((v) => v.id === videoId);

  const previousVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  // Determine lock status and ENFORCE it — locked videos cannot be accessed
  let locked = false;
  let unlock_reason = null;

  if (currentIndex > 0) {
    const prevProgress = await prisma.videoProgress.findUnique({
      where: { user_id_video_id: { user_id: userId, video_id: previousVideo.id } },
    });
    if (!prevProgress || !prevProgress.is_completed) {
      locked = true;
      unlock_reason = `Complete "${previousVideo.title}" first`;

      // HARD ENFORCEMENT: reject access to locked videos
      const err = new Error(unlock_reason);
      err.statusCode = 403;
      err.locked = true;
      err.unlock_reason = unlock_reason;
      throw err;
    }
  }

  // Get current progress
  const progress = await prisma.videoProgress.findUnique({
    where: { user_id_video_id: { user_id: userId, video_id: videoId } },
  });

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    youtube_url: video.youtube_url,
    duration_seconds: video.duration_seconds,
    section_title: video.section.title,
    subject_title: video.section.subject.title,
    locked,
    unlock_reason,
    is_completed: progress?.is_completed || false,
    last_position_seconds: progress?.last_position_seconds || 0,
    previous_video_id: previousVideo?.id || null,
    next_video_id: nextVideo?.id || null,
  };
}

module.exports = { getVideoWithNavigation };
