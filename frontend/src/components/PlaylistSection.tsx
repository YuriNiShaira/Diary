import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Music,
  Plus,
  Edit,
  Trash2,
  X,
  Play,
  ExternalLink,
  CheckCircle,
  Circle,
  Star,
  User,
  Heart,
  Volume2,
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface SongRecommendation {
  id: number;
  title: string;
  artist: string;
  album: string;
  recommended_by: string;
  recommended_by_display: string;
  recommended_to: string;
  recommended_to_display: string;
  youtube_link: string;
  spotify_link: string;
  note: string;
  genre: string;
  mood: string;
  mood_display: string;
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
  average_rating: number;
}

interface PlaylistSectionProps {
  yearId: number;
  yearNumber: number;
}

const PlaylistSection: React.FC<PlaylistSectionProps> = ({ yearId, yearNumber }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SongRecommendation | null>(null);
  const [filterRecommendedBy, setFilterRecommendedBy] = useState<'all' | 'me' | 'shaira'>('all');
  const [filterListened, setFilterListened] = useState<'all' | 'listened' | 'unlistened'>('all');
  const [expandedSong, setExpandedSong] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    recommended_by: 'me',
    recommended_to: 'shaira',
    youtube_link: '',
    spotify_link: '',
    note: '',
    genre: '',
    mood: '',
    is_listened: false,
    rating: 0,
  });

  const queryClient = useQueryClient();

  const { data: songs, isLoading } = useQuery<SongRecommendation[]>({
    queryKey: ['songRecommendations', yearId, filterRecommendedBy, filterListened],
    queryFn: async () => {
      let url = `/song-recommendations/?year=${yearId}`;

      if (filterRecommendedBy !== 'all') {
        url += `&recommended_by=${filterRecommendedBy}`;
      }

      if (filterListened !== 'all') {
        url += `&is_listened=${filterListened === 'listened'}`;
      }

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
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/song-recommendations/', { ...data, year: yearId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success('Song added to playlist! 🎵');
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await api.put(`/song-recommendations/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success('Song updated! ✏️');
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/song-recommendations/${id}/`);
    },
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
        listened_date: is_listened ? new Date().toISOString().split('T')[0] : null,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations', yearId] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats', yearId] });
      toast.success(
        variables.is_listened ? 'Marked as listened! 🎧' : 'Marked as unlistened'
      );
    },
  });

  const handleEdit = (song: SongRecommendation) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      album: song.album || '',
      recommended_by: song.recommended_by,
      recommended_to: song.recommended_to,
      youtube_link: song.youtube_link || '',
      spotify_link: song.spotify_link || '',
      note: song.note || '',
      genre: song.genre || '',
      mood: song.mood || '',
      is_listened: song.is_listened,
      rating: song.rating || 0,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingSong(null);
    setFormData({
      title: '',
      artist: '',
      album: '',
      recommended_by: 'me',
      recommended_to: 'shaira',
      youtube_link: '',
      spotify_link: '',
      note: '',
      genre: '',
      mood: '',
      is_listened: false,
      rating: 0,
    });
  };

  const moods = [
    { value: 'romantic', label: '💕 Romantic' },
    { value: 'happy', label: '😊 Happy' },
    { value: 'chill', label: '😌 Chill' },
    { value: 'energetic', label: '⚡ Energetic' },
    { value: 'nostalgic', label: '🥺 Nostalgic' },
    { value: 'sad', label: '😢 Sad' },
    { value: 'party', label: '🎉 Party' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-gray-800">
            Our Playlist {yearNumber} 🎵
          </h2>
          <p className="text-gray-500 mt-1">
            Songs we recommended to each other
          </p>
        </div>

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
          Add Song
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <Music className="w-5 h-5 text-love-red mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{stats.total_songs}</p>
            <p className="text-xs text-gray-500">Total Songs</p>
          </div>

          <div className="glass-card rounded-xl p-4 text-center">
            <Volume2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{stats.listened_count}</p>
            <p className="text-xs text-gray-500">Listened</p>
          </div>

          <div className="glass-card rounded-xl p-4 text-center">
            <User className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{stats.my_recommendations}</p>
            <p className="text-xs text-gray-500">From You</p>
          </div>

          <div className="glass-card rounded-xl p-4 text-center">
            <Heart className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-800">{stats.shaira_recommendations}</p>
            <p className="text-xs text-gray-500">From Shaira</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterRecommendedBy}
          onChange={(e) => setFilterRecommendedBy(e.target.value as 'all' | 'me' | 'shaira')}
          className="px-3 py-2 border border-pink-200 rounded-lg text-sm bg-white/60"
        >
          <option value="all">All Recommendations</option>
          <option value="me">From You ❤️</option>
          <option value="shaira">From Shaira ⭐</option>
        </select>

        <select
          value={filterListened}
          onChange={(e) => setFilterListened(e.target.value as 'all' | 'listened' | 'unlistened')}
          className="px-3 py-2 border border-pink-200 rounded-lg text-sm bg-white/60"
        >
          <option value="all">All Songs</option>
          <option value="listened">Listened ✓</option>
          <option value="unlistened">Not Listened Yet</option>
        </select>
      </div>

      {/* Songs List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : songs?.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            No songs yet
          </h4>
          <p className="text-gray-500">
            Start recommending songs to each other! 🎵
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {songs?.map((song) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card rounded-2xl p-4 transition-all ${
                song.is_listened ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <button
                      onClick={() =>
                        toggleListenedMutation.mutate({
                          id: song.id,
                          is_listened: !song.is_listened,
                        })
                      }
                      className="text-gray-400 hover:text-green-500 transition-colors"
                    >
                      {song.is_listened ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <h3 className="text-lg font-semibold text-gray-800">
                      {song.title}
                    </h3>

                    {song.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < song.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 ml-8">
                    {song.artist}
                    {song.album && <span className="text-gray-400"> • {song.album}</span>}
                  </p>

                  <div className="flex items-center gap-4 ml-8 mt-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        song.recommended_by === 'me'
                          ? 'bg-love-red/10 text-love-red'
                          : 'bg-purple-500/10 text-purple-500'
                      }`}
                    >
                      {song.recommended_by === 'me' ? 'From You ❤️' : 'From Shaira ⭐'} →{' '}
                      {song.recommended_to === 'me' ? 'You' : 'Shaira'}
                    </span>

                    {song.mood && (
                      <span className="text-xs text-gray-500">{song.mood_display}</span>
                    )}

                    {song.genre && (
                      <span className="text-xs text-gray-500">{song.genre}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {song.youtube_link && (
                    <a
                      href={song.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Listen on YouTube"
                    >
                      <Play className="w-4 h-4" />
                    </a>
                  )}

                  {song.spotify_link && (
                    <a
                      href={song.spotify_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title="Listen on Spotify"
                    >
                      <Music className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Show Note"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEdit(song)}
                    className="p-2 text-gray-400 hover:text-love-red transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteMutation.mutate(song.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Note */}
              <AnimatePresence>
                {expandedSong === song.id && song.note && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mt-3 p-3 bg-pink-50 rounded-xl">
                      <p className="text-sm text-gray-600 italic">"{song.note}"</p>
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
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-gray-800">
                  {editingSong ? 'Edit Song' : 'Recommend a Song'} 🎵
                </h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingSong) {
                    updateMutation.mutate({ id: editingSong.id, data: formData });
                  } else {
                    createMutation.mutate(formData);
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Song Title *
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Artist *
                    </label>
                    <input
                      type="text"
                      value={formData.artist}
                      onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Album (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.album}
                      onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                      className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From
                    </label>
                    <select
                      value={formData.recommended_by}
                      onChange={(e) =>
                        setFormData({ ...formData, recommended_by: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg"
                    >
                      <option value="me">Me ❤️</option>
                      <option value="shaira">Shaira ⭐</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <select
                      value={formData.recommended_to}
                      onChange={(e) =>
                        setFormData({ ...formData, recommended_to: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg"
                    >
                      <option value="shaira">Shaira 💕</option>
                      <option value="me">Me 💕</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg"
                      placeholder="Pop, Rock, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mood
                    </label>
                    <select
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg"
                    >
                      <option value="">Select mood...</option>
                      {moods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_link}
                    onChange={(e) =>
                      setFormData({ ...formData, youtube_link: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spotify Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.spotify_link}
                    onChange={(e) =>
                      setFormData({ ...formData, spotify_link: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                    placeholder="https://open.spotify.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why this song? (Optional)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red resize-none"
                    placeholder="This song reminds me of you because..."
                  />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_listened}
                      onChange={(e) =>
                        setFormData({ ...formData, is_listened: e.target.checked })
                      }
                      className="rounded text-love-red"
                    />
                    <span className="text-sm text-gray-700">Already listened</span>
                  </label>

                  {formData.is_listened && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Rating:</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: r })}
                            className={`p-1 rounded transition-colors ${
                              formData.rating >= r ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            <Star className="w-5 h-5 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full btn-romantic"
                >
                  {editingSong ? 'Update Song' : 'Add to Playlist'} 🎵
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistSection;