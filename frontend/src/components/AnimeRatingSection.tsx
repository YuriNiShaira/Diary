import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Trophy,
  Settings,
  User,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AnimeCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  order: number;
  year: number;
}

interface AnimeRating {
  id: number;
  title: string;
  my_ratings: Record<string, number>;
  shaira_ratings: Record<string, number>;
  my_overall: number;
  shaira_overall: number;
  combined_overall: number;
  genre: string;
  watched_together: boolean;
  my_favorite_character: string;
  shaira_favorite_character: string;
  favorite_moment: string;
  notes: string;
  year: number;
}

interface AnimeRatingSectionProps {
  yearId: number;
  yearNumber: number;
}

// Available icons and colors (same as before)
const availableIcons = [
  'Star', 'Trophy', 'Heart', 'Zap', 'Target', 'Award', 'Crown', 'Sparkles',
  'Swords', 'Shield', 'Brain', 'Users', 'Smile', 'Eye', 'Music', 'Film'
];

const availableColors = [
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-400',
  'from-purple-400 to-violet-400',
  'from-pink-400 to-rose-400',
  'from-yellow-400 to-amber-400',
  'from-red-400 to-pink-400',
  'from-indigo-400 to-purple-400',
  'from-orange-400 to-red-400',
  'from-teal-400 to-green-400',
  'from-cyan-400 to-blue-400',
];

