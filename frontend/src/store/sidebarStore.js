import { create } from 'zustand';

/**
 * Sidebar store — manages the course tree view (sections + videos).
 */
const useSidebarStore = create((set, get) => ({
  tree: [],
  subjectInfo: null,

  setTree: (sections, subject) =>
    set({ tree: sections, subjectInfo: subject }),

  /**
   * Mark a video as completed within the tree and unlock the next video.
   */
  markVideoCompleted: (videoId) =>
    set((state) => {
      // Deep clone the tree
      const newTree = JSON.parse(JSON.stringify(state.tree));

      // Flatten to find video order
      const allVideos = [];
      for (const section of newTree) {
        for (const video of section.videos) {
          allVideos.push(video);
        }
      }

      // Mark the target video as completed
      const targetIndex = allVideos.findIndex((v) => v.id === videoId);
      if (targetIndex !== -1) {
        allVideos[targetIndex].is_completed = true;

        // Unlock the next video (if exists)
        if (targetIndex + 1 < allVideos.length) {
          allVideos[targetIndex + 1].locked = false;
          allVideos[targetIndex + 1].unlock_reason = null;
        }
      }

      return { tree: newTree };
    }),

  reset: () => set({ tree: [], subjectInfo: null }),
}));

export default useSidebarStore;
