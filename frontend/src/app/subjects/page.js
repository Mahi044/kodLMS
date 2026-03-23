'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import SubjectCard from '../../components/SubjectCard';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiMagnifyingGlass, HiAcademicCap } from 'react-icons/hi2';

function SubjectsContent() {
  const [subjects, setSubjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    fetchSubjects('');
  }, []);

  // Debounced backend search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSubjects(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchSubjects = async (query) => {
    try {
      setLoading(true);
      const params = query ? `?q=${encodeURIComponent(query)}` : '';
      const { data } = await api.get(`/subjects${params}`);
      setSubjects(data.subjects);

      // Fetch progress for each subject
      const progMap = {};
      await Promise.all(
        data.subjects.map(async (s) => {
          try {
            const { data: progData } = await api.get(`/progress/subjects/${s.id}`);
            progMap[s.id] = progData.progress;
          } catch {
            progMap[s.id] = null;
          }
        })
      );
      setProgressMap(progMap);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      toast.error('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh progress after enrollment
  const handleEnrolled = async (subjectId) => {
    try {
      const { data: progData } = await api.get(`/progress/subjects/${subjectId}`);
      setProgressMap((prev) => ({ ...prev, [subjectId]: progData.progress }));
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Courses</h1>
            <p className="text-surface-500 text-sm mt-1">
              Choose a course to begin your learning journey
            </p>
          </div>

          {/* Search — debounced, hits backend */}
          <div className="relative w-full sm:w-72">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
            />
          </div>
        </div>

        {/* Subject grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden"
              >
                <div className="h-2 bg-surface-200 dark:bg-surface-700 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-200 dark:bg-surface-700 animate-pulse" />
                  <div className="h-5 w-3/4 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-surface-100 dark:bg-surface-700/50 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-surface-100 dark:bg-surface-700/50 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-surface-100 dark:bg-surface-700/50 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : subjects.length === 0 && !search ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
              <HiAcademicCap className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-surface-700 dark:text-surface-300">
              No courses available yet
            </h2>
            <p className="text-surface-400 text-sm mt-2">
              Courses will appear here once they are published.
            </p>
          </div>
        ) : subjects.length === 0 && search ? (
          <div className="text-center py-20">
            <HiMagnifyingGlass className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-400 text-lg">No courses match &quot;{search}&quot;</p>
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject, i) => (
              <div
                key={subject.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <SubjectCard
                  subject={subject}
                  progress={progressMap[subject.id]}
                  onEnrolled={handleEnrolled}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SubjectsPage() {
  return (
    <ProtectedRoute>
      <SubjectsContent />
    </ProtectedRoute>
  );
}
