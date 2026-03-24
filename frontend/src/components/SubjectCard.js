'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiBookOpen, HiAcademicCap, HiPlayCircle, HiCheckCircle } from 'react-icons/hi2';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function SubjectCard({ subject, progress, onEnrolled }) {
  const router = useRouter();
  const sectionCount = subject._count?.sections || 0;
  const isEnrolled = progress !== null && progress !== undefined;
  const progressPct = progress?.percent_complete || progress?.progress_percentage || 0;
  const completedVideos = progress?.completed_videos || 0;
  const totalVideos = progress?.total_videos || 0;
  const lastVideoId = progress?.last_video_id;
  const isCompleted = progressPct === 100;
  const [enrolling, setEnrolling] = useState(false);

  // Enroll handler
  const handleEnroll = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${subject.id}`);
      toast.success(`Enrolled in ${subject.title}!`);
      if (onEnrolled) onEnrolled(subject.id);
      router.push(`/subjects/${subject.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  // Continue Learning handler
  const handleContinue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const targetUrl = lastVideoId 
      ? `/subjects/${subject.id}?video=${lastVideoId}`
      : `/subjects/${subject.id}`;
    router.push(targetUrl);
  };

  return (
    <Link href={`/subjects/${subject.id}`} className="h-full block">
      <div className="group relative bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        {/* Thumbnail Image */}
        <div className="relative w-full h-48 bg-surface-100 dark:bg-surface-900 overflow-hidden">
          <img 
            src={subject.thumbnail_url || `https://picsum.photos/seed/${subject.slug}/600/300`} 
            alt={subject.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Status Badge Overlaid on Image */}
          <div className="absolute top-4 left-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md shadow-lg ${
                isCompleted
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-primary-500/90 text-white'
              }`}
            >
              {isCompleted ? (
                <HiCheckCircle className="w-6 h-6" />
              ) : (
                <HiAcademicCap className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>

        {/* Gradient top bar (now moved below image or removed. Let's keep it as an accent strip below the image) */}
        <div
          className={`h-1 w-full ${
            isCompleted
              ? 'bg-gradient-to-r from-emerald-500 to-green-400'
              : 'bg-gradient-to-r from-primary-500 to-indigo-400'
          }`}
        />

        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mt-1">
            {subject.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 line-clamp-2">
            {subject.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-4 text-xs text-surface-400">
            <span className="flex items-center gap-1">
              <HiBookOpen className="w-4 h-4" />
              {sectionCount} sections
            </span>
            {isEnrolled && totalVideos > 0 && (
              <span>
                {completedVideos}/{totalVideos} videos
              </span>
            )}
          </div>

          {/* Progress bar — only for enrolled users */}
          {isEnrolled && totalVideos > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-surface-500">
                  {isCompleted ? '✅ Completed!' : 'Progress'}
                </span>
                <span
                  className={`font-semibold ${
                    isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-primary-600 dark:text-primary-400'
                  }`}
                >
                  {progressPct}%
                </span>
              </div>
              <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isCompleted
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                      : 'bg-gradient-to-r from-primary-500 to-primary-400'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          {isEnrolled && progressPct > 0 ? (
            <button
              onClick={handleContinue}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl text-sm font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
            >
              <HiPlayCircle className="w-5 h-5" />
              Continue Learning
            </button>
          ) : !isEnrolled ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
