// frontend/src/pages/BucketListPage.tsx
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
}

const categories: Category[] = [
  { value: 'travel', label: '✈️ Travel', icon: MapPin, color: 'from-blue-400 to-cyan-400' },
  { value: 'date', label: '💕 Date Ideas', icon: Heart, color: 'from-pink-400 to-rose-400' },
  { value: 'adventure', label: '🏔️ Adventure', icon: Mountain, color: 'from-green-400 to-emerald-400' },
  { value: 'food', label: '🍽️ Food', icon: Utensils, color: 'from-orange-400 to-red-400' },
  { value: 'learning', label: '📚 Learn Together', icon: Book, color: 'from-purple-400 to-indigo-400' },
  { value: 'milestone', label: '🎯 Milestone', icon: Target, color: 'from-yellow-400 to-amber-400' },
  { value: 'other', label: '✨ Other', icon: Sparkles, color: 'from-gray-400 to-gray-500' },
];

const BucketListPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<BucketListItem | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'travel',
    priority: 2,
    target_date: '',
  });

  const queryClient = useQueryClient();

  const { data: items } = useQuery<BucketListItem[]>({
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

  const filteredItems = items?.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    return true;
  });

  const pendingItems = filteredItems?.filter((i) => i.status === 'pending') || [];
  const plannedItems = filteredItems?.filter((i) => i.status === 'planned') || [];
  const completedItems = filteredItems?.filter((i) => i.status === 'completed') || [];

  return (
    <div className="min-h-screen p-6 relative overflow-hidden bg-gradient-to-br from-blush via-misty-rose to-cherry-blossom">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cherry-blossom/20"
            initial={{ y: '100vh', x: `${Math.random() * 100}vw` }}
            animate={{ y: '-10vh', rotate: 360 }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 5 }}
          >
            <Star className="w-6 h-6 fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-love-red transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-2">
                <span className="text-gradient-love">Our Bucket List</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block ml-3"
                >
                  🌟
                </motion.span>
              </h1>
              <p className="text-gray-600 text-lg">
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
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass-card rounded-2xl p-5 text-center">
              <Target className="w-6 h-6 text-love-red mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Dreams</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
              <p className="text-sm text-gray-500">Achieved</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{stats.pending + stats.planned}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-800">{stats.completion_rate}%</p>
              <p className="text-sm text-gray-500">Completion</p>
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
            <div className="glass-card rounded-2xl p-4">
              <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completion_rate}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-love-red to-romantic-red"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
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
            className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-pink-200 rounded-xl text-sm"
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
            className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-pink-200 rounded-xl text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">⏳ Not Yet</option>
            <option value="planned">📅 Planned</option>
            <option value="completed">✅ Completed</option>
          </select>
        </motion.div>

        {/* Bucket List Grid - Three Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <h3 className="text-xl font-serif text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Not Yet
              <span className="text-sm text-gray-500 ml-2">({pendingItems.length})</span>
            </h3>
            <div className="space-y-3">
              {pendingItems.map((item, index) => (
                <BucketListCard
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onComplete={(item) => setSelectedItem(item)}
                />
              ))}
              {pendingItems.length === 0 && (
                <p className="text-gray-400 text-center py-8 text-sm">No pending dreams ✨</p>
              )}
            </div>
          </div>

          {/* Planned Column */}
          <div>
            <h3 className="text-xl font-serif text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Planned
              <span className="text-sm text-gray-500 ml-2">({plannedItems.length})</span>
            </h3>
            <div className="space-y-3">
              {plannedItems.map((item, index) => (
                <BucketListCard
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onComplete={(item) => setSelectedItem(item)}
                />
              ))}
              {plannedItems.length === 0 && (
                <p className="text-gray-400 text-center py-8 text-sm">No planned dreams 📅</p>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div>
            <h3 className="text-xl font-serif text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achieved
              <span className="text-sm text-gray-500 ml-2">({completedItems.length})</span>
            </h3>
            <div className="space-y-3">
              {completedItems.map((item, index) => (
                <BucketListCard
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onComplete={(item) => setSelectedItem(item)}
                />
              ))}
              {completedItems.length === 0 && (
                <p className="text-gray-400 text-center py-8 text-sm">No completed dreams yet 🌟</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎉</div>
                <h3 className="text-2xl font-serif text-gray-800 mb-2">Dream Achieved!</h3>
                <p className="text-gray-600">"{selectedItem.title}"</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="flex-1 py-2 px-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                    >
                      {who === 'me' && '🙋 Me'}
                      {who === 'shaira' && '💕 Shaira'}
                      {who === 'both' && '👫 Both'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red resize-none"
                  placeholder="How was it? 💕"
                />
              </div>

              <button onClick={() => setSelectedItem(null)} className="w-full btn-soft">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-gray-800">
                  {editingItem ? 'Edit Dream' : 'Add New Dream'} 🌟
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                    placeholder="Visit Japan together"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red resize-none"
                    placeholder="Cherry blossom season, eat ramen, visit Tokyo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg"
                    >
                      <option value={1}>⭐ Low</option>
                      <option value={2}>⭐⭐ Medium</option>
                      <option value={3}>⭐⭐⭐ High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
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
    </div>
  );
};

// Card Component
interface BucketListCardProps {
  item: BucketListItem;
  index: number;
  onEdit: (item: BucketListItem) => void;
  onDelete: (id: number) => void;
  onComplete: (item: BucketListItem) => void;
}

const BucketListCard: React.FC<BucketListCardProps> = ({
  item,
  index,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const category = categories.find((c) => c.value === item.category);
  const isCompleted = item.status === 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card rounded-2xl p-4 ${isCompleted ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl bg-gradient-to-r ${category?.color || 'from-gray-400 to-gray-500'}`}>
          {category?.icon && <category.icon className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-gray-800 ${isCompleted ? 'line-through' : ''}`}>
            {item.title}
          </h4>
          {item.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {Array.from({ length: item.priority }).map((_, i) => (
              <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
            ))}
            {item.target_date && (
              <span className="text-xs text-gray-400">
                📅 {new Date(item.target_date).toLocaleDateString()}
              </span>
            )}
          </div>
          {isCompleted && item.completion_notes && (
            <p className="text-xs text-gray-400 mt-2 italic">
              "{item.completion_notes}"
            </p>
          )}
        </div>
        <div className="flex gap-1">
          {!isCompleted && (
            <button
              onClick={() => onComplete(item)}
              className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
              title="Mark as completed"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-gray-400 hover:text-love-red hover:bg-pink-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BucketListPage;