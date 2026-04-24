import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Edit, Plus, Trash2, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface LoveLetter {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

const LoveLetterManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LoveLetter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);

  const queryClient = useQueryClient();

  const { data: letters, refetch } = useQuery<LoveLetter[]>({
    queryKey: ['allLoveLetters'],
    queryFn: async () => {
      const response = await api.get('/love-letters/');
      return response.data;
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LoveLetter>) => {
      const response = await api.post('/love-letters/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveLetters'] });
      queryClient.invalidateQueries({ queryKey: ['allLoveLetters'] });
      toast.success('Love letter created! 💕');
      resetForm();
      refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LoveLetter> }) => {
      const response = await api.put(`/love-letters/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveLetters'] });
      queryClient.invalidateQueries({ queryKey: ['allLoveLetters'] });
      toast.success('Love letter updated! 💕');
      resetForm();
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/love-letters/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveLetters'] });
      queryClient.invalidateQueries({ queryKey: ['allLoveLetters'] });
      toast.success('Love letter deleted');
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = { title, content, is_active: isActive };
    
    if (editingLetter) {
      updateMutation.mutate({ id: editingLetter.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (letter: LoveLetter) => {
    setEditingLetter(letter);
    setTitle(letter.title);
    setContent(letter.content);
    setIsActive(letter.is_active);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this love letter? 💔')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingLetter(null);
    setTitle('');
    setContent('');
    setIsActive(true);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-love-red to-romantic-red text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        title="Manage Love Letters"
      >
        <Mail className="w-6 h-6" />
      </motion.button>

      {/* Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-love-red to-romantic-red p-2 rounded-xl">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-serif text-gray-800">
                    Love Letters 💌
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Create/Edit Form */}
              <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  {editingLetter ? (
                    <>
                      <Edit className="w-5 h-5 text-love-red" />
                      Edit Letter
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 text-love-red" />
                      Write New Letter
                    </>
                  )}
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Letter Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent bg-white/80"
                    required
                    maxLength={200}
                  />
                  
                  <textarea
                    placeholder="Write your love letter here... 💕"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent bg-white/80 resize-none"
                    required
                  />
                  
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded text-love-red focus:ring-love-red"
                      />
                      <span className="text-sm text-gray-700">Active (shown in envelope)</span>
                    </label>
                    
                    <div className="flex gap-2">
                      {editingLetter && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={resetForm}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="px-6 py-2 bg-gradient-to-r from-love-red to-romantic-red text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {editingLetter ? 'Update' : 'Create'} 💕
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Letters List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 mb-3">Your Love Letters</h3>
                {letters?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Heart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No love letters yet. Create your first one! 💕</p>
                  </div>
                ) : (
                  letters?.map((letter) => (
                    <motion.div
                      key={letter.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-white border border-pink-100 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-800">{letter.title}</h4>
                            {letter.is_active && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {letter.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Created: {new Date(letter.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex gap-1 ml-4">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(letter)}
                            className="p-2 text-gray-400 hover:text-love-red transition-colors"
                            title="Edit letter"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(letter.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete letter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoveLetterManager;