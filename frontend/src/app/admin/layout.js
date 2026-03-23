'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { HiBookOpen, HiVideoCamera, HiChartBar } from 'react-icons/hi2';

export default function AdminLayout({ children }) {
  const { isAuthenticated, isLoading, user, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Admin Sidebar */}
        <aside className="w-64 flex-shrink-0 flex flex-col gap-2">
          <div className="mb-6 px-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent">
              Admin Portal
            </h2>
            <p className="text-sm text-surface-500">Manage courses and content</p>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors font-medium"
          >
            <HiChartBar className="w-5 h-5" />
            Overview
          </Link>
          <Link
            href="/admin/subjects"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors font-medium"
          >
            <HiBookOpen className="w-5 h-5" />
            Manage Subjects
          </Link>
          <Link
            href="/admin/videos"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors font-medium"
          >
            <HiVideoCamera className="w-5 h-5" />
            Manage Content
          </Link>
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 min-w-0 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
