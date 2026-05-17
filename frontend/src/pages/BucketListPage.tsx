import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  Target,
  Trash2,
  Edit,
  X,
  Star,
  Trophy,
  Sparkles,
  MapPin,
  Utensils,
  Mountain,
  Book,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useTheme } from '../contexts/ThemeContext';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface BucketListItem {
  id: number;
  title: string;
  description: string;
  category: string;
  category_display: string;
  added_by: string;
  added_by_display: string;
  status: string;
  status_display: string;
  priority: number;
  priority_display: string;
  completed_at: string | null;
  completed_by: string | null;
  completion_notes: string;
  image: string | null;
  target_date: string | null;
  created_at: string;
}

interface BucketListStats {
  total: number;
  completed: number;
  pending: number;
  planned: number;
  by_category: Record<string, number>;
  completion_rate: number;
}

interface Category {
  value: string;
  label: string;
  icon: React.ElementType;
  color: string;
  darkColor: string;
}

const categories: Category[] = [
  { value: 'travel', label: '✈️ Travel', icon: MapPin, color: 'from-blue-400 to-cyan-400', darkColor: 'from-blue-600 to-cyan-600' },
  { value: 'date', label: '💕 Date Ideas', icon: Heart, color: 'from-pink-400 to-rose-400', darkColor: 'from-pink-600 to-rose-600' },
  { value: 'adventure', label: '🏔️ Adventure', icon: Mountain, color: 'from-green-400 to-emerald-400', darkColor: 'from-green-600 to-emerald-600' },
  { value: 'food', label: '🍽️ Food', icon: Utensils, color: 'from-orange-400 to-red-400', darkColor: 'from-orange-600 to-red-600' },
  { value: 'learning', label: '📚 Learn Together', icon: Book, color: 'from-purple-400 to-indigo-400', darkColor: 'from-purple-600 to-indigo-600' },
  { value: 'milestone', label: '🎯 Milestone', icon: Target, color: 'from-yellow-400 to-amber-400', darkColor: 'from-yellow-600 to-amber-600' },
  { value: 'other', label: '✨ Other', icon: Sparkles, color: 'from-gray-400 to-gray-500', darkColor: 'from-gray-600 to-gray-700' },
];

const BucketListPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<BucketListItem | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'travel',
    priority: 2,
    target_date: '',
  });

  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery<BucketListItem[]>({
    queryKey: ['bucketlist'],
    queryFn: async () => {
      const response = await api.get('/bucketlist/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const { data: stats } = useQuery<BucketListStats>({
    queryKey: ['bucketlistStats'],
    queryFn: async () => {
      const response = await api.get('/bucketlist/stats/');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/bucketlist/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });
      toast.success('Added to bucket list! 🌟');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create bucket list error:', error);
      toast.error(error?.response?.data?.target_date?.[0] || 'Failed to add dream.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/bucketlist/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });
      toast.success('Item updated! ✏️');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Update bucket list error:', error);
      toast.error(error?.response?.data?.target_date?.[0] || 'Failed to update dream.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bucketlist/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });
      toast.success('Item removed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete dream.');
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.post(`/bucketlist/${id}/complete/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });

      toast.success(data.message);
      setSelectedItem(null);
      setCompletionNotes('');
    },
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'travel',
      priority: 2,
      target_date: '',
    });
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
    };

    if (formData.target_date.trim()) {
      payload.target_date = formData.target_date;
    }

    return payload;
  };

  const handleEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      target_date: item.target_date || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: BucketListItem) => {
    setDeleteTarget({ id: item.id, name: item.title });
  };

  const filteredItems = items?.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    return true;
  });

  const pendingItems = filteredItems?.filter((i) => i.status === 'pending') || [];
  const plannedItems = filteredItems?.filter((i) => i.status === 'planned') || [];
  const completedItems = filteredItems?.filter((i) => i.status === 'completed') || [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Romantic Background */}
      <RomanticBackground />

      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center transition-colors mb-4 group ${
              theme === 'dark' ? 'text-purple-200 hover:text-pink-400' : 'text-gray-600 hover:text-rose-500'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif mb-2">
                <span className={theme === 'dark' ? 'text-purple-100' : 'text-gradient-love'}>
                  Our Bucket List
                </span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block ml-3"
                >
                  🌟
                </motion.span>
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>
                Dreams we'll achieve together, one by one
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn-romantic flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Dream
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          >
            <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border border-purple-800/50'
                : 'bg-white/40 border border-white/30'
            }`}>
              <Target className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-rose-500'}`} />
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>{stats.total}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>Total Dreams</p>
            </div>
            <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border border-purple-800/50'
                : 'bg-white/40 border border-white/30'
            }`}>
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>{stats.completed}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>Achieved</p>
            </div>
            <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border border-purple-800/50'
                : 'bg-white/40 border border-white/30'
            }`}>
              <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>{stats.pending + stats.planned}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>In Progress</p>
            </div>
            <div className={`rounded-2xl p-5 text-center backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border border-purple-800/50'
                : 'bg-white/40 border border-white/30'
            }`}>
              <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>{stats.completion_rate}%</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>Completion</p>
            </div>
          </motion.div>
        )}

        {/* Progress Bar */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className={`rounded-2xl p-4 backdrop-blur-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border border-purple-800/50'
                : 'bg-white/40 border border-white/30'
            }`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}`}>Overall Progress</p>
              <div className={`h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-purple-800' : 'bg-gray-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completion_rate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-linear-to-r from-love-red to-romantic-red"
                />
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-500'}`}>
                {stats.completed} of {stats.total} dreams achieved ✨
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-6 flex-wrap"
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 backdrop-blur-sm border rounded-xl text-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border-purple-800/50 text-purple-200'
                : 'bg-white/40 border-white/30 text-gray-700'
            }`}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 backdrop-blur-sm border rounded-xl text-sm transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/30 border-purple-800/50 text-purple-200'
                : 'bg-white/40 border-white/30 text-gray-700'
            }`}
          >
            <option value="all">All Status</option>
            <option value="pending">⏳ Not Yet</option>
            <option value="planned">📅 Planned</option>
            <option value="completed">✅ Completed</option>
          </select>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse">
                <div className="h-24 bg-purple-200/30 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Bucket List Grid - Three Columns */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Column */}
            <div>
              <h3 className={`text-xl font-serif mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-purple-100' : 'text-gray-800'
              }`}>
                <Clock className="w-5 h-5 text-orange-500" />
                Not Yet
                <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-500'}`}>
                  ({pendingItems.length})
                </span>
              </h3>
              <div className="space-y-3">
                {pendingItems.map((item, index) => (
                  <BucketListCard
                    key={item.id}
                    item={item}
                    index={index}
                    theme={theme}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onComplete={(item) => setSelectedItem(item)}
                  />
                ))}
                {pendingItems.length === 0 && (
                  <p className={`text-center py-8 text-sm ${
                    theme === 'dark' ? 'text-purple-300' : 'text-gray-400'
                  }`}>
                    No pending dreams ✨
                  </p>
                )}
              </div>
            </div>

            {/* Planned Column */}
            <div>
              <h3 className={`text-xl font-serif mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-purple-100' : 'text-gray-800'
              }`}>
                <Calendar className="w-5 h-5 text-blue-500" />
                Planned
                <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-500'}`}>
                  ({plannedItems.length})
                </span>
              </h3>
              <div className="space-y-3">
                {plannedItems.map((item, index) => (
                  <BucketListCard
                    key={item.id}
                    item={item}
                    index={index}
                    theme={theme}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onComplete={(item) => setSelectedItem(item)}
                  />
                ))}
                {plannedItems.length === 0 && (
                  <p className={`text-center py-8 text-sm ${
                    theme === 'dark' ? 'text-purple-300' : 'text-gray-400'
                  }`}>
                    No planned dreams 📅
                  </p>
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <h3 className={`text-xl font-serif mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-purple-100' : 'text-gray-800'
              }`}>
                <Trophy className="w-5 h-5 text-yellow-500" />
                Achieved
                <span className={`text-sm ml-2 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-500'}`}>
                  ({completedItems.length})
                </span>
              </h3>
              <div className="space-y-3">
                {completedItems.map((item, index) => (
                  <BucketListCard
                    key={item.id}
                    item={item}
                    index={index}
                    theme={theme}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onComplete={(item) => setSelectedItem(item)}
                  />
                ))}
                {completedItems.length === 0 && (
                  <p className={`text-center py-8 text-sm ${
                    theme === 'dark' ? 'text-purple-300' : 'text-gray-400'
                  }`}>
                    No completed dreams yet 🌟
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Complete Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-3xl p-6 max-w-md w-full shadow-2xl ${
                theme === 'dark'
                  ? 'bg-purple-900/95 border border-purple-800/50'
                  : 'bg-white/95 border border-white/30'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎉</div>
                <h3 className={`text-2xl font-serif mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
                  Dream Achieved!
                </h3>
                <p className={theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}>
                  "{selectedItem.title}"
                </p>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
                }`}>
                  Who completed this?
                </label>
                <div className="flex gap-3">
                  {['me', 'shaira', 'both'].map((who) => (
                    <button
                      key={who}
                      onClick={() =>
                        completeMutation.mutate({
                          id: selectedItem.id,
                          data: { completed_by: who, notes: completionNotes },
                        })
                      }
                      className={`flex-1 py-2 px-4 rounded-xl transition-colors ${
                        theme === 'dark'
                          ? 'bg-purple-800 hover:bg-purple-700 text-purple-200'
                          : 'bg-pink-50 hover:bg-pink-100 text-gray-700'
                      }`}
                    >
                      {who === 'me' && '🙋 Me'}
                      {who === 'shaira' && '💕 Shaira'}
                      {who === 'both' && '👫 Both'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
                }`}>
                  Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 resize-none ${
                    theme === 'dark'
                      ? 'bg-purple-800 border-purple-700 text-purple-200 placeholder-purple-400'
                      : 'bg-white border-pink-200 text-gray-700'
                  }`}
                  placeholder="How was it? 💕"
                />
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className={`w-full btn-soft ${theme === 'dark' && 'dark'}`}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
                theme === 'dark'
                  ? 'bg-purple-900/95 border border-purple-800/50'
                  : 'bg-white/95 border border-white/30'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
                  {editingItem ? 'Edit Dream' : 'Add New Dream'} 🌟
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={theme === 'dark' ? 'text-purple-400 hover:text-purple-200' : 'text-gray-400 hover:text-gray-600'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const payload = buildPayload();

                  if (editingItem) {
                    updateMutation.mutate({ id: editingItem.id, data: payload });
                  } else {
                    createMutation.mutate(payload);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
                  }`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 ${
                      theme === 'dark'
                        ? 'bg-purple-800 border-purple-700 text-purple-200 placeholder-purple-400'
                        : 'bg-white border-pink-200 text-gray-700'
                    }`}
                    placeholder="Visit Japan together"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 resize-none ${
                      theme === 'dark'
                        ? 'bg-purple-800 border-purple-700 text-purple-200 placeholder-purple-400'
                        : 'bg-white border-pink-200 text-gray-700'
                    }`}
                    placeholder="Cherry blossom season, eat ramen, visit Tokyo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
                    }`}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-purple-800 border-purple-700 text-purple-200'
                          : 'bg-white border-pink-200 text-gray-700'
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
                    }`}>
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: parseInt(e.target.value) })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        theme === 'dark'
                          ? 'bg-purple-800 border-purple-700 text-purple-200'
                          : 'bg-white border-pink-200 text-gray-700'
                      }`}
                    >
                      <option value={1}>⭐ Low</option>
                      <option value={2}>⭐⭐ Medium</option>
                      <option value={3}>⭐⭐⭐ High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-purple-200' : 'text-gray-700'
                  }`}>
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 ${
                      theme === 'dark'
                        ? 'bg-purple-800 border-purple-700 text-purple-200'
                        : 'bg-white border-pink-200 text-gray-700'
                    }`}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full btn-romantic"
                >
                  {editingItem ? 'Update Dream' : 'Add to Bucket List'} 🌟
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Dream"
        itemName={deleteTarget?.name}
        message="This action cannot be undone. This dream will be permanently removed from your bucket list."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

// Card Component
interface BucketListCardProps {
  item: BucketListItem;
  index: number;
  theme: string | null;
  onEdit: (item: BucketListItem) => void;
  onDelete: (item: BucketListItem) => void;
  onComplete: (item: BucketListItem) => void;
}

const BucketListCard: React.FC<BucketListCardProps> = ({
  item,
  index,
  theme,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const category = categories.find((c) => c.value === item.category);
  const isCompleted = item.status === 'completed';
  const categoryColor = theme === 'dark' ? category?.darkColor : category?.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl p-4 backdrop-blur-sm transition-all ${
        isCompleted ? 'opacity-75' : ''
      } ${
        theme === 'dark'
          ? 'bg-purple-900/30 border border-purple-800/50'
          : 'bg-white/40 border border-white/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl bg-linear-to-r ${categoryColor || 'from-gray-400 to-gray-500'}`}>
          {category?.icon && <category.icon className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${isCompleted ? 'line-through' : ''} ${
            theme === 'dark' ? 'text-purple-100' : 'text-gray-800'
          }`}>
            {item.title}
          </h4>
          {item.description && (
            <p className={`text-sm mt-1 line-clamp-2 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-500'}`}>
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {Array.from({ length: item.priority }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
            ))}
            {item.target_date && (
              <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-gray-400'}`}>
                📅 {new Date(item.target_date).toLocaleDateString()}
              </span>
            )}
          </div>
          {isCompleted && item.completion_notes && (
            <p className={`text-xs mt-2 italic ${theme === 'dark' ? 'text-purple-300' : 'text-gray-400'}`}>
              "{item.completion_notes}"
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {!isCompleted && (
            <button
              onClick={() => onComplete(item)}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'text-green-400 hover:bg-purple-700'
                  : 'text-green-500 hover:bg-green-50'
              }`}
              title="Mark as completed"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(item)}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-purple-400 hover:text-purple-200 hover:bg-purple-700'
                : 'text-gray-400 hover:text-rose-500 hover:bg-pink-50'
            }`}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'text-purple-400 hover:text-red-400 hover:bg-purple-700'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BucketListPage;