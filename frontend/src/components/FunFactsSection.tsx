import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, MapPin, Heart, Smile, Edit, Save,
  X, Camera, Utensils, Tv, Home, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface FunFacts {
  id: number;
  favorite_food: string;
  favorite_anime: string;
  song_of_the_year: string;
  best_moment: string;
  inside_jokes: string;
  places_visited: string;
  favorite_movie: string;
  favorite_activity: string;
  memorable_quote: string;
  highlights: string;
  year: number;
}

interface FunFactsSectionProps {
  yearId: number;
  yearNumber: number;
}

const FunFactsSection: React.FC<FunFactsSectionProps> = ({ yearId, yearNumber }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FunFacts>>({});

  const queryClient = useQueryClient();

  // 1. FETCH DATA
  const { data: funFacts, isLoading } = useQuery<FunFacts>({
    queryKey: ['funFacts', yearId],
    queryFn: async () => {
      const response = await api.get(`/fun-facts/by_year/?year_id=${yearId}`);
      return response.data;
    },
  });

  // 2. MUTATION
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<FunFacts>) => {
      if (funFacts?.id) {
        const response = await api.put(`/fun-facts/${funFacts.id}/`, data);
        return response.data;
      } else {
        const response = await api.post('/fun-facts/', { ...data, year: yearId });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funFacts', yearId] });
      toast.success('Fun facts saved! 🎉');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to save fun facts. Please try again.');
    },
  });

  // 3. HANDLERS
  const handleEditClick = () => {
    setFormData(funFacts || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  // Check if form data is actually different from original data
  const isDirty = useMemo(() => {
    if (!funFacts && Object.keys(formData).length > 0) return true;
    return JSON.stringify({ ...funFacts, ...formData }) !== JSON.stringify(funFacts);
  }, [formData, funFacts]);

  // 4. CONFIGURATION ARRAYS
  const factCards = [
    { icon: Utensils, label: 'Favorite Food', key: 'favorite_food' as keyof FunFacts, color: 'from-orange-400 to-red-400', placeholder: 'Pizza, Sushi, etc.' },
    { icon: Tv, label: 'Favorite Anime/Show', key: 'favorite_anime' as keyof FunFacts, color: 'from-purple-400 to-pink-400', placeholder: 'Naruto, One Piece, etc.' },
    { icon: Music, label: 'Song of the Year', key: 'song_of_the_year' as keyof FunFacts, color: 'from-pink-400 to-rose-400', placeholder: 'Our special song' },
    { icon: Camera, label: 'Favorite Movie', key: 'favorite_movie' as keyof FunFacts, color: 'from-blue-400 to-cyan-400', placeholder: 'Best movie we watched' },
    { icon: Heart, label: 'Favorite Activity', key: 'favorite_activity' as keyof FunFacts, color: 'from-red-400 to-pink-400', placeholder: 'What we loved doing together' },
    { icon: MapPin, label: 'Places Visited', key: 'places_visited' as keyof FunFacts, color: 'from-green-400 to-emerald-400', placeholder: 'Beach, Mountains, etc.' },
  ];

  const storyCards = [
    { icon: Sparkles, label: 'Best Moment', key: 'best_moment' as keyof FunFacts, color: 'from-yellow-400 to-amber-400', placeholder: 'The most memorable moment...', rows: 3 },
    { icon: Smile, label: 'Inside Jokes', key: 'inside_jokes' as keyof FunFacts, color: 'from-indigo-400 to-purple-400', placeholder: 'Our special jokes that only we understand', rows: 3 },
    { icon: Home, label: 'Highlights', key: 'highlights' as keyof FunFacts, color: 'from-teal-400 to-green-400', placeholder: 'The best parts of this year...', rows: 3 },
    { icon: Heart, label: 'Memorable Quote', key: 'memorable_quote' as keyof FunFacts, color: 'from-rose-400 to-pink-400', placeholder: 'Something special we said...', rows: 2 },
  ];

  // 5. RENDERERS
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gray-200/50 rounded-xl" />
                <div className="h-5 bg-gray-200/50 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200/50 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-gray-800">
            Fun Facts {yearNumber} ✨
          </h2>
          <p className="text-gray-500 mt-1">
            All the special things about this year
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.button
              key="edit-btn"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditClick}
              className="btn-soft flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit Facts
            </motion.button>
          ) : (
            <motion.div 
              key="action-btns"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="btn-soft flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                <X className="w-4 h-4" /> Cancel
              </motion.button>
              <motion.button
                whileHover={isDirty ? { scale: 1.05 } : {}}
                whileTap={isDirty ? { scale: 0.95 } : {}}
                onClick={handleSave}
                disabled={saveMutation.isPending || !isDirty}
                className="btn-romantic flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factCards.map((card, idx) => {
          const Icon = card.icon;
          const value = formData[card.key] as string || '';
          const displayValue = funFacts?.[card.key] as string || '';

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <label htmlFor={card.key} className="font-semibold text-gray-800 cursor-pointer">
                  {card.label}
                </label>
              </div>
              
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <input
                      id={card.key}
                      type="text"
                      value={value}
                      onChange={(e) => setFormData(prev => ({ ...prev, [card.key]: e.target.value }))}
                      placeholder={card.placeholder}
                      className="w-full px-4 py-3 border border-pink-100 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white/80 transition-all outline-none"
                    />
                  </motion.div>
                ) : (
                  <motion.p key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-600 text-lg">
                    {displayValue || <span className="text-gray-400 italic text-sm">Not set yet</span>}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Story Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storyCards.map((card, idx) => {
          const Icon = card.icon;
          const value = formData[card.key] as string || '';
          const displayValue = funFacts?.[card.key] as string || '';

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (factCards.length + idx) * 0.05 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <label htmlFor={card.key} className="font-semibold text-gray-800 cursor-pointer">
                  {card.label}
                </label>
              </div>
              
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="textarea" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <textarea
                      id={card.key}
                      value={value}
                      onChange={(e) => setFormData(prev => ({ ...prev, [card.key]: e.target.value }))}
                      placeholder={card.placeholder}
                      rows={card.rows}
                      className="w-full px-4 py-3 border border-pink-100 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white/80 resize-none transition-all outline-none"
                    />
                  </motion.div>
                ) : (
                  <motion.p key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {displayValue || <span className="text-gray-400 italic text-sm">Click Edit to add {card.label.toLowerCase()}...</span>}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Year Summary Card */}
      <AnimatePresence>
        {!isEditing && funFacts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl p-8 bg-gradient-to-br from-rose-50 to-pink-50 border border-white/50"
          >
            <div className="text-center">
              <h3 className="text-2xl font-serif text-gray-800 mb-6">
                {yearNumber} in Review 💕
              </h3>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-3"
                variants={{
                  show: { transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                animate="show"
              >
                {[
                  { icon: '🍕', val: funFacts.favorite_food },
                  { icon: '🎵', val: funFacts.song_of_the_year },
                  { icon: '📺', val: funFacts.favorite_anime },
                  { icon: '📍', val: funFacts.places_visited }
                ].map((item, i) => item.val && (
                  <motion.span 
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="px-4 py-2 bg-white/70 backdrop-blur-md rounded-full text-gray-700 shadow-sm border border-white font-medium"
                  >
                    {item.icon} {item.val}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FunFactsSection;