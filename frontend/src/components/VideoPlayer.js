'use client';

import { useRef, useCallback, useEffect } from 'react';
import YouTube from 'react-youtube';
import useVideoStore from '../store/videoStore';
import useSidebarStore from '../store/sidebarStore';
import api from '../lib/api';

/**
 * YouTube video player that:
 * - Resumes from last saved position
 * - Tracks progress every 5 seconds (debounced)
 * - Marks video complete on end
 * - Auto-advances to next video on completion
 */
export default function VideoPlayer({ onVideoComplete }) {
  const { videoData, currentTime, updateTime, markCompleted } = useVideoStore();
  const { markVideoCompleted } = useSidebarStore();
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : url; // fallback: treat as raw ID
  };

  const youtubeId = getYouTubeId(videoData?.youtube_url);

  // Save progress to backend
  const saveProgress = useCallback(
    async (position, completed = false) => {
      if (!videoData?.id) return;
      try {
        await api.post(`/progress/videos/${videoData.id}`, {
          last_position_seconds: Math.floor(position),
          is_completed: completed,
        });
      } catch (err) {
        // Silently fail on progress save errors (e.g. locked video)
        console.warn('Progress save failed:', err?.response?.data?.error || err.message);
      }
    },
    [videoData?.id]
  );

  // Start tracking progress every 5 seconds while playing
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        updateTime(time);
        saveProgress(time);
      }
    }, 5000);
  }, [saveProgress, updateTime]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Save progress on tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerRef.current && videoData?.id) {
        const time = playerRef.current.getCurrentTime();
        // Use sendBeacon for reliable save on unload
        const payload = JSON.stringify({
          last_position_seconds: Math.floor(time),
          is_completed: false,
        });
        navigator.sendBeacon(
          `/api/progress/videos/${videoData.id}`,
          new Blob([payload], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [videoData?.id]);

  const onReady = (event) => {
    playerRef.current = event.target;
    // Resume from last position minus 5 seconds for context (clamped to >= 0)
    const savedPos = videoData?.last_position_seconds || 0;
    const resumePos = Math.max(0, savedPos - 5);
    if (resumePos > 0) {
      event.target.seekTo(resumePos, true);
    }
  };

  const onStateChange = (event) => {
    const state = event.data;
    // YouTube states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering
    if (state === 1) {
      startProgressTracking();
    } else if (state === 2) {
      stopProgressTracking();
      // Save progress on pause
      if (playerRef.current) {
        saveProgress(playerRef.current.getCurrentTime());
      }
    }
  };

  const onEnd = async () => {
    stopProgressTracking();

    // Mark as completed
    markCompleted();
    markVideoCompleted(videoData.id);
    await saveProgress(videoData.duration_seconds || playerRef.current?.getDuration(), true);

    // Trigger auto-advance
    if (onVideoComplete) {
      onVideoComplete(videoData.next_video_id);
    }
  };

  if (!youtubeId) {
    return (
      <div className="aspect-video bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center">
        <p className="text-surface-400">Select a video to start learning</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
        <YouTube
          videoId={youtubeId}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              modestbranding: 1,
              rel: 0,
            },
          }}
          onReady={onReady}
          onStateChange={onStateChange}
          onEnd={onEnd}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>

      {/* Video title below player */}
      <div className="mt-4">
        <h1 className="text-xl lg:text-2xl font-bold text-surface-900 dark:text-white">
          {videoData?.title}
        </h1>
        {videoData?.description && (
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
            {videoData.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
          <span>{videoData?.section_title}</span>
          <span>•</span>
          <span>{videoData?.subject_title}</span>
        </div>
      </div>
    </div>
  );
}
