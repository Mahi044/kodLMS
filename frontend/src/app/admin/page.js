'use client';

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">
        Admin Overview
      </h1>
      <p className="text-surface-600 dark:text-surface-400">
        Welcome to the admin portal. Use the sidebar to manage subjects, sections, and videos, or to view basic site statistics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800/50">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">Quick Actions</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <a href="/admin/subjects" className="text-primary-600 dark:text-primary-400 hover:underline">
                Create a new Course →
              </a>
            </li>
            <li>
              <a href="/admin/videos" className="text-primary-600 dark:text-primary-400 hover:underline">
                Add Videos to a Course →
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
