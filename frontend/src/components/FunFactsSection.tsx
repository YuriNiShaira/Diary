import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Coffee, 
  Music, 
  MapPin, 
  Heart, 
  Smile, 
  Edit, 
  Save,
  X,
  Camera,
  Utensils,
  Tv,
  Home,
  Sparkles
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

  const { data: funFacts, isLoading } = useQuery<FunFacts>({
    queryKey: ['funFacts', yearId],
    queryFn: async () => {
      const response = await api.get(`/fun-facts/by_year/?year_id=${yearId}`);
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<FunFacts>) => {
      if (funFacts?.id) {
        // Update existing
        const response = await api.put(`/fun-facts/${funFacts.id}/`, data);
        return response.data;
      } else {
        // Create new
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
      toast.error('Failed to save fun facts');
    },
  });

  useEffect(() => {
    if (funFacts) {
      setFormData(funFacts);
    }
  }, [funFacts]);

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(funFacts || {});
    setIsEditing(false);
  };

  const factCards = [
    {
      icon: Utensils,
      label: 'Favorite Food',
      key: 'favorite_food' as keyof FunFacts,
      color: 'from-orange-400 to-red-400',
      placeholder: 'Pizza, Sushi, etc.',
    },
    {
      icon: Tv,
      label: 'Favorite Anime/Show',
      key: 'favorite_anime' as keyof FunFacts,
      color: 'from-purple-400 to-pink-400',
      placeholder: 'Naruto, One Piece, etc.',
    },
    {
      icon: Music,
      label: 'Song of the Year',
      key: 'song_of_the_year' as keyof FunFacts,
      color: 'from-pink-400 to-rose-400',
      placeholder: 'Our special song',
    },
    {
      icon: Camera,
      label: 'Favorite Movie',
      key: 'favorite_movie' as keyof FunFacts,
      color: 'from-blue-400 to-cyan-400',
      placeholder: 'Best movie we watched',
    },
    {
      icon: Heart,
      label: 'Favorite Activity',
      key: 'favorite_activity' as keyof FunFacts,
      color: 'from-red-400 to-pink-400',
      placeholder: 'What we loved doing together',
    },
    {
      icon: MapPin,
      label: 'Places Visited',
      key: 'places_visited' as keyof FunFacts,
      color: 'from-green-400 to-emerald-400',
      placeholder: 'Beach, Mountains, etc.',
    },
  ];

  const storyCards = [
    {
      icon: Sparkles,
      label: 'Best Moment',
      key: 'best_moment' as keyof FunFacts,
      color: 'from-yellow-400 to-amber-400',
      placeholder: 'The most memorable moment...',
      rows: 3
    },
    {
      icon: Smile,
      label: 'Inside Jokes',
      key: 'inside_jokes' as keyof FunFacts,
      color: 'from-indigo-400 to-purple-400',
      placeholder: 'Our special jokes that only we understand',
      rows: 3
    },
    {
      icon: Home,
      label: 'Highlights',
      key: 'highlights' as keyof FunFacts,
      color: 'from-teal-400 to-green-400',
      placeholder: 'The best parts of this year...',
      rows: 3
    },
    {
      icon: Heart,
      label: 'Memorable Quote',
      key: 'memorable_quote' as keyof FunFacts,
      color: 'from-rose-400 to-pink-400',
      placeholder: 'Something special we said...',
      rows: 2
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-gray-800">
            Fun Facts {yearNumber} ✨
          </h2>
          <p className="text-gray-500 mt-1">
            All the special things about this year
          </p>
        </div>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="btn-soft flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Facts
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCancel}
              className="btn-soft flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="btn-romantic flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </motion.button>
          </div>
        )}
      </div>

      {/* Quick Facts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factCards.map((card) => {
          const Icon = card.icon;
          const value = formData[card.key] as string || '';
          
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${card.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">{card.label}</h3>
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setFormData({ ...formData, [card.key]: e.target.value })}
                  placeholder={card.placeholder}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red bg-white/80"
                />
              ) : (
                <p className="text-gray-600 text-lg">
                  {value || <span className="text-gray-300 italic">Not set yet</span>}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Story Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storyCards.map((card) => {
          const Icon = card.icon;
          const value = formData[card.key] as string || '';
          
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${card.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">{card.label}</h3>
              </div>
              
              {isEditing ? (
                <textarea
                  value={value}
                  onChange={(e) => setFormData({ ...formData, [card.key]: e.target.value })}
                  placeholder={card.placeholder}
                  rows={card.rows}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red bg-white/80 resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {value || <span className="text-gray-300 italic">Click Edit to add {card.label.toLowerCase()}...</span>}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Year Summary Card */}
      {!isEditing && funFacts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 bg-gradient-to-br from-pink-50 to-rose-50"
        >
          <div className="text-center">
            <h3 className="text-2xl font-serif text-gray-800 mb-4">
              {yearNumber} in Review 💕
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {funFacts.favorite_food && (
                <span className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-gray-700">
                  🍕 {funFacts.favorite_food}
                </span>
              )}
              {funFacts.song_of_the_year && (
                <span className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-gray-700">
                  🎵 {funFacts.song_of_the_year}
                </span>
              )}
              {funFacts.favorite_anime && (
                <span className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-gray-700">
                  📺 {funFacts.favorite_anime}
                </span>
              )}
              {funFacts.places_visited && (
                <span className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-gray-700">
                  📍 {funFacts.places_visited}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FunFactsSection;