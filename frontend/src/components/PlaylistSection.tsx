import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, Plus, Edit, Trash2, X, CheckCircle,
  Star, Play, Disc
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface SongRecommendation {
  id: number;
  title: string;
  artist: string;
  recommended_by: string;
  recommended_by_display: string;
  recommended_to: string;
  recommended_to_display: string;
  youtube_link: string;
  spotify_link: string;
  is_listened: boolean;
  listened_date: string | null;
  rating: number;
  mood: string;
  mood_display: string;
  created_at: string;
  year: number;
}

interface PlaylistStats {
  total_songs: number;
  listened_count: number;
  my_recommendations: number;
  shaira_recommendations: number;
  for_me: number;
  for_shaira: number;
}

interface PlaylistSectionProps {
  yearId: number;
  yearNumber: number;
}

const MOOD_CHOICES = [
  { value: 'romantic', label: '💕 Romantic' },
  { value: 'sad', label: '😢 Sad' },
  { value: 'chill', label: '😌 Chill' },
  { value: 'other', label: '✨ Other' },
];

// Helper component for the "tape" effect
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-white/50' }) => (
  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-10`} />
);

const PlaylistSection: React.FC<PlaylistSectionProps> = ({ yearId, yearNumber }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const displayName = user?.display_name || 'You';
  const partnerName = user?.partner_name || 'Partner';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SongRecommendation | null>(null);
  const [filterRecommendedBy, setFilterRecommendedBy] = useState<'all' | 'me' | 'shaira'>('all');
  const [filterListened, setFilterListened] = useState<'all' | 'listened' | 'unlistened'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    recommended_by: 'me',
    recommended_to: 'shaira',
    youtube_link: '',
    spotify_link: '',
    is_listened: false,
    rating: 0,
    mood: 'other',
  });

  const queryClient = useQueryClient();

  const { data: songs, isLoading } = useQuery<SongRecommendation[]>({
    queryKey: ['songRecommendations', yearId, filterRecommendedBy, filterListened],
    queryFn: async () => {
      let url = `/song-recommendations/?year=${yearId}`;
      if (filterRecommendedBy !== 'all') url += `&recommended_by=${filterRecommendedBy}`;
      if (filterListened !== 'all') url += `&is_listened=${filterListened === 'listened'}`;
      const response = await api.get(url);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const { data: stats } = useQuery<PlaylistStats>({
    queryKey: ['playlistStats', yearId],
    queryFn: async () => {
      const response = await api.get(`/song-recommendations/stats/?year_id=${yearId}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        title: data.title,
        artist: data.artist,
        recommended_by: data.recommended_by,
        recommended_to: data.recommended_to,
        youtube_link: data.youtube_link || '',
        spotify_link: data.spotify_link || '',
        is_listened: false,
        rating: null,
        mood: data.mood,
        year: yearId,
      };
      const response = await api.post('/song-recommendations/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success('Song added to our mixtape! 🎵');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to add song.'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const payload: any = {
        title: data.title, artist: data.artist,
        recommended_by: data.recommended_by, recommended_to: data.recommended_to,
        youtube_link: data.youtube_link || '', spotify_link: data.spotify_link || '',
        is_listened: data.is_listened, mood: data.mood, year: yearId,
      };
      payload.rating = (data.rating >= 1 && data.rating <= 5) ? data.rating : null;
      const response = await api.put(`/song-recommendations/${id}/`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success('Song updated!');
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => toast.error('Failed to update song.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/song-recommendations/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success('Song crossed out.');
    },
  });

  const toggleListenedMutation = useMutation({
    mutationFn: async ({ id, is_listened }: { id: number; is_listened: boolean }) => {
      const response = await api.patch(`/song-recommendations/${id}/`, { 
        is_listened,
        listened_date: is_listened ? new Date().toISOString().split('T')[0] : null
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success(variables.is_listened ? 'Marked as listened!' : 'Marked as unlistened');
    },
  });

  const handleEdit = (song: SongRecommendation) => {
    setEditingSong(song);
    setFormData({
      title: song.title, artist: song.artist,
      recommended_by: song.recommended_by, recommended_to: song.recommended_to,
      youtube_link: song.youtube_link || '', spotify_link: song.spotify_link || '',
      is_listened: song.is_listened, rating: song.rating || 0, mood: song.mood || 'other',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingSong(null);
    setFormData({
      title: '', artist: '',
      recommended_by: 'me', recommended_to: 'shaira',
      youtube_link: '', spotify_link: '',
      is_listened: false, rating: 0, mood: 'other',
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className={`space-y-10 max-w-6xl mx-auto p-4 sm:p-8 rounded-3xl min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-900/40' : 'bg-amber-50/30'
    }`}>
      {/* Header */}
      <header className={`flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-dashed pb-6 ${
        theme === 'dark' ? 'border-slate-700' : 'border-gray-300'
      }`}>
        <div>
          <h2 className={`text-4xl font-serif tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
            Our Mixtape {yearNumber} 📼
          </h2>
          <p className={`mt-2 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            The songs that scored our favorite moments...
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className={`px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all font-medium flex items-center gap-2 border-2 ${
            theme === 'dark' 
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
              : 'bg-white border-gray-200 text-gray-700'
          }`}
        >
          <Plus className="w-4 h-4" /> add a song
        </motion.button>
      </header>

      {/* Stats - Pinned Paper Scraps */}
      {stats && (
        <div className="flex flex-wrap justify-center md:justify-start gap-4">
          {[
            { label: 'Total Tracks', value: stats.total_songs, rotate: '-rotate-2', bg: theme === 'dark' ? 'bg-slate-800' : 'bg-blue-50' },
            { label: 'Listened To', value: stats.listened_count, rotate: 'rotate-1', bg: theme === 'dark' ? 'bg-slate-800' : 'bg-emerald-50' },
            { label: `By ${displayName}`, value: stats.my_recommendations, rotate: '-rotate-1', bg: theme === 'dark' ? 'bg-slate-800' : 'bg-pink-50' },
            { label: `By ${partnerName}`, value: stats.shaira_recommendations, rotate: 'rotate-2', bg: theme === 'dark' ? 'bg-slate-800' : 'bg-amber-50' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className={`relative ${stat.bg} ${stat.rotate} p-4 rounded-sm shadow-md min-w-35 text-center flex-1 sm:flex-none border ${
                theme === 'dark' ? 'border-slate-700' : 'border-black/5'
              }`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 rounded-full bg-red-400/80 shadow-inner border border-red-500" />
              <p className={`text-3xl font-handwriting mt-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                {stat.value}
              </p>
              <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hand-drawn Filters */}
      <div className={`flex flex-wrap items-center gap-6 pt-4 border-t border-dashed ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <span className={`font-handwriting text-2xl ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Filter by pen:</span>
          <select
            value={filterRecommendedBy}
            onChange={(e) => setFilterRecommendedBy(e.target.value as any)}
            className={`bg-transparent font-handwriting text-2xl border-b-2 focus:outline-none cursor-pointer pb-1 ${
              theme === 'dark' ? 'text-pink-400 border-pink-500/50' : 'text-pink-600 border-pink-300'
            }`}
          >
            <option value="all" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>Everyone</option>
            <option value="me" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>{displayName}</option>
            <option value="shaira" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>{partnerName}</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-handwriting text-2xl ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Status:</span>
          <select
            value={filterListened}
            onChange={(e) => setFilterListened(e.target.value as any)}
            className={`bg-transparent font-handwriting text-2xl border-b-2 focus:outline-none cursor-pointer pb-1 ${
              theme === 'dark' ? 'text-blue-400 border-blue-500/50' : 'text-blue-600 border-blue-300'
            }`}
          >
            <option value="all" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>All Tracks</option>
            <option value="listened" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>Heard It</option>
            <option value="unlistened" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>New to Me</option>
          </select>
        </div>
      </div>

      {/* Song List - Index Card Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-40 rounded-sm border animate-pulse ${
              theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-200'
            }`} />
          ))}
        </div>
      ) : songs?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
          <Disc className={`w-12 h-12 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`} />
          <h4 className={`text-3xl font-handwriting ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>The mixtape is empty...</h4>
          <p className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>add a song that reminds you of us.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-4">
          {songs?.map((song, idx) => (
            <motion.div
              key={song.id} 
              layout
              initial={{ opacity: 0, scale: 0.9, rotate: (idx % 2 === 0 ? -1 : 1) }} 
              animate={{ opacity: 1, scale: 1, rotate: (idx % 3 === 0 ? -1 : idx % 2 === 0 ? 1 : 0) }}
              whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }}
              className={`group relative p-5 pt-8 rounded-sm shadow-[2px_4px_12px_rgba(0,0,0,0.08)] border flex flex-col transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
              } ${song.is_listened ? 'opacity-80 grayscale-[20%]' : ''}`}
            >
              <WashiTape 
                rotate={idx % 2 === 0 ? 'rotate-2' : '-rotate-2'} 
                color={theme === 'dark' ? 'bg-slate-700/80 border-slate-600' : 'bg-red-100/50'} 
              />
              
              {/* Card Header (Action buttons hidden until hover) */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  onClick={() => handleEdit(song)} 
                  className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(song.id)} 
                  className={`p-1.5 rounded transition-colors ${theme === 'dark' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Main Info */}
              <div className={`flex-1 border-b-2 pb-2 mb-3 ${theme === 'dark' ? 'border-rose-900/50' : 'border-red-200'}`}>
                <h3 className={`font-handwriting text-3xl leading-none truncate ${
                  theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
                } ${song.is_listened ? 'line-through decoration-gray-400' : ''}`}>
                  {song.title}
                </h3>
                <p className={`font-handwriting text-2xl truncate mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  by {song.artist}
                </p>
              </div>

              {/* Meta data */}
              <div className="flex flex-col gap-3 justify-between">
                <div className="flex items-center justify-between">
                  <span className={`font-handwriting text-xl ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                    From: <span className={theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}>
                      {song.recommended_by === 'me' ? displayName : partnerName}
                    </span>
                  </span>
                  {song.mood && (
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 border rounded-sm transform -rotate-2 ${
                      theme === 'dark' 
                        ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {song.mood_display || song.mood}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => toggleListenedMutation.mutate({ id: song.id, is_listened: !song.is_listened })}
                    className={`flex items-center gap-2 font-handwriting text-xl transition-colors ${
                      song.is_listened 
                        ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') 
                        : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')
                    }`}
                  >
                    {song.is_listened ? <CheckCircle className="w-5 h-5" /> : <div className={`w-5 h-5 rounded-full border-2 border-dashed ${theme === 'dark' ? 'border-slate-500' : 'border-gray-400'}`} />}
                    {song.is_listened ? 'We heard this!' : 'Listen?'}
                  </button>

                  <div className="flex gap-2">
                    {song.youtube_link && (
                      <a href={song.youtube_link} target="_blank" rel="noopener noreferrer"
                        className={`transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`} title="YouTube"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </a>
                    )}
                    {song.spotify_link && (
                      <a href={song.spotify_link} target="_blank" rel="noopener noreferrer"
                        className={`transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-emerald-400' : 'text-gray-400 hover:text-emerald-500'}`} title="Spotify"
                      >
                        <Music className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Rating Stamp */}
                {song.rating > 0 && (
                  <div className={`flex gap-1 justify-center mt-2 py-1.5 rounded-sm border border-dashed ${
                    theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${
                        i < song.rating 
                          ? 'text-yellow-400 fill-current' 
                          : (theme === 'dark' ? 'text-slate-600' : 'text-gray-300')
                      }`} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal - Notebook Paper Style */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0, rotate: -2 }} 
              animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0, rotate: 2 }}
              className={`relative w-full max-w-lg shadow-2xl overflow-hidden border-l-4 rounded-r-lg rounded-l-sm ${
                theme === 'dark' ? 'bg-slate-900 border-rose-900' : 'bg-[#faf8f5] border-red-300'
              }`}
              style={{
                backgroundImage: `repeating-linear-gradient(transparent, transparent 39px, ${theme === 'dark' ? '#334155' : '#e5e7eb'} 39px, ${theme === 'dark' ? '#334155' : '#e5e7eb'} 40px)`,
                backgroundAttachment: 'local'
              }}
            >
              <div className="p-8 pb-10">
                <div className={`flex justify-between items-start mb-6 inline-block pr-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-[#faf8f5]'}`}>
                  <div>
                    <h2 className={`text-4xl font-handwriting ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                      {editingSong ? 'Rewrite Track' : 'New Recommendation'}
                    </h2>
                  </div>
                  <button onClick={closeModal} type="button" className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                    <X className={`w-6 h-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  editingSong ? updateMutation.mutate({ id: editingSong.id, data: formData }) : createMutation.mutate(formData);
                }} className="space-y-6 mt-[-10px]">
                  
                  {/* Title & Artist - Aligning with notebook lines roughly */}
                  <div className="space-y-4">
                    <input type="text" required placeholder="Song Title..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full bg-transparent border-none outline-none font-handwriting text-3xl leading-[40px] h-10 ${
                        theme === 'dark' ? 'text-slate-100 placeholder:text-slate-500' : 'text-gray-800 placeholder:text-gray-400'
                      }`} />
                    
                    <input type="text" required placeholder="Artist..." value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      className={`w-full bg-transparent border-none outline-none font-handwriting text-3xl leading-[40px] h-10 ${
                        theme === 'dark' ? 'text-slate-100 placeholder:text-slate-500' : 'text-gray-800 placeholder:text-gray-400'
                      }`} />
                  </div>

                  {/* Selectors */}
                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-sm border border-dashed mt-4 ${
                    theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-300'
                  }`}>
                    <div className="space-y-1">
                      <label className={`font-handwriting text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>From:</label>
                      <select value={formData.recommended_by} onChange={(e) => setFormData({ ...formData, recommended_by: e.target.value })}
                        className={`w-full bg-transparent font-handwriting text-2xl outline-none cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                        <option value="me" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>{displayName}</option>
                        <option value="shaira" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>{partnerName}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className={`font-handwriting text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>To:</label>
                      <select value={formData.recommended_to} onChange={(e) => setFormData({ ...formData, recommended_to: e.target.value })}
                        className={`w-full bg-transparent font-handwriting text-2xl outline-none cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                        <option value="shaira" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>{partnerName}</option>
                        <option value="me" className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>{displayName}</option>
                      </select>
                    </div>
                  </div>

                  <div className={`p-4 rounded-sm border border-dashed ${
                    theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-gray-300'
                  }`}>
                    <label className={`font-handwriting text-xl block mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Vibe / Mood:</label>
                    <select value={formData.mood} onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                      className={`w-full bg-transparent font-handwriting text-2xl outline-none cursor-pointer ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
                      {MOOD_CHOICES.map((mood) => (
                        <option key={mood.value} value={mood.value} className={theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}>{mood.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Links */}
                  <div className="space-y-4">
                    <input type="url" placeholder="YouTube Link (optional)" value={formData.youtube_link} onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                      className={`w-full bg-transparent border-none outline-none font-handwriting text-2xl leading-[40px] h-10 ${
                        theme === 'dark' ? 'text-blue-400 placeholder:text-slate-500' : 'text-blue-600 placeholder:text-gray-400'
                      }`} />
                    
                    <input type="url" placeholder="Spotify Link (optional)" value={formData.spotify_link} onChange={(e) => setFormData({ ...formData, spotify_link: e.target.value })}
                      className={`w-full bg-transparent border-none outline-none font-handwriting text-2xl leading-[40px] h-10 ${
                        theme === 'dark' ? 'text-emerald-400 placeholder:text-slate-500' : 'text-emerald-600 placeholder:text-gray-400'
                      }`} />
                  </div>

                  {editingSong && (
                    <div className={`p-4 border rounded-sm transform rotate-1 ${
                      theme === 'dark' ? 'bg-yellow-900/20 border-yellow-700/50' : 'bg-yellow-50/80 border-yellow-200'
                    }`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          formData.is_listened 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : (theme === 'dark' ? 'border-slate-500' : 'border-gray-400')
                        }`}>
                          {formData.is_listened && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={formData.is_listened} onChange={(e) => setFormData({ ...formData, is_listened: e.target.checked })} />
                        <span className={`font-handwriting text-2xl ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>We've listened to this!</span>
                      </label>
                      
                      {formData.is_listened && (
                        <div className={`flex items-center gap-4 pt-3 mt-3 border-t border-dashed ${theme === 'dark' ? 'border-yellow-700/50' : 'border-yellow-200'}`}>
                          <span className={`font-handwriting text-2xl ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>Rating:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((r) => (
                              <button key={r} type="button" onClick={() => setFormData({ ...formData, rating: r })}>
                                <Star className={`w-8 h-8 ${
                                  formData.rating >= r 
                                    ? 'text-amber-500 fill-current' 
                                    : (theme === 'dark' ? 'text-slate-600 hover:text-slate-500' : 'text-gray-300 hover:text-gray-400')
                                }`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className={`w-full text-white font-handwriting text-3xl py-2 rounded-sm shadow-md transition-colors transform -rotate-1 ${
                      theme === 'dark' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-400 hover:bg-pink-500'
                    }`}>
                    {editingSong ? 'Save Changes' : 'Tape to Mixtape'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistSection;