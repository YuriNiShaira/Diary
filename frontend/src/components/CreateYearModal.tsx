import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CreateYearModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateYearModal: React.FC<CreateYearModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [yearNumber, setYearNumber] = useState<number | ''>(1);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const queryClient = useQueryClient();

  const createYearMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/years/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Year created successfully! 💕');
      onClose();
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create year. Please try again.');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearNumber) return;
    const formData = new FormData();
    formData.append('year', yearNumber.toString());
    formData.append('description', description);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }
    createYearMutation.mutate(formData);
  };

  const resetForm = () => {
    setYearNumber(1);
    setDescription('');
    setCoverImage(null);
    setPreview('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="modal-card bg-white dark:!bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gray-800 dark:text-gray-100">
                Create New Year ✨
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Year Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year Number 
                </label>
                <input
                  type="number"
                  min={1}
                  value={yearNumber}
                  onChange={(e) => setYearNumber(parseInt(e.target.value) || '')}
                  required
                  className="w-full px-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                  placeholder="e.g., 1, 2, 3..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year Title
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Give this year a name..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Photo
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="cover-image"
                  />
                  <label htmlFor="cover-image" className="cursor-pointer block">
                    {preview ? (
                      <div className="relative h-40 rounded-xl overflow-hidden">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white">Change Photo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 border-2 border-dashed border-soft-rose dark:border-gray-600 rounded-xl flex flex-col items-center justify-center hover:border-love-red dark:hover:border-gray-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Click to upload cover photo</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={createYearMutation.isPending}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {createYearMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  'Create Year 💕'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateYearModal;