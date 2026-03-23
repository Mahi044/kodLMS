'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { HiAcademicCap, HiEnvelope, HiLockClosed, HiUser } from 'react-icons/hi2';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome aboard!');
      router.push('/subjects');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-indigo-50 dark:from-surface-950 dark:via-surface-900 dark:to-primary-950/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/25">
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mt-4">
            Create your account
          </h1>
          <p className="text-surface-500 text-sm mt-1">Start your learning journey</p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/5 border border-surface-200 dark:border-surface-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