const AnimeRatingSection: React.FC<AnimeRatingSectionProps> = ({ yearId, yearNumber }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<AnimeRating | null>(null);
  const [expandedAnime, setExpandedAnime] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    my_ratings: {} as Record<string, number>,
    shaira_ratings: {} as Record<string, number>,
    genre: '',
    watched_together: true,
    my_favorite_character: '',
    shaira_favorite_character: '',
    favorite_moment: '',
    notes: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'Star',
    color: 'from-blue-400 to-cyan-400',
  });

  const queryClient = useQueryClient();

  const { data: categories } = useQuery<AnimeCategory[]>({
    queryKey: ['animeCategories', yearId],
    queryFn: async () => {
      const response = await api.get(`/anime-categories/?year=${yearId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const { data: animeList, isLoading } = useQuery<AnimeRating[]>({
    queryKey: ['animeRatings', yearId],
    queryFn: async () => {
      const response = await api.get(`/anime-ratings/?year=${yearId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/anime-categories/', { ...data, year: yearId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeCategories', yearId] });
      toast.success('Category added! 🎯');
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', icon: 'Star', color: 'from-blue-400 to-cyan-400' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/anime-categories/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeCategories', yearId] });
      toast.success('Category deleted');
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/anime-ratings/', { ...data, year: yearId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeRatings', yearId] });
      toast.success('Anime added! 🎬');
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/anime-ratings/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeRatings', yearId] });
      toast.success('Anime updated! 🎬');
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/anime-ratings/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeRatings', yearId] });
      toast.success('Anime deleted');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Initialize ratings for all categories
    const myRatings: Record<string, number> = {};
    const shairaRatings: Record<string, number> = {};
    
    categories?.forEach(cat => {
      myRatings[cat.name] = formData.my_ratings[cat.name] || 0;
      shairaRatings[cat.name] = formData.shaira_ratings[cat.name] || 0;
    });
    
    const data = { 
      ...formData, 
      my_ratings: myRatings,
      shaira_ratings: shairaRatings
    };
    
    if (editingAnime) {
      updateMutation.mutate({ id: editingAnime.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (anime: AnimeRating) => {
    setEditingAnime(anime);
    setFormData({
      title: anime.title,
      my_ratings: anime.my_ratings || {},
      shaira_ratings: anime.shaira_ratings || {},
      genre: anime.genre,
      watched_together: anime.watched_together,
      my_favorite_character: anime.my_favorite_character,
      shaira_favorite_character: anime.shaira_favorite_character,
      favorite_moment: anime.favorite_moment,
      notes: anime.notes,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingAnime(null);
    setFormData({
      title: '',
      my_ratings: {},
      shaira_ratings: {},
      genre: '',
      watched_together: true,
      my_favorite_character: '',
      shaira_favorite_character: '',
      favorite_moment: '',
      notes: '',
    });
  };

const RatingInput = ({ category, myValue, shairaValue, onChange }: any) => {
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {category.name}
      </label>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Your Rating */}
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <User className="w-3 h-3" /> You
          </p>
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={`my-${rating}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('my', rating);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={`w-7 h-7 rounded-lg text-sm font-medium transition-all ${
                  myValue >= rating
                    ? `bg-gradient-to-r ${category.color} text-white shadow-md scale-105`
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          {myValue > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Selected: {myValue}/10
            </p>
          )}
        </div>
        
        {/* Shaira's Rating */}
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Heart className="w-3 h-3" /> Shaira
          </p>
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={`shaira-${rating}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('shaira', rating);
                }}
                onMouseDown={(e) => e.preventDefault()}
                className={`w-7 h-7 rounded-lg text-sm font-medium transition-all ${
                  shairaValue >= rating
                    ? `bg-gradient-to-r ${category.color} text-white shadow-md scale-105`
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          {shairaValue > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Selected: {shairaValue}/10
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-gray-800">
            Anime/Show Ratings {yearNumber} 🎬
          </h2>
          <p className="text-gray-500 mt-1">
            {animeList?.length || 0} anime watched • Compare your ratings with Shaira!
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn-soft flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Categories
          </motion.button>
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
            Add Anime/Show
          </motion.button>
        </div>
      </div>

      {/* Category Management Modal - Same as before */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsCategoryModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-gray-800">
                  Rating Categories
                </h2>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-pink-50 rounded-xl">
                <h3 className="font-medium mb-3">Add New Category</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Category name (e.g., Power Scaling)"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm"
                  />
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Icon</label>
                    <select
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm"
                    >
                      {availableIcons.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                    <select
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm"
                    >
                      {availableColors.map(color => (
                        <option key={color} value={color}>{color.split(' ')[1]}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => createCategoryMutation.mutate(categoryForm)}
                    disabled={!categoryForm.name}
                    className="w-full btn-romantic py-2 text-sm"
                  >
                    Add Category
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Current Categories</h3>
                {categories?.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded bg-gradient-to-r ${cat.color}`} />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => deleteCategoryMutation.mutate(cat.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anime Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {animeList?.map((anime) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {anime.title}
                    </h3>
                    {anime.genre && (
                      <span className="text-sm text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                        {anime.genre}
                      </span>
                    )}
                  </div>
                  
                  {/* Overall Ratings Comparison */}
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-love-red" />
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-love-red">{anime.my_overall}</span>
                        <span className="text-xs text-gray-400">/10</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-purple-500" />
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-purple-500">{anime.shaira_overall}</span>
                        <span className="text-xs text-gray-400">/10</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-yellow-600">{anime.combined_overall}</span>
                        <span className="text-xs text-gray-400">/10</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedAnime(expandedAnime === anime.id ? null : anime.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedAnime === anime.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(anime)}
                    className="p-2 text-gray-400 hover:text-love-red transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(anime.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Favorite Characters */}
              <div className="flex gap-4 mb-3 text-sm">
                {anime.my_favorite_character && (
                  <p className="text-gray-600">
                    <User className="w-3 h-3 inline mr-1 text-love-red" />
                    Your fav: {anime.my_favorite_character}
                  </p>
                )}
                {anime.shaira_favorite_character && (
                  <p className="text-gray-600">
                    <Heart className="w-3 h-3 inline mr-1 text-purple-500" />
                    Shaira's fav: {anime.shaira_favorite_character}
                  </p>
                )}
              </div>

              {/* Expanded Ratings View */}
              <AnimatePresence>
                {expandedAnime === anime.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        {categories?.map((cat) => (
                          <div key={cat.id} className="space-y-1">
                            <p className="text-xs font-medium text-gray-600">{cat.name}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-love-red" />
                                <span className="text-sm font-medium">{anime.my_ratings?.[cat.name] || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3 text-purple-500" />
                                <span className="text-sm font-medium">{anime.shaira_ratings?.[cat.name] || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

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
              className="bg-white rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif text-gray-800">
                  {editingAnime ? 'Edit Anime' : 'Add New Anime'} 🎬
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                      required
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                      placeholder="Shonen, Romance, etc."
                    />
                  </div>
                </div>

                {/* Ratings - Side by Side */}
                {categories && categories.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">Ratings</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {categories.map((cat) => (
                        <RatingInput
                          key={cat.id}
                          category={cat}
                          myValue={formData.my_ratings[cat.name] || 0}
                          shairaValue={formData.shaira_ratings[cat.name] || 0}
                          onChange={(person: 'my' | 'shaira', value: number) => {
                            const ratingsKey = person === 'my' ? 'my_ratings' : 'shaira_ratings';
                            setFormData({
                              ...formData,
                              [ratingsKey]: {
                                ...formData[ratingsKey],
                                [cat.name]: value
                              }
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Settings className="w-8 h-8 mx-auto mb-2" />
                    <p>No rating categories yet.</p>
                    <p className="text-sm">Add categories first!</p>
                  </div>
                )}

                {/* Favorite Characters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Favorite Character
                    </label>
                    <input
                      type="text"
                      value={formData.my_favorite_character}
                      onChange={(e) => setFormData({ ...formData, my_favorite_character: e.target.value })}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                      placeholder="Your favorite"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shaira's Favorite Character
                    </label>
                    <input
                      type="text"
                      value={formData.shaira_favorite_character}
                      onChange={(e) => setFormData({ ...formData, shaira_favorite_character: e.target.value })}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                      placeholder="Shaira's favorite"
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favorite Moment
                    </label>
                    <textarea
                      value={formData.favorite_moment}
                      onChange={(e) => setFormData({ ...formData, favorite_moment: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red resize-none"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.watched_together}
                      onChange={(e) => setFormData({ ...formData, watched_together: e.target.checked })}
                      className="rounded text-love-red"
                    />
                    <span className="text-sm text-gray-700">Watched together 💕</span>
                  </label>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full btn-romantic"
                >
                  {editingAnime ? 'Update Anime' : 'Add Anime'} 🎬
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimeRatingSection;