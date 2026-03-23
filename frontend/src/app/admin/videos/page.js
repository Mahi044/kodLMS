'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function AdminVideosPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [sectionForm, setSectionForm] = useState({ title: '', order_index: '' });
  const [videoForm, setVideoForm] = useState({ section_id: '', title: '', description: '', youtube_url: '', order_index: '', duration_seconds: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) fetchTree(selectedSubject);
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.subjects);
      if (data.subjects.length > 0) setSelectedSubject(data.subjects[0].id);
      setLoading(false);
    } catch {
      toast.error('Failed to load subjects');
    }
  };

  const fetchTree = async (subjectId) => {
    try {
      // Since admin is enrolled automatically if it hits /tree, this is fine
      const { data } = await api.get(`/subjects/${subjectId}/tree`);
      setTree(data.sections || []);
    } catch {
      toast.error('Failed to load course structure');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return toast.error('Select a course first');
    setSubmitting(true);
    try {
      await api.post('/admin/sections', { ...sectionForm, subject_id: selectedSubject, order_index: parseInt(sectionForm.order_index) });
      toast.success('Section created!');
      setSectionForm({ title: '', order_index: '' });
      fetchTree(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create section');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVideo = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/videos', {
        ...videoForm,
        section_id: parseInt(videoForm.section_id),
        order_index: parseInt(videoForm.order_index),
        duration_seconds: parseInt(videoForm.duration_seconds) || 0,
      });
      toast.success('Video added successfully!');
      setVideoForm({ ...videoForm, title: '', description: '', youtube_url: '', order_index: '', duration_seconds: '' });
      fetchTree(selectedSubject);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add video');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/admin/videos/${id}`);
      toast.success('Video deleted');
      fetchTree(selectedSubject);
    } catch {
      toast.error('Failed to delete video');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Manage Content</h1>

      {loading ? (
        <div className="animate-pulse h-10 w-64 bg-surface-200 rounded-lg" />
      ) : (
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Select Course to Manage:</label>
          <select
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(parseInt(e.target.value))}
            className="w-full max-w-md px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500"
          >
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.title}</option>
            ))}
          </select>
        </div>
      )}

      {selectedSubject && !loading && (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Col: Course Structure Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Course Structure</h2>
            {tree.length === 0 ? (
              <p className="text-surface-500 text-sm">No sections yet. Create one.</p>
            ) : (
              tree.map(section => (
                <div key={section.id} className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
                  <div className="bg-surface-50 dark:bg-surface-800/80 px-4 py-3 border-b border-surface-200 dark:border-surface-700 font-semibold flex justify-between">
                    <span>{section.order_index}. {section.title}</span>
                    <span className="text-xs text-surface-500 font-normal">ID: {section.id}</span>
                  </div>
                  <div className="divide-y divide-surface-100 dark:divide-surface-800">
                    {section.videos.map(vid => (
                      <div key={vid.id} className="px-4 py-3 flex items-center justify-between hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{vid.order_index}. {vid.title}</p>
                          <p className="text-xs text-surface-400 mt-0.5 max-w-[200px] truncate">{vid.youtube_url}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    {section.videos.length === 0 && (
                      <p className="text-xs text-surface-400 px-4 py-3">No videos in this section.</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Col: Forms */}
          <div className="space-y-8">
            {/* Create Section Form */}
            <div className="p-6 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 rounded-2xl">
              <h3 className="font-bold mb-4">Create Section</h3>
              <form onSubmit={handleCreateSection} className="space-y-3">
                <input
                  type="text" required placeholder="Section Title"
                  value={sectionForm.title} onChange={e => setSectionForm({...sectionForm, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <input
                  type="number" required placeholder="Order Index (e.g. 1)"
                  value={sectionForm.order_index} onChange={e => setSectionForm({...sectionForm, order_index: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button type="submit" disabled={submitting} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50 transition-colors">
                  Add Section
                </button>
              </form>
            </div>

            {/* Create Video Form */}
            <div className="p-6 border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 rounded-2xl">
              <h3 className="font-bold mb-4">Add Video</h3>
              <form onSubmit={handleCreateVideo} className="space-y-3">
                <select
                  required
                  value={videoForm.section_id}
                  onChange={e => setVideoForm({...videoForm, section_id: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="" disabled>Select Section...</option>
                  {tree.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.title}</option>
                  ))}
                </select>
                <input
                  type="text" required placeholder="Video Title"
                  value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 text-sm"
                />
                <input
                  type="url" required placeholder="YouTube URL"
                  value={videoForm.youtube_url} onChange={e => setVideoForm({...videoForm, youtube_url: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 text-sm"
                />
                <input
                  type="number" required placeholder="Duration in seconds (e.g. 360)"
                  value={videoForm.duration_seconds} onChange={e => setVideoForm({...videoForm, duration_seconds: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 text-sm"
                />
                <input
                  type="number" required placeholder="Order Index (e.g. 1)"
                  value={videoForm.order_index} onChange={e => setVideoForm({...videoForm, order_index: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-900 text-sm"
                />
                <button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm disabled:opacity-50 transition-colors">
                  Add Video
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
