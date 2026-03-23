import { create } from 'zustand';

/**
 * Video store — tracks current video state and playback.
 */
const useVideoStore = create((set) => ({
  currentVideoId: null,
  currentTime: 0,
  isCompleted: false,
  videoData: null,

  setVideo: (videoData) =>
    set({
      currentVideoId: videoData?.id || null,
      videoData,
      currentTime: videoData?.last_position_seconds || 0,
      isCompleted: videoData?.is_completed || false,
    }),

  updateTime: (time) => set({ currentTime: time }),

  markCompleted: () => set({ isCompleted: true }),

  reset: () =>
    set({
      currentVideoId: null,
      currentTime: 0,
      isCompleted: false,
      videoData: null,
    }),
}));

export default useVideoStore;
