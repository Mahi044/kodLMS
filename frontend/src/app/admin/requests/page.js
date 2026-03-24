'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { HiCheck, HiXMark, HiUserCircle, HiClock, HiSparkles } from 'react-icons/hi2';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successUser, setSuccessUser] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/admin/users/requests');
      setRequests(data.users || []);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error(`Failed to load requests: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      await api.post(`/admin/users/${id}/approve`);
      
      // Trigger Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#f59e0b']
      });

      setSuccessUser(name);
      setRequests(requests.filter(r => r.id !== id));
      
      setTimeout(() => setSuccessUser(null), 5000);
    } catch (err) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      await api.post(`/admin/users/${id}/reject`);
      toast.success('Request removed');
      setRequests(requests.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Success Celebration Overlay */}
      <AnimatePresence>
        {successUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white dark:bg-surface-800 p-8 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/30 text-center max-w-sm mx-4 pointer-events-auto">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiSparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 dark:white mb-2">Excellent!</h2>
              <p className="text-surface-600 dark:text-surface-400">
                <span className="font-bold text-primary-600 dark:text-primary-400">{successUser}</span> is now officially an Admin. 
                They can now manage courses and content!
              </p>
              <button 
                onClick={() => setSuccessUser(null)}
                className="mt-6 w-full py-3 bg-surface-900 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Awesome
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Admin Access Requests</h1>
          <p className="text-surface-500 text-sm mt-1">Review and approve accounts requesting instructor privileges</p>
        </div>
        <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl border border-primary-100 dark:border-primary-800">
          <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
            {requests.length} Pending
          </span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-surface-50 dark:bg-surface-800/50 rounded-2xl border border-dashed border-surface-300 dark:border-surface-700 p-12 text-center">
          <div className="w-16 h-16 bg-white dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <HiCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">All caught up!</h3>
          <p className="text-surface-500 mt-1">There are no pending admin requests at the moment.</p>
        </div>
      ) : (
        <div className="overflow-hidden bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-800">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-center">Requested At</th>
                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <HiUserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-surface-900 dark:text-white">{request.name}</div>
                        <div className="text-sm text-surface-500">{request.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-400">
                      <HiClock className="w-3.5 h-3.5" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReject(request.id)}
                        className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Reject Request"
                      >
                        <HiXMark className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(request.id, request.name)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        <HiCheck className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
