'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  HiPlayCircle,
  HiAcademicCap,
  HiBookOpen,
  HiCheckCircle,
  HiArrowRight,
} from 'react-icons/hi2';

function DashboardContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data } = await api.get('/enrollments/my');
      setEnrollments(data.enrollments);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Find the most recent course with progress
  const continueWatching = enrollments.find(
    (e) => e.progress.last_video_id && e.progress.percent_complete < 100
  );

  // Separate completed from in-progress
  const inProgress = enrollments.filter((e) => e.progress.percent_complete < 100);
  const completed = enrollments.filter((e) => e.progress.percent_complete === 100);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500 text-sm mt-1">Here&apos;s your learning overview</p>
        </div>

        {loading ? (
          /* Skeleton */
          <div className="space-y-8">
            <div className="h-48 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-40 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
              <div className="h-40 bg-surface-100 dark:bg-surface-800 rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : enrollments.length === 0 ? (
          /* Empty state — no enrollments */
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
              <HiAcademicCap className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-surface-700 dark:text-surface-300">
              You are not enrolled in any course
            </h2>
            <p className="text-surface-400 text-sm mt-2 max-w-md mx-auto mb-6">
              Browse available courses and start your learning journey today.
            </p>
            <Link
              href="/subjects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
            >
              Browse Courses
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Continue Watching */}
            {continueWatching && (
              <section>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                  <HiPlayCircle className="w-5 h-5 text-primary-500" />
                  Continue Watching
                </h2>
                <div
                  className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary-500/30 transition-all"
                  onClick={() =>
                    router.push(
                      `/subjects/${continueWatching.subject.id}?video=${continueWatching.progress.last_video_id}`
                    )
                  }
                >
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                  <div className="relative">
                    <p className="text-sm text-white/70 font-medium mb-1">
                      {continueWatching.subject.title}
                    </p>
                    <h3 className="text-xl lg:text-2xl font-bold mb-2">
                      {continueWatching.progress.last_video_title || 'Resume your course'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-white/80 mb-6">
                      <span>
                        {continueWatching.progress.completed_videos}/
                        {continueWatching.progress.total_videos} videos completed
                      </span>
                      <span>{continueWatching.progress.percent_complete}% done</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-6">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${continueWatching.progress.percent_complete}%` }}
                      />
                    </div>

                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-white/90 transition-colors">
                      <HiPlayCircle className="w-5 h-5" />
                      Resume
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* My Courses — In Progress */}
            {inProgress.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                  <HiBookOpen className="w-5 h-5 text-primary-500" />
                  In Progress ({inProgress.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inProgress.map((enrollment) => (
                    <CourseProgressCard
                      key={enrollment.id}
                      enrollment={enrollment}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Courses */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2 mb-4">
                  <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                  Completed ({completed.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completed.map((enrollment) => (
                    <CourseProgressCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      isCompleted
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Browse more */}
            <div className="text-center pt-4">
              <Link
                href="/subjects"
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Browse more courses →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function CourseProgressCard({ enrollment, isCompleted }) {
  const { subject, progress } = enrollment;

  return (
    <Link href={`/subjects/${subject.id}`}>
      <div className="bg-white dark:bg-surface-800/50 rounded-xl border border-surface-200 dark:border-surface-700/50 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 group">
        <h3 className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
          {subject.title}
        </h3>
        <p className="text-xs text-surface-500 mt-1">
          {progress.completed_videos}/{progress.total_videos} videos
        </p>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-surface-400">
              {isCompleted ? '✅ Completed' : 'Progress'}
            </span>
            <span
              className={`font-semibold ${
                isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-primary-600 dark:text-primary-400'
              }`}
            >
              {progress.percent_complete}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
              }`}
              style={{ width: `${progress.percent_complete}%` }}
            />
          </div>
        </div>

        {/* Last watched */}
        {!isCompleted && progress.last_video_title && (
          <p className="text-xs text-surface-400 mt-2.5 truncate">
            Last: {progress.last_video_title}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
