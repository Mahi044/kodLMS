'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import ProtectedRoute from '../../../components/ProtectedRoute';
import useAuthStore from '../../../store/authStore';
import useVideoStore from '../../../store/videoStore';
import useSidebarStore from '../../../store/sidebarStore';
import Navbar from '../../../components/Navbar';
import Sidebar from '../../../components/Sidebar';
import VideoPlayer from '../../../components/VideoPlayer';
import VideoNavigation from '../../../components/VideoNavigation';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi2';
import Link from 'next/link';

function SubjectLearningContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const deepLinkVideoId = searchParams.get('video');
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setVideo, videoData } = useVideoStore();
  const { setTree, tree } = useSidebarStore();
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch course tree on mount
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchTree();
    }
  }, [isAuthenticated, id]);

  const fetchTree = async () => {
    try {
      const { data } = await api.get(`/subjects/${id}/tree`);
      setTree(data.sections, data.subject);

      const allVideos = data.sections.flatMap((s) => s.videos);

      // Priority: deep-link video > first unlocked incomplete > first video
      let targetVideoId = null;

      if (deepLinkVideoId) {
        // "Continue Learning" deep-link — use the specified video if unlocked
        const target = allVideos.find((v) => v.id === parseInt(deepLinkVideoId));
        if (target && !target.locked) {
          targetVideoId = target.id;
        }
      }

      if (!targetVideoId) {
        // Fallback: first uncompleted unlocked video
        const resumeVideo = allVideos.find((v) => !v.is_completed && !v.locked);
        targetVideoId = resumeVideo?.id || allVideos[0]?.id;
      }

      if (targetVideoId) {
        await loadVideo(targetVideoId);
      }
    } catch (err) {
      toast.error('Failed to load course');
      console.error(err);
    } finally {
      setPageLoading(false);
    }
  };

  // Load individual video details
  const loadVideo = useCallback(
    async (videoId) => {
      try {
        const { data } = await api.get(`/videos/${videoId}`);
        setVideo(data.video);
      } catch (err) {
        const status = err.response?.status;
        const message = err.response?.data?.error;

        if (status === 403) {
          // Locked video — show friendly message
          toast.error(message || 'This video is locked. Complete the previous video first.');
        } else if (status === 401) {
          toast.error('Session expired. Please log in again.');
          router.push('/login');
        } else {
          toast.error(message || 'Failed to load video');
        }
      }
    },
    [setVideo, router]
  );

  // Handle video selection from sidebar
  const handleVideoSelect = useCallback(
    (videoId) => {
      loadVideo(videoId);
    },
    [loadVideo]
  );

  // Handle navigation (prev/next)
  const handleNavigate = useCallback(
    (videoId) => {
      if (videoId) {
        loadVideo(videoId);
      }
    },
    [loadVideo]
  );

  // Handle video completion — auto-advance to next
  const handleVideoComplete = useCallback(
    async (nextVideoId) => {
      // Refresh the tree to get updated lock statuses
      try {
        const { data } = await api.get(`/subjects/${id}/tree`);
        setTree(data.sections, data.subject);
      } catch {
        // Ignore tree refresh errors
      }

      if (nextVideoId) {
        // Small delay before auto-advancing
        setTimeout(() => {
          loadVideo(nextVideoId);
          toast.success('Moving to next video!');
        }, 1000);
      } else {
        toast.success('🎉 You completed the course!');
      }
    },
    [id, setTree, loadVideo]
  );

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-surface-500 font-medium">Loading course...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar onVideoSelect={handleVideoSelect} currentVideoId={videoData?.id} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Back link */}
            <Link
              href="/subjects"
              className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
            >
              <HiArrowLeft className="w-4 h-4" />
              Back to Courses
            </Link>

            {/* Video Player */}
            <VideoPlayer onVideoComplete={handleVideoComplete} />

            {/* Navigation */}
            <VideoNavigation onNavigate={handleNavigate} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SubjectLearningPage() {
  return (
    <ProtectedRoute>
      <SubjectLearningContent />
    </ProtectedRoute>
  );
}
