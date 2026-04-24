import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Heart, Upload, Quote, Trash2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface Memory {
  id: number;
  title: string;
  date: string;
  description: string;
  image?: string;
  location?: string;
  favorite_quote?: string;
  is_favorite: boolean;
  memory_type: string;
  year: number;
}

interface EditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
  yearId: number;
}

const memoryTypes = [
  { value: 'milestone', label: '💫 Milestone' },
  { value: 'date', label: '💕 Date' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'everyday', label: '🌸 Everyday Magic' },
  { value: 'special', label: '✨ Special Moment' },
];

const EditMemoryModal: React.FC<EditMemoryModalProps> = ({ isOpen, onClose, memory, yearId }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [memoryType, setMemoryType] = useState('special');
  const [isFavorite, setIsFavorite] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [keepExistingImage, setKeepExistingImage] = useState(true);

  const queryClient = useQueryClient();

  // Load memory data when modal opens
  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setDate(memory.date);
      setDescription(memory.description);
      setLocation(memory.location || '');
      setFavoriteQuote(memory.favorite_quote || '');
      setMemoryType(memory.memory_type);
      setIsFavorite(memory.is_favorite);
      setPreview(memory.image || '');
      setKeepExistingImage(true);
    }
  }, [memory]);

  const updateMemoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.put(`/memories/${memory?.id}/`, formData, {
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
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Memory updated! 💕');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update memory. Please try again.');
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/memories/${memory?.id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['year', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['years'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Memory deleted 💔');
      onClose();
    },
    onError: () => {
      toast.error('Failed to delete memory.');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setKeepExistingImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview('');
    setKeepExistingImage(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !description) {
      toast.error('Please fill in the required fields 💝');
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
    } else if (!keepExistingImage) {
      // Clear the image if user removed it
      formData.append('image', '');
    }

    updateMemoryMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this memory? This cannot be undone. 💔')) {
      deleteMemoryMutation.mutate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && memory && (
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
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gray-800">
                Edit Memory 💕
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent"
                  placeholder="Our first date, Beach trip, etc."
                  required
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Memory Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Memory Type
                </label>
                <select
                  value={memoryType}
                  onChange={(e) => setMemoryType(e.target.value)}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent resize-none"
                  placeholder="Tell the story of this beautiful moment..."
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent"
                    placeholder="Where did this happen?"
                  />
                </div>
              </div>

              {/* Favorite Quote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favorite Quote (Optional)
                </label>
                <div className="relative">
                  <Quote className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    value={favoriteQuote}
                    onChange={(e) => setFavoriteQuote(e.target.value)}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red focus:border-transparent resize-none"
                    placeholder="Something special you said or I said..."
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (Optional)
                </label>
                {preview ? (
                  <div className="relative h-48 rounded-xl overflow-hidden">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="edit-memory-image"
                    />
                    <label htmlFor="edit-memory-image" className="cursor-pointer block">
                      <div className="h-48 border-2 border-dashed border-pink-200 rounded-xl flex flex-col items-center justify-center hover:border-love-red transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">Click to upload a photo</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Favorite Toggle */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-love-red/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-love-red"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 flex items-center">
                    Mark as Favorite
                    <Heart className={`w-4 h-4 ml-1 ${isFavorite ? 'text-love-red fill-current' : 'text-gray-400'}`} />
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={updateMemoryMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-love-red to-romantic-red text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateMemoryMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMemoryMutation.isPending}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteMemoryMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditMemoryModal;