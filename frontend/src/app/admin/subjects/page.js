'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', is_published: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/subjects');
      setSubjects(data.subjects);
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);
    setFormData({
      title: sub.title,
      description: sub.description || '',
      is_published: sub.is_published !== false,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', is_published: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/subjects/${editingId}`, formData);
        toast.success('Course updated gracefully!');
      } else {
        await api.post('/admin/subjects', formData);
        toast.success('Course created successfully!');
      }
      handleCancel();
      // Fast refresh is tricky because /api/subjects only gives published. We will reload page or just fetch.
      window.location.reload(); 
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Manage Courses</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-6 h-fit">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Course' : 'Create New Course'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500 min-h-[100px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_pub"
                checked={formData.is_published}
                onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-surface-300 focus:ring-primary-500"
              />
              <label htmlFor="is_pub" className="text-sm font-medium">Publish Immediately</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Course'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 text-surface-900 dark:text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-surface-100 dark:bg-surface-800 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-4 border border-surface-200 dark:border-surface-700 rounded-xl hover:shadow-sm">
                  <div>
                    <h3 className="font-bold text-surface-900 dark:text-white">{sub.title}</h3>
                    <p className="text-sm text-surface-500">{sub._count?.sections || 0} sections</p>
                  </div>
                  <button
                    onClick={() => handleEdit(sub)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:hover:text-primary-400"
                  >
                    Edit
                  </button>
                </div>
              ))}
              {subjects.length === 0 && (
                <p className="text-surface-500 text-center py-8">No published courses found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
