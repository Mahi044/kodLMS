'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/authStore';

/**
 * Wraps a page component to redirect unauthenticated users to /login.
 * Usage: <ProtectedRoute><YourPage /></ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex items-center gap-3">
          <svg className="animate-spin w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-surface-500 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}
