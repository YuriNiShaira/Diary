import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, Plus, Edit, Trash2, X, CheckCircle,
  Star, Heart, Volume2, PlayCircle, Play
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
        year: yearId,
      };
      const response = await api.post('/song-recommendations/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success('Song added to our collection!');
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
        is_listened: data.is_listened, year: yearId,
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
      toast.success('Song removed');
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
      is_listened: song.is_listened, rating: song.rating || 0,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingSong(null);
    setFormData({
      title: '', artist: '',
      recommended_by: 'me', recommended_to: 'shaira',
      youtube_link: '', spotify_link: '',
      is_listened: false, rating: 0,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/, /youtube\.com\/embed\/([^&\n?#]+)/];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-purple-500/20 text-purple-300' : 'bg-pink-100 text-love-red'}`}>
              <Music className="w-6 h-6" />
            </div>
            <h2 className={`text-3xl md:text-4xl font-serif font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
              The Soundtrack of {yearNumber}
            </h2>
          </div>
          <p className={`text-lg ${theme === 'dark' ? 'text-purple-300/80' : 'text-gray-500'}`}>
            Every melody tells a piece of our story.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="btn-romantic flex items-center justify-center gap-2 px-6 py-3 shadow-lg shadow-love-red/20"
        >
          <Plus className="w-5 h-5" />
          Recommend a Song
        </motion.button>
      </header>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Tracks', value: stats.total_songs, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Finished', value: stats.listened_count, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: `From ${displayName}`, value: stats.my_recommendations, icon: Heart, color: 'text-love-red', bg: 'bg-pink-500/10' },
            { label: `From ${partnerName}`, value: stats.shaira_recommendations, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((stat, i) => (
            <div key={i} className={`group relative overflow-hidden rounded-2xl p-5 transition-all hover:shadow-md ${theme === 'dark' ? 'glass-card-dark border-purple-500/10' : 'glass-card border-pink-100'}`}>
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-purple-300/60' : 'text-gray-400'}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-2 bg-black/5 rounded-2xl">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-purple-900/40 border border-white/20">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-purple-400">By:</span>
          <select
            value={filterRecommendedBy}
            onChange={(e) => setFilterRecommendedBy(e.target.value as any)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer dark:text-purple-100"
          >
            <option value="all">Everyone</option>
            <option value="me">{displayName}</option>
            <option value="shaira">{partnerName}</option>
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/50 dark:bg-purple-900/40 border border-white/20">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-purple-400">Status:</span>
          <select
            value={filterListened}
            onChange={(e) => setFilterListened(e.target.value as any)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer dark:text-purple-100"
          >
            <option value="all">All Tracks</option>
            <option value="listened">Heard It</option>
            <option value="unlistened">New to Me</option>
          </select>
        </div>
      </div>

      {/* Song List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-32 rounded-3xl animate-pulse ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-gray-100'}`} />
          ))}
        </div>
      ) : songs?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-60">
          <Volume2 className="w-10 h-10" />
          <h4 className="text-xl font-medium">Your playlist is waiting...</h4>
          <p>Add a song that reminds you of us.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {songs?.map((song) => (
            <motion.div
              key={song.id} layout
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`group relative flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 hover:shadow-xl ${
                song.is_listened ? 'opacity-90' : 'ring-1 ring-love-red/10'
              } ${theme === 'dark' ? 'glass-card-dark border-purple-500/10 hover:bg-purple-800/40' : 'glass-card border-pink-100 hover:bg-white'}`}
            >
              <button
                onClick={() => toggleListenedMutation.mutate({ id: song.id, is_listened: !song.is_listened })}
                className="relative flex-shrink-0"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  song.is_listened ? 'bg-emerald-500/10 text-emerald-500' : (theme === 'dark' ? 'bg-purple-700/30 text-purple-400' : 'bg-gray-100 text-gray-400')
                }`}>
                  {song.is_listened ? <CheckCircle className="w-7 h-7" /> : <Play className="w-6 h-6 fill-current" />}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-lg font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{song.title}</h3>
                  {song.rating > 0 && (
                    <div className="flex bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < song.rating ? 'text-amber-500 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  )}
                </div>
                <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-600'}`}>{song.artist}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  song.recommended_by === 'me' ? 'bg-love-red text-white' : 'bg-purple-500 text-white'
                }`}>
                  {song.recommended_by === 'me' ? displayName : partnerName}'s Pick
                </span>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(song)} className="p-2 rounded-xl hover:bg-blue-500/10 text-blue-400"><Edit className="w-4 h-4" /></button>
                <button onClick={() => deleteMutation.mutate(song.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal - Fixed X button */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className={`relative w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-purple-950 border border-white/10' : 'bg-white border border-pink-100'
              }`}
            >
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-love-red/10 rounded-full blur-3xl" />
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className={`text-2xl font-serif font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {editingSong ? 'Edit Track' : 'New Recommendation'}
                  </h2>
                  <p className="text-sm text-gray-500">Share the music in your heart.</p>
                </div>
                <button onClick={closeModal} type="button" className="p-2 rounded-full hover:bg-black/5 transition-colors z-10">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                editingSong ? updateMutation.mutate({ id: editingSong.id, data: formData }) : createMutation.mutate(formData);
              }} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Song Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-5 py-3 rounded-2xl border-2 ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 focus:border-purple-400 text-white' : 'bg-gray-50 border-gray-100 focus:border-love-red'}`} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Artist</label>
                    <input type="text" required value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      className={`w-full px-5 py-3 rounded-2xl border-2 ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 focus:border-purple-400 text-white' : 'bg-gray-50 border-gray-100 focus:border-love-red'}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">From</label>
                    <select value={formData.recommended_by} onChange={(e) => setFormData({ ...formData, recommended_by: e.target.value })}
                      className={`w-full px-4 py-3 rounded-2xl border-2 ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-white' : 'bg-gray-50 border-gray-100'}`}>
                      <option value="me">{displayName}</option>
                      <option value="shaira">{partnerName}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">To</label>
                    <select value={formData.recommended_to} onChange={(e) => setFormData({ ...formData, recommended_to: e.target.value })}
                      className={`w-full px-4 py-3 rounded-2xl border-2 ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-white' : 'bg-gray-50 border-gray-100'}`}>
                      <option value="shaira">{partnerName}</option>
                      <option value="me">{displayName}</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">YouTube Link</label>
                  <input type="url" value={formData.youtube_link} onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                    className={`w-full px-5 py-3 rounded-2xl border-2 ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-white' : 'bg-gray-50 border-gray-100'}`} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Spotify Link</label>
                  <input type="url" value={formData.spotify_link} onChange={(e) => setFormData({ ...formData, spotify_link: e.target.value })}
                    className={`w-full px-5 py-3 rounded-2xl border-2 ${theme === 'dark' ? 'bg-purple-900/40 border-purple-800 text-white' : 'bg-gray-50 border-gray-100'}`} />
                </div>
                {editingSong && (
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-6 h-6 rounded flex items-center justify-center border-2 ${formData.is_listened ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                        {formData.is_listened && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.is_listened} onChange={(e) => setFormData({ ...formData, is_listened: e.target.checked })} />
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>We've listened to this!</span>
                    </label>
                    {formData.is_listened && (
                      <div className="flex items-center gap-4 pt-2 border-t border-black/10 dark:border-white/10">
                        <span className="text-sm font-medium">Our Rating:</span>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map((r) => (
                            <button key={r} type="button" onClick={() => setFormData({ ...formData, rating: r })}>
                              <Star className={`w-6 h-6 ${formData.rating >= r ? 'text-amber-500 fill-current' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                  className="w-full btn-romantic py-4 text-lg font-bold shadow-xl shadow-love-red/20">
                  {editingSong ? 'Save Changes' : 'Add to our Playlist'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistSection;