const prisma = require('../../utils/prisma');

/**
 * Overview stats for admin dashboard.
 */
async function getOverviewStats() {
  const [totalUsers, totalEnrollments, totalSubjects, totalPayments] = await Promise.all([
    prisma.user.count(),
    prisma.enrollment.count(),
    prisma.subject.count({ where: { is_published: true } }),
    prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount_cents: true },
      _count: true,
    }),
  ]);

  return {
    totalUsers,
    totalEnrollments,
    totalSubjects,
    totalRevenueCents: totalPayments._sum.amount_cents || 0,
    totalPayments: totalPayments._count || 0,
  };
}

/**
 * Per-course stats: enrollments, completion rate, revenue.
 */
async function getCourseStats() {
  const subjects = await prisma.subject.findMany({
    where: { is_published: true },
    include: {
      _count: { select: { enrollments: true } },
      sections: {
        include: { videos: { select: { id: true } } },
      },
      payments: {
        where: { status: 'completed' },
        select: { amount_cents: true },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  const results = await Promise.all(
    subjects.map(async (subject) => {
      const allVideoIds = subject.sections.flatMap((s) => s.videos.map((v) => v.id));
      const totalVideos = allVideoIds.length;

      // Count distinct users who completed ALL videos
      let completionCount = 0;
      if (totalVideos > 0) {
        const enrolledUsers = await prisma.enrollment.findMany({
          where: { subject_id: subject.id },
          select: { user_id: true },
        });

        for (const { user_id } of enrolledUsers) {
          const done = await prisma.videoProgress.count({
            where: { user_id, video_id: { in: allVideoIds }, is_completed: true },
          });
          if (done >= totalVideos) completionCount++;
        }
      }

      const revenue = subject.payments.reduce((sum, p) => sum + p.amount_cents, 0);

      return {
        id: subject.id,
        title: subject.title,
        is_free: subject.is_free,
        price_cents: subject.price_cents,
        enrollments: subject._count.enrollments,
        totalVideos,
        completionCount,
        completionRate: subject._count.enrollments > 0
          ? Math.round((completionCount / subject._count.enrollments) * 100)
          : 0,
        revenueCents: revenue,
      };
    })
  );

  return results;
}

module.exports = { getOverviewStats, getCourseStats };
