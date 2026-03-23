'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import { HiAcademicCap, HiPlayCircle, HiChartBarSquare, HiLockClosed } from 'react-icons/hi2';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const features = [
    {
      icon: <HiPlayCircle className="w-6 h-6" />,
      title: 'YouTube-Powered Videos',
      desc: 'Learn from curated YouTube video content in a structured environment.',
    },
    {
      icon: <HiChartBarSquare className="w-6 h-6" />,
      title: 'Progress Tracking',
      desc: 'Your progress is saved automatically. Resume right where you left off.',
    },
    {
      icon: <HiLockClosed className="w-6 h-6" />,
      title: 'Sequential Learning',
      desc: 'Master each topic before moving on with our structured learning flow.',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-surface-950 dark:via-surface-900 dark:to-primary-950/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjNjM2NmYxIiBvcGFjaXR5PSIwLjA3Ii8+PC9zdmc+')] dark:opacity-20" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 lg:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <HiAcademicCap className="w-4 h-4" />
            Learning Made Simple
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-surface-900 via-surface-700 to-surface-900 dark:from-white dark:via-surface-200 dark:to-white bg-clip-text text-transparent">
              Master Skills with{' '}
            </span>
            <span className="bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              Structured Learning
            </span>
          </h1>

          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mt-6">
            Follow a guided learning path with curated video courses. Track your progress,
            resume where you left off, and master topics step by step.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl font-semibold border border-surface-200 dark:border-surface-700 hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-surface-800/50 rounded-2xl p-8 border border-surface-200 dark:border-surface-700/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-700/50 py-8 text-center text-sm text-surface-400">
        © 2026 LearnFlow. Built for continuous learning.
      </footer>
    </div>
  );
}
