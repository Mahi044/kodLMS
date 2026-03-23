'use client';

import { HiLockClosed, HiCheckCircle, HiPlayCircle } from 'react-icons/hi2';
import useSidebarStore from '../store/sidebarStore';

export default function Sidebar({ onVideoSelect, currentVideoId }) {
  const { tree, subjectInfo } = useSidebarStore();

  // Count stats
  const allVideos = tree.flatMap((s) => s.videos);
  const completedCount = allVideos.filter((v) => v.is_completed).length;
  const totalCount = allVideos.length;

  return (
    <aside className="w-80 lg:w-96 h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700/50 overflow-y-auto flex-shrink-0">
      {/* Subject title + progress overview */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-700/50">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white truncate">
          {subjectInfo?.title || 'Course'}
        </h2>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-xs text-surface-500">
            {completedCount}/{totalCount} completed
          </p>
          {totalCount > 0 && (
            <div className="flex-1 h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  completedCount === totalCount
                    ? 'bg-emerald-500'
                    : 'bg-primary-500'
                }`}
                style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sections & Videos */}
      <div className="pb-4">
        {tree.map((section, sIdx) => {
          const sectionCompleted = section.videos.every((v) => v.is_completed);
          return (
            <div key={section.id} className="mt-2">
              {/* Section header */}
              <div className="px-4 py-3 flex items-center gap-2">
                {sectionCompleted && (
                  <HiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                    Section {sIdx + 1}
                  </p>
                  <p className={`text-sm font-medium mt-0.5 truncate ${
                    sectionCompleted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-surface-700 dark:text-surface-300'
                  }`}>
                    {section.title}
                  </p>
                </div>
              </div>

              {/* Video list */}
              <div className="space-y-0.5">
                {section.videos.map((video) => {
                  const isActive = video.id === currentVideoId;
                  const isLocked = video.locked;
                  const isCompleted = video.is_completed;

                  return (
                    <button
                      key={video.id}
                      onClick={() => !isLocked && onVideoSelect(video.id)}
                      disabled={isLocked}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group
                        ${isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 border-l-3 border-primary-500'
                          : isLocked
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer'
                        }`}
                      title={isLocked ? video.unlock_reason : video.title}
                    >
                      {/* Status icon */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <HiCheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : isLocked ? (
                          <HiLockClosed className="w-5 h-5 text-surface-400" />
                        ) : (
                          <HiPlayCircle
                            className={`w-5 h-5 ${
                              isActive
                                ? 'text-primary-500'
                                : 'text-surface-400 group-hover:text-primary-400'
                            }`}
                          />
                        )}
                      </div>

                      {/* Video info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm truncate ${
                            isActive
                              ? 'font-semibold text-primary-700 dark:text-primary-300'
                              : isCompleted
                                ? 'font-medium text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-300 dark:decoration-emerald-600'
                                : 'font-medium text-surface-700 dark:text-surface-300'
                          }`}
                        >
                          {video.title}
                        </p>
                        <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1.5">
                          {formatDuration(video.duration_seconds)}
                          {isCompleted && (
                            <span className="text-emerald-500 font-medium">✓ Done</span>
                          )}
                          {isLocked && (
                            <span className="text-surface-400">🔒 Locked</span>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function formatDuration(seconds) {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
