import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Plus,
  Clock,
  Calendar,
  Trophy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useTheme } from '../../contexts/ThemeContext';
import RomanticBackground from '../RomanticBackground';
import Navbar from '../Navbar';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { BucketListCard, BucketListFilters, BucketListStats, CompleteModal, AddEditBucketListModal } from './index';
import type { BucketListItem, BucketListStats as BucketListStatsType, BucketListFormData } from './bucketlistTypes';

const BucketListPageContent: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<BucketListItem | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const [formData, setFormData] = useState<BucketListFormData>({
    title: '',
    description: '',
    category: 'travel',
    priority: 2,
    target_date: '',
  });

  const queryClient = useQueryClient();

  // THE NUCLEAR OPTION: Force fix hardcoded white backgrounds and dark inputs
  useEffect(() => {
    const styleId = 'bucketlist-theme-overrides';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    
    const styleEl = document.getElementById(styleId) as HTMLStyleElement;
    
    if (theme === 'dark') {
      styleEl.innerHTML = `
        /* Override stubborn white backgrounds and notebook patterns */
        #bucketlist-page-wrapper .bg-white,
        #bucketlist-page-wrapper .notebook-page,
        div[role="dialog"] .bg-white,
        div[role="dialog"] .notebook-page {
          background-color: #1f2937 !important;
          background-image: none !important;
          border-color: #374151 !important;
        }
        
        /* Ensure text is readable on the new dark backgrounds */
        #bucketlist-page-wrapper .bg-white p, 
        #bucketlist-page-wrapper .bg-white h1, 
        #bucketlist-page-wrapper .bg-white h2, 
        #bucketlist-page-wrapper .bg-white h3, 
        #bucketlist-page-wrapper .bg-white h4,
        #bucketlist-page-wrapper .bg-white label,
        div[role="dialog"] p,
        div[role="dialog"] h1,
        div[role="dialog"] h2,
        div[role="dialog"] h3,
        div[role="dialog"] h4,
        div[role="dialog"] label {
           color: #e5e7eb !important;
        }
        
        /* Fix text inputs and textareas (prevents gray-on-gray unreadable text) */
        #bucketlist-page-wrapper input, 
        #bucketlist-page-wrapper textarea, 
        #bucketlist-page-wrapper select,
        div[role="dialog"] input,
        div[role="dialog"] textarea,
        div[role="dialog"] select {
          background-color: #374151 !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
          color-scheme: dark !important;
          -webkit-text-fill-color: #f3f4f6 !important;
        }
        
        #bucketlist-page-wrapper input::placeholder, 
        #bucketlist-page-wrapper textarea::placeholder,
        div[role="dialog"] input::placeholder,
        div[role="dialog"] textarea::placeholder {
          color: #9ca3af !important;
          -webkit-text-fill-color: #9ca3af !important;
        }
      `;
    } else {
      styleEl.innerHTML = `
        /* Safety guard for Light mode */
        #bucketlist-page-wrapper input, 
        #bucketlist-page-wrapper textarea, 
        #bucketlist-page-wrapper select,
        div[role="dialog"] input,
        div[role="dialog"] textarea,
        div[role="dialog"] select {
          background-color: rgba(255, 255, 255, 0.9) !important;
          color: #1f2937 !important;
          border: 1px solid #d1d5db !important;
          color-scheme: light !important;
          -webkit-text-fill-color: #1f2937 !important;
        }
        
        #bucketlist-page-wrapper input::placeholder, 
        #bucketlist-page-wrapper textarea::placeholder,
        div[role="dialog"] input::placeholder,
        div[role="dialog"] textarea::placeholder {
          color: #9ca3af !important;
          -webkit-text-fill-color: #9ca3af !important;
        }
      `;
    }

    return () => {
      const style = document.getElementById(styleId);
      if (style) style.remove();
    };
  }, [theme]);

  const { data: items, isLoading } = useQuery<BucketListItem[]>({
    queryKey: ['bucketlist'],
    queryFn: async () => {
      const response = await api.get('/bucketlist/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const { data: stats } = useQuery<BucketListStatsType>({
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
    <div id="bucketlist-page-wrapper" className="min-h-screen relative overflow-hidden">
      <RomanticBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-10 notebook-page">
        <div className="absolute left-0 top-20 h-24 w-2 rounded-r-full bg-rose-200/40 blur-2xl" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
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
                <span className={`font-handwriting ${theme === 'dark' ? 'text-purple-100' : 'text-gradient-love'}`}>
                  Our Bucket List
                </span>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block ml-3">
                  🌟
                </motion.span>
              </h1>
              <p className={`text-lg max-w-2xl ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'} font-handwriting`}>
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

        {stats && <BucketListStats stats={stats} theme={theme} />}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <BucketListFilters
            theme={theme}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse">
                <div className="h-24 bg-purple-200/30 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className={`text-xl font-serif mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
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
                  <p className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-gray-400'}`}>
                    No pending dreams ✨
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className={`text-xl font-serif mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
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
                  <p className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-gray-400'}`}>
                    No planned dreams 📅
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className={`text-xl font-serif mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
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
                  <p className={`text-center py-8 text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-gray-400'}`}>
                    No completed dreams yet 🌟
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CompleteModal
        theme={theme}
        selectedItem={selectedItem}
        completionNotes={completionNotes}
        setCompletionNotes={setCompletionNotes}
        onClose={() => setSelectedItem(null)}
        onConfirm={({ id, completed_by, notes }) => completeMutation.mutate({ id, data: { completed_by, notes } })}
      />

      <AddEditBucketListModal
        theme={theme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        onSubmit={(e) => {
          e.preventDefault();
          const payload = buildPayload();
          if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: payload });
          } else {
            createMutation.mutate(payload);
          }
        }}
      />

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

export default BucketListPageContent;