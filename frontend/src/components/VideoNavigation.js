'use client';

import useVideoStore from '../store/videoStore';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

export default function VideoNavigation({ onNavigate }) {
  const { videoData } = useVideoStore();

  if (!videoData) return null;

  const hasPrev = videoData.previous_video_id !== null;
  const hasNext = videoData.next_video_id !== null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-200 dark:border-surface-700/50">
      <button
        onClick={() => hasPrev && onNavigate(videoData.previous_video_id)}
        disabled={!hasPrev}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
          ${hasPrev
            ? 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
            : 'opacity-40 cursor-not-allowed bg-surface-50 dark:bg-surface-800/50 text-surface-400'
          }`}
      >
        <HiChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <button
        onClick={() => hasNext && onNavigate(videoData.next_video_id)}
        disabled={!hasNext}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
          ${hasNext
            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-500/25'
            : 'opacity-40 cursor-not-allowed bg-surface-50 dark:bg-surface-800/50 text-surface-400'
          }`}
      >
        Next
        <HiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
