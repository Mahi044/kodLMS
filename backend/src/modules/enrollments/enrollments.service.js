const prisma = require('../../utils/prisma');

/**
 * Enroll a user in a subject. Idempotent — safe to call multiple times.
 */
async function enrollUser(userId, subjectId) {
  // Verify subject exists and is published
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    const err = new Error('Subject not found');
    err.statusCode = 404;
    throw err;
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
    create: { user_id: userId, subject_id: subjectId },
    update: {},
  });

  return enrollment;
}

/**
 * Get all enrollments for a user, with subject info and progress stats.
 */
async function getMyEnrollments(userId) {
  const enrollments = await prisma.enrollment.findMany({
    where: { user_id: userId },
    include: {
      subject: {
        include: {
          _count: { select: { sections: true } },
          sections: {
            include: {
              videos: { select: { id: true } },
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  // For each enrollment, compute progress + last watched video
  const results = await Promise.all(
    enrollments.map(async (enrollment) => {
      const allVideoIds = enrollment.subject.sections.flatMap((s) =>
        s.videos.map((v) => v.id)
      );
      const totalVideos = allVideoIds.length;

      // Count completed
      const completedCount = totalVideos > 0
        ? await prisma.videoProgress.count({
            where: {
              user_id: userId,
              video_id: { in: allVideoIds },
              is_completed: true,
            },
          })
        : 0;

      // Last watched video
      const lastWatched = totalVideos > 0
        ? await prisma.videoProgress.findFirst({
            where: { user_id: userId, video_id: { in: allVideoIds } },
            orderBy: { id: 'desc' },
            include: { video: { select: { id: true, title: true } } },
          })
        : null;

      return {
        id: enrollment.id,
        enrolled_at: enrollment.created_at,
        subject: {
          id: enrollment.subject.id,
          title: enrollment.subject.title,
          slug: enrollment.subject.slug,
          description: enrollment.subject.description,
          _count: { sections: enrollment.subject._count.sections },
        },
        progress: {
          total_videos: totalVideos,
          completed_videos: completedCount,
          percent_complete: totalVideos > 0
            ? Math.round((completedCount / totalVideos) * 100)
            : 0,
          last_video_id: lastWatched?.video?.id || null,
          last_video_title: lastWatched?.video?.title || null,
          last_position_seconds: lastWatched?.last_position_seconds || 0,
        },
      };
    })
  );

  return results;
}

/**
 * Check if a user is enrolled in a subject. Returns boolean.
 */
async function isEnrolled(userId, subjectId) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
  });
  return !!enrollment;
}

module.exports = { enrollUser, getMyEnrollments, isEnrolled };
