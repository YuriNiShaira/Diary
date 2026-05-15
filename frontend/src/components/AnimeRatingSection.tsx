// frontend/src/components/AnimeRatingSection.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Star, Plus, Edit, Trash2, X, Trophy, Settings, User, Heart, 
  ChevronDown, ChevronUp, Sparkles, Film, Check, Tv, Clapperboard
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// --- Types ---
interface AnimeCategory {
  id: number;
  name: string;
  order: number;
  year: number;
}

interface AnimeRating {
  id: number;
  title: string;
  media_type: string;
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

const MEDIA_TYPES = [
  { value: 'all', label: 'All', icon: Film },
  { value: 'anime', label: 'Anime', icon: Tv },
  { value: 'movie', label: 'Movie', icon: Clapperboard },
  { value: 'show', label: 'Show', icon: Film },
];

const RatingProgress = ({ label, myScore, partnerScore }: { 
  label: string; 
  myScore: number; 
  partnerScore: number;
}) => (
  <div className="space-y-1.5 w-full">
    <div className="flex justify-between text-xs font-medium text-gray-600 px-1">
      <span>{label}</span>
    </div>
    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(myScore / 10) * 50}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-rose-400 to-rose-500 flex items-center justify-end pr-2 text-[10px] text-white font-bold"
      >
        {myScore > 0 && myScore}
      </motion.div>
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/50 z-10" />
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(partnerScore / 10) * 50}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-purple-400 to-purple-500 flex items-center justify-start pl-2 text-[10px] text-white font-bold"
      >
        {partnerScore > 0 && partnerScore}
      </motion.div>
    </div>
  </div>
);

const getMediaTypeIcon = (type: string) => {
  switch (type) {
    case 'anime': return <Tv className="w-4 h-4 inline" />;
    case 'movie': return <Clapperboard className="w-4 h-4 inline" />;
    case 'show': return <Film className="w-4 h-4 inline" />;
    default: return null;
  }
};

const AnimeRatingSection: React.FC<AnimeRatingSectionProps> = ({ yearId, yearNumber }) => {
  const { user } = useAuth();
  const partnerName = user?.partner_name || 'Partner';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<AnimeRating | null>(null);
  const [expandedAnime, setExpandedAnime] = useState<number | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all');
  const [categoryName, setCategoryName] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    media_type: 'anime',
    my_ratings: {} as Record<string, number>,
    shaira_ratings: {} as Record<string, number>,
    genre: '',
    watched_together: true,
    my_favorite_character: '',
    shaira_favorite_character: '',
    favorite_moment: '',
    notes: '',
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
    queryKey: ['animeRatings', yearId, mediaTypeFilter],
    queryFn: async () => {
      const url = mediaTypeFilter === 'all' 
        ? `/anime-ratings/?year=${yearId}`
        : `/anime-ratings/?year=${yearId}&media_type=${mediaTypeFilter}`;
      const response = await api.get(url);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/anime-categories/', { name, year: yearId, order: 0 });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeCategories', yearId] });
      toast.success('Category added! 🎯');
      setCategoryName('');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/anime-categories/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeCategories', yearId] });
      toast.success('Category removed');
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/anime-ratings/', { ...data, year: yearId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeRatings', yearId] });
      toast.success('Added to watchlist! 💕');
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
      toast.success('Updated! ✍️');
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
      toast.success('Removed from watchlist');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      media_type: anime.media_type || 'anime',
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
      media_type: 'anime',
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

  return (
    <div className="space-y-8 pb-12">
      <style dangerouslySetInnerHTML={{__html: `
        .text-gradient-gold {
          background: linear-gradient(135deg, #b8935c 0%, #e7c688 40%, #d8ad62 60%, #fdffb3 80%, #b8935c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1));
        }
      `}} />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 bg-white/40 p-6 rounded-3xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-bold tracking-widest text-rose-400 uppercase">Chapter {yearNumber}</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-gray-800 tracking-wide">Our Watchlist</h2>
          <p className="text-gray-500 mt-2 italic font-medium flex items-center gap-2">
            <Film className="w-4 h-4" /> 
            {animeList?.length || 0} stories shared together
          </p>
        </div>
        
        <div className="flex gap-3 relative z-10 w-full md:w-auto flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white text-gray-600 rounded-xl font-medium border border-gray-200 shadow-sm hover:shadow hover:text-rose-600 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" /> Metrics
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Story
          </motion.button>
        </div>
      </div>

      {/* Media Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {MEDIA_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <motion.button
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMediaTypeFilter(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mediaTypeFilter === type.value
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </motion.button>
          );
        })}
      </div>

      {/* Category Modal - SIMPLIFIED: no icon/color picker */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsCategoryModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-serif font-bold text-gray-800">Rating Categories</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g., Story, Animation..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm"
                />
                <button
                  onClick={() => categoryName && createCategoryMutation.mutate(categoryName)}
                  disabled={!categoryName}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories?.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <button
                      onClick={() => deleteCategoryMutation.mutate(cat.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {categories?.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">No categories yet</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] p-6 animate-pulse h-48 border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {animeList?.map((anime) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-rose-50 hover:border-rose-100 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(225,29,72,0.08)] relative overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-rose-100/60 to-transparent rounded-full pointer-events-none" />

              <div className="flex items-start justify-between relative z-10 mb-5">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-lg">{getMediaTypeIcon(anime.media_type || 'anime')}</span>
                    <h3 className="text-2xl font-serif font-bold text-gray-800 leading-tight">{anime.title}</h3>
                    {anime.genre && (
                      <span className="text-xs font-semibold text-rose-600 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full tracking-wide">{anime.genre}</span>
                    )}
                    {anime.watched_together && (
                      <span className="text-xs text-pink-500 bg-pink-50 p-1.5 rounded-full" title="Watched Together">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="inline-flex items-center bg-gray-50 border border-gray-100 rounded-2xl p-1.5 shadow-sm mt-1">
                    <div className="flex items-center px-3 py-1 bg-white rounded-xl shadow-sm">
                      <User className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                      <span className="font-bold text-gray-800 text-sm">{anime.my_overall}</span>
                    </div>
                    <div className="flex items-center px-4 py-1">
                      <Trophy className="w-4 h-4 text-[#d8ad62] mr-1.5" />
                      <span className="font-black text-gradient-gold text-lg">{anime.combined_overall}</span>
                    </div>
                    <div className="flex items-center px-3 py-1 bg-white rounded-xl shadow-sm">
                      <Heart className="w-3.5 h-3.5 text-purple-500 mr-1.5" />
                      <span className="font-bold text-gray-800 text-sm">{anime.shaira_overall}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button onClick={() => setExpandedAnime(expandedAnime === anime.id ? null : anime.id)} className="p-2.5 bg-white text-gray-400 hover:text-rose-500 border border-gray-100 hover:border-rose-200 rounded-full shadow-sm transition-all">
                    {expandedAnime === anime.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(anime)} className="p-2.5 bg-white text-gray-400 hover:text-blue-500 border border-gray-100 hover:border-blue-200 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Favorites */}
              {(anime.my_favorite_character || anime.shaira_favorite_character) && (
                <div className="flex flex-col sm:flex-row gap-3 mb-2">
                  {anime.my_favorite_character && (
                    <div className="flex-1 bg-rose-50/50 rounded-xl p-2.5 px-3 flex items-center gap-2 border border-rose-100/30">
                      <div className="p-1 bg-rose-100 rounded-md"><User className="w-3 h-3 text-rose-600" /></div>
                      <span className="text-sm text-gray-600 truncate"><span className="font-semibold">Fav:</span> {anime.my_favorite_character}</span>
                    </div>
                  )}
                  {anime.shaira_favorite_character && (
                    <div className="flex-1 bg-purple-50/50 rounded-xl p-2.5 px-3 flex items-center gap-2 border border-purple-100/30">
                      <div className="p-1 bg-purple-100 rounded-md"><Heart className="w-3 h-3 text-purple-600" /></div>
                      <span className="text-sm text-gray-600 truncate"><span className="font-semibold">{partnerName}:</span> {anime.shaira_favorite_character}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedAnime === anime.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 mt-4 border-t border-gray-100/80">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-6">
                        {categories?.map((cat) => (
                          <RatingProgress 
                            key={cat.id}
                            label={cat.name} 
                            myScore={anime.my_ratings?.[cat.name] || 0}
                            partnerScore={anime.shaira_ratings?.[cat.name] || 0}
                          />
                        ))}
                      </div>

                      {(anime.favorite_moment || anime.notes) && (
                        <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100 shadow-inner space-y-3">
                          {anime.favorite_moment && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Favorite Moment</h4>
                              <p className="text-sm text-gray-700 italic">"{anime.favorite_moment}"</p>
                            </div>
                          )}
                          {anime.notes && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1.5"><Edit className="w-3.5 h-3.5" /> Notes</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{anime.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-end mt-4">
                        <button onClick={() => deleteMutation.mutate(anime.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete Entry
                        </button>
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
            className="fixed inset-0 bg-rose-950/30 backdrop-blur-md flex items-center justify-center z-50 p-4 py-8 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#fffcfd] rounded-[2rem] p-8 max-w-4xl w-full shadow-[0_20px_60px_-15px_rgba(225,29,72,0.3)] relative my-auto border-2 border-rose-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-rose-50/80 to-transparent rounded-t-[2rem] pointer-events-none" />

              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-gray-800">
                    {editingAnime ? 'Edit Entry' : 'New Watch Entry'}
                  </h2>
                  <p className="text-gray-500 text-sm font-medium">Record your thoughts and ratings</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-full transition-colors shadow-sm border border-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 space-y-5">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Type *</label>
                        <select
                          value={formData.media_type}
                          onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 transition-all font-medium"
                        >
                          <option value="anime">Anime</option>
                          <option value="movie">Movie</option>
                          <option value="show">TV Show</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Title *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 transition-all font-medium" placeholder="e.g. One Piece" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Genre</label>
                        <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 transition-all font-medium" placeholder="Shonen" />
                      </div>
                      <label className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-xl border border-pink-100 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.watched_together ? 'bg-pink-500 border-pink-500' : 'bg-white border-gray-300 group-hover:border-pink-400'}`}>
                          {formData.watched_together && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={formData.watched_together} onChange={(e) => setFormData({ ...formData, watched_together: e.target.checked })} />
                        <span className="text-sm font-medium text-pink-900">Watched Together 💕</span>
                      </label>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Your Fav Character</label>
                        <input type="text" value={formData.my_favorite_character} onChange={(e) => setFormData({ ...formData, my_favorite_character: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5"/> {partnerName}'s Fav Character</label>
                        <input type="text" value={formData.shaira_favorite_character} onChange={(e) => setFormData({ ...formData, shaira_favorite_character: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-400 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 flex flex-col gap-5">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex-1">
                      <h3 className="text-lg font-serif font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Scoring Metrics
                      </h3>
                      {categories && categories.length > 0 ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {categories.map((cat) => (
                            <div key={cat.id} className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50">
                              <p className="text-rose-900 font-medium mb-3">{cat.name}</p>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Your Rating</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {[1,2,3,4,5,6,7,8,9,10].map((rating) => (
                                      <button key={`my-${rating}`} type="button" onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, my_ratings: { ...prev.my_ratings, [cat.name]: rating } })); }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${formData.my_ratings[cat.name] === rating ? 'bg-rose-500 text-white shadow-md scale-110 font-bold' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                                      >{rating}</button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {partnerName}'s Rating</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {[1,2,3,4,5,6,7,8,9,10].map((rating) => (
                                      <button key={`partner-${rating}`} type="button" onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, shaira_ratings: { ...prev.shaira_ratings, [cat.name]: rating } })); }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${formData.shaira_ratings[cat.name] === rating ? 'bg-purple-500 text-white shadow-md scale-110 font-bold' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                                      >{rating}</button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                          <Settings className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                          <p className="text-gray-500 font-medium">No metrics defined yet.</p>
                          <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="mt-2 text-rose-500 font-bold hover:underline">Add Categories First</button>
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Favorite Moment</label>
                        <textarea value={formData.favorite_moment} onChange={(e) => setFormData({ ...formData, favorite_moment: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 resize-none text-sm" placeholder="That one scene where..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Additional Notes</label>
                        <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400 resize-none text-sm" placeholder="Thoughts, quotes, tears shed..." />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4 border-t border-rose-100 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 flex items-center gap-2">
                    {editingAnime ? <><Edit className="w-5 h-5"/> Update Entry</> : <><Star className="w-5 h-5"/> Save to Diary</>}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fbcfe8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f472b6; }
      `}} />
    </div>
  );
};

export default AnimeRatingSection;