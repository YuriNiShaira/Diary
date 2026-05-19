import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Upload } from 'lucide-react';
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
  const [year, setYear] = useState(new Date().getFullYear());
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const queryClient = useQueryClient();

  // Get anniversary year from user data
  const anniversaryYear = user?.anniversary_date 
    ? new Date(user.anniversary_date).getFullYear() 
    : null;

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
    const formData = new FormData();
    formData.append('year', year.toString());
    formData.append('description', description);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }
    createYearMutation.mutate(formData);
  };

  const resetForm = () => {
    setYear(new Date().getFullYear());
    setDescription('');
    setCoverImage(null);
    setPreview('');
  };

  const today = new Date();

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
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gray-800">
                Create New Year ✨
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Year Input with Warning */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || '' as any)}
                    min={1950}
                    max={today.getFullYear()}
                    className="w-full pl-10 pr-4 py-2 border border-soft-rose rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent"
                    placeholder="e.g., 2024"
                    required
                  />
                </div>
                
                {anniversaryYear && year && year < anniversaryYear && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2"
                  >
                    <span className="text-lg">📖</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        This is before your official anniversary ({anniversaryYear})
                      </p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        You started dating in {anniversaryYear}. This year will be marked as "The Prequel" - your love story before it officially began! 💕
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-soft-rose rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent"
                  placeholder="What made this year special? 💕"
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Photo (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="cover-image"
                  />
                  <label
                    htmlFor="cover-image"
                    className="cursor-pointer block"
                  >
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
                      <div className="h-40 border-2 border-dashed border-soft-rose rounded-xl flex flex-col items-center justify-center hover:border-love-red transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">Click to upload cover photo</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
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