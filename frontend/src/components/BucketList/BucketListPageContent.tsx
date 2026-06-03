import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Trophy,
  Sparkles
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
  const isDark = theme === 'dark';

  // THE REFINED NUCLEAR OPTION: Forces your unstyled modals to match the Premium Mahogany/Ivory theme!
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
        /* Premium Mahogany Overrides for Modals */
        #bucketlist-page-wrapper .bg-white,
        #bucketlist-page-wrapper .notebook-page,
        div[role="dialog"] .bg-white,
        div[role="dialog"] .notebook-page,
        div[role="dialog"] {
          background-color: #2a0815 !important;
          background-image: none !important;
          border-color: #4c0519 !important;
        }
        
        div[role="dialog"] p,
        div[role="dialog"] h1,
        div[role="dialog"] h2,
        div[role="dialog"] h3,
        div[role="dialog"] h4,
        div[role="dialog"] label {
           color: #fecdd3 !important; /* rose-200 */
           font-family: 'Playfair Display', serif !important;
        }
        
        div[role="dialog"] input,
        div[role="dialog"] textarea,
        div[role="dialog"] select {
          background-color: #1a050f !important;
          color: #ffe4e6 !important;
          border: 1px solid #881337 !important; /* rose-900 */
          color-scheme: dark !important;
          -webkit-text-fill-color: #ffe4e6 !important;
          border-radius: 0.5rem !important;
        }
        
        div[role="dialog"] input::placeholder,
        div[role="dialog"] textarea::placeholder {
          color: #be185d !important; /* rose-700 */
          -webkit-text-fill-color: #be185d !important;
        }
      `;
    } else {
      styleEl.innerHTML = `
        /* Premium Ivory Overrides for Modals */
        div[role="dialog"] .bg-white,
        div[role="dialog"] .notebook-page,
        div[role="dialog"] {
          background-color: #FFFAF0 !important;
          background-image: none !important;
          border-color: #fecdd3 !important;
        }

        div[role="dialog"] input, 
        div[role="dialog"] textarea, 
        div[role="dialog"] select {
          background-color: #ffffff !important;
          color: #4c0519 !important;
          border: 1px solid #fecdd3 !important;
          color-scheme: light !important;
          -webkit-text-fill-color: #4c0519 !important;
          border-radius: 0.5rem !important;
        }
        
        div[role="dialog"] input::placeholder, 
        div[role="dialog"] textarea::placeholder {
          color: #fda4af !important;
          -webkit-text-fill-color: #fda4af !important;
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
    <div id="bucketlist-page-wrapper" className="min-h-screen relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Dancing Script', cursive; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
      `}} />
      
      <RomanticBackground />
      <Navbar />

      <div className="max-w-[1400px] mx-auto relative z-10 px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2 text-[10px] font-serif uppercase tracking-widest transition-colors mb-8 group ${
              isDark ? 'text-rose-300 hover:text-rose-100' : 'text-rose-600 hover:text-rose-900'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between flex-wrap gap-8">
            <div>
              <h1 className={`flex flex-wrap items-end gap-3 mb-2 ${isDark ? 'text-rose-50' : 'text-rose-950'}`}>
                <span className="text-4xl md:text-[3.25rem] font-cormorant italic tracking-widest mb-1 md:mb-2">Our</span>
                <span className="text-gradient-love font-script text-6xl md:text-7xl font-bold leading-none pr-2">
                  Bucket List
                </span>
              </h1>
              
              <p className={`text-lg md:text-xl font-serif italic tracking-wide mt-3 ${isDark ? 'text-rose-200/80' : 'text-rose-800/70'}`}>
                Dreams we'll achieve together. 
                <span className="block sm:inline sm:ml-2 font-handwriting text-2xl text-rose-500 dark:text-rose-400 opacity-90">
                  One by one.
                </span>
              </p>
              <div className="h-[1px] w-24 mt-6 bg-gradient-to-r from-transparent via-rose-300 to-transparent opacity-60" />
            </div>

            {/* Premium 'Pen a Dream' Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className={`relative overflow-hidden group px-8 py-3.5 rounded-full border shadow-md transition-all ${
                isDark
                  ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
                  : 'bg-rose-950 border-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_4px_15px_rgba(136,19,55,0.25)]'
              }`}
            >
              <div className="absolute inset-1 border border-dashed rounded-full opacity-30 pointer-events-none border-rose-200"></div>
              <span className="relative z-10 flex items-center gap-2 font-serif uppercase tracking-widest text-[11px]">
                Pen a Dream <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              </span>
            </motion.button>
          </div>
        </motion.div>

        {stats && <BucketListStats stats={stats} theme={theme} />}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <BucketListFilters
            theme={theme}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
          />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`rounded-sm p-6 animate-pulse border ${isDark ? 'bg-[#2a0815] border-rose-900/50' : 'bg-[#FFFAF0] border-rose-100'}`}>
                <div className={`h-24 rounded-sm ${isDark ? 'bg-rose-900/30' : 'bg-rose-200/30'}`}></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 mt-8">
            
            {/* Column 1: Not Yet */}
            <div>
              <h3 className={`text-xs font-serif uppercase tracking-[0.2em] font-semibold mb-6 pb-4 border-b flex items-center gap-3 ${
                isDark ? 'text-rose-200 border-rose-900/50' : 'text-rose-800 border-rose-200/80'
              }`}>
                <Clock className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                Not Yet
                <span className={`text-[10px] ml-auto ${isDark ? 'text-rose-400/70' : 'text-rose-400'}`}>
                  ({pendingItems.length})
                </span>
              </h3>
              <div className="space-y-5">
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
                  <p className={`text-center py-10 font-serif italic text-sm ${isDark ? 'text-rose-400/50' : 'text-rose-400'}`}>
                    No pending dreams ✨
                  </p>
                )}
              </div>
            </div>

            {/* Column 2: Planned */}
            <div>
              <h3 className={`text-xs font-serif uppercase tracking-[0.2em] font-semibold mb-6 pb-4 border-b flex items-center gap-3 ${
                isDark ? 'text-rose-200 border-rose-900/50' : 'text-rose-800 border-rose-200/80'
              }`}>
                <Calendar className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                Planned
                <span className={`text-[10px] ml-auto ${isDark ? 'text-rose-400/70' : 'text-rose-400'}`}>
                  ({plannedItems.length})
                </span>
              </h3>
              <div className="space-y-5">
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
                  <p className={`text-center py-10 font-serif italic text-sm ${isDark ? 'text-rose-400/50' : 'text-rose-400'}`}>
                    No planned dreams 📅
                  </p>
                )}
              </div>
            </div>

            {/* Column 3: Achieved */}
            <div>
              <h3 className={`text-xs font-serif uppercase tracking-[0.2em] font-semibold mb-6 pb-4 border-b flex items-center gap-3 ${
                isDark ? 'text-rose-200 border-rose-900/50' : 'text-rose-800 border-rose-200/80'
              }`}>
                <Trophy className={`w-4 h-4 ${isDark ? 'text-amber-500/80' : 'text-amber-500'}`} />
                Achieved
                <span className={`text-[10px] ml-auto ${isDark ? 'text-rose-400/70' : 'text-rose-400'}`}>
                  ({completedItems.length})
                </span>
              </h3>
              <div className="space-y-5">
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
                  <p className={`text-center py-10 font-serif italic text-sm ${isDark ? 'text-rose-400/50' : 'text-rose-400'}`}>
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
        title="Burn this Page?"
        itemName={deleteTarget?.name}
        message="This action cannot be undone. This dream will be permanently erased from your journal."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default BucketListPageContent;