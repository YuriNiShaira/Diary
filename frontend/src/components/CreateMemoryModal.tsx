import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Heart, Upload, Quote } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearId: number;
}

interface YearData {
  id: number;
  year: number;
  description?: string;
}

const memoryTypes = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'date', label: 'Date' },
  { value: 'travel', label: 'Travel' },
  { value: 'everyday', label: 'Everyday Magic' },
  { value: 'special', label: 'Special Moment' },
];

const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({ isOpen, onClose, yearId }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [memoryType, setMemoryType] = useState('special');
  const [isFavorite, setIsFavorite] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const queryClient = useQueryClient();

  const { data: yearData } = useQuery<YearData>({
    queryKey: ['year', yearId],
    queryFn: async () => {
      const response = await api.get(`/years/${yearId}/`);
      return response.data;
    },
    enabled: !!yearId && isOpen,
  });

  const createMemoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/memories/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['year', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Memory saved forever! 💕');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.date?.[0] || 'Failed to save memory. Please try again.';
      toast.error(errorMessage);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !description) {
      toast.error('Please fill in the required fields 💝');
      return;
    }

    const selectedYear = new Date(date).getFullYear();
    if (yearData && selectedYear !== yearData.year) {
      toast.error(`Please select a date in ${yearData.year}. The memory year must match the year page.`);
      return;
    }

    const formData = new FormData();
    formData.append('year', yearId.toString());
    formData.append('title', title);
    formData.append('date', date);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('favorite_quote', favoriteQuote);
    formData.append('memory_type', memoryType);
    formData.append('is_favorite', isFavorite.toString());
    if (image) {
      formData.append('image', image);
    }

    createMemoryMutation.mutate(formData);
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setLocation('');
    setFavoriteQuote('');
    setMemoryType('special');
    setIsFavorite(false);
    setImage(null);
    setPreview('');
  };

  const selectedYear = date ? new Date(date).getFullYear() : null;
  const isYearMismatch = !!(selectedYear && yearData && selectedYear !== yearData.year);

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
            // ✅ THE FIX: force dark background with !important + modal-card class
            className="modal-card bg-white dark:!bg-gray-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gray-800 dark:text-gray-100">
                Create New Memory 💕
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Our first date, Beach trip, etc."
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>

                {isYearMismatch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300"
                  >
                    The selected date is outside {yearData?.year}. To keep memories organized by year, please choose a date within {yearData?.year}.
                  </motion.div>
                )}
              </div>

              {/* Memory Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Memory Type
                </label>
                <select
                  value={memoryType}
                  onChange={(e) => setMemoryType(e.target.value)}
                  className="w-full px-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                >
                  {memoryTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Story *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Tell the story of this beautiful moment..."
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Where did this happen?"
                  />
                </div>
              </div>

              {/* Favorite Quote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favorite Quote (Optional)
                </label>
                <div className="relative">
                  <Quote className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <textarea
                    value={favoriteQuote}
                    onChange={(e) => setFavoriteQuote(e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2 border border-soft-rose dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-love-red dark:bg-gray-800 dark:text-gray-100"
                    placeholder="Something special you said or I said..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photo (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="memory-image"
                  />
                  <label htmlFor="memory-image" className="cursor-pointer block">
                    {preview ? (
                      <div className="relative h-48 rounded-xl overflow-hidden">
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
                      <div className="h-48 border-2 border-dashed border-soft-rose dark:border-gray-600 rounded-xl flex flex-col items-center justify-center hover:border-love-red dark:hover:border-gray-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Click to upload a photo</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Favorite Toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-love-red/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-love-red"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    Mark as Favorite
                    <Heart className="w-4 h-4 ml-1 text-love-red fill-current" />
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={createMemoryMutation.isPending || isYearMismatch}
                className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                  isYearMismatch
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:shadow-xl'
                } text-white`}
              >
                {createMemoryMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  'Save Memory Forever 💕'
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateMemoryModal;