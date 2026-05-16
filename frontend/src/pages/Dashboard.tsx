import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Image as ImageIcon,
  Star,
  Sparkles,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import Envelope from '../components/Envelope';
import TimeCounter from '../components/TimeCounter';
import YearCard from '../components/YearCard';
import StatsCard from '../components/StatsCard';
import CreateYearModal from '../components/CreateYearModal';
import LoveLetterManager from '../components/LoveLetterManager';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Year {
  id: number;
  year: number;
  cover_image?: string;
  description?: string;
  memory_count?: number;
  created_at: string;
}

interface Stats {
  total_years: number;
  total_memories: number;
  favorite_memories: number;
  days_together: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme(); // ✅ Dark mode
  const [isCreateYearModalOpen, setIsCreateYearModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_years: 0,
    total_memories: 0,
    favorite_memories: 0,
    days_together: 0,
  });

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: yearsData, isLoading } = useQuery({
    queryKey: ['years'],
    queryFn: async () => {
      const response = await api.get('/years/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (user && !user.has_partner) {
      fetchInviteCode();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchInviteCode = async () => {
    try {
      const response = await api.get('/auth/invite-code/');
      setInviteCode(response.data.invite_code);
    } catch (error) {
      console.error('Error fetching invite code:', error);
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast.success('Invite code copied! Share it with your partner 💕');
    }
  };

  const years = Array.isArray(yearsData) ? yearsData : [];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-950' : ''
    }`}>
      <RomanticBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative"
        >
          {/* Invite Partner Button */}
          {user && !user.has_partner && (
            <div className="absolute right-0 top-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInviteModal(true)}
                className="btn-soft flex items-center gap-2 text-purple-600 border-purple-300"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Invite Partner</span>
              </motion.button>
            </div>
          )}

          <div className="text-center">
            {/* ✅ Dynamic name + dark mode */}
            <h1 className={`text-5xl md:text-6xl font-serif mb-4 ${
              theme === 'dark' ? 'text-purple-100' : 'text-gray-800'
            }`}>
              <span className="text-gradient-love">
                Welcome, {user?.display_name || 'Love'}
              </span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block ml-3"
              >
                💕
              </motion.span>
            </h1>
            <p className={`text-xl font-light italic ${
              theme === 'dark' ? 'text-purple-200' : 'text-gray-600'
            }`}>
              Turn moments into memories. One entry at a time
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '180px' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-0.5 bg-gradient-to-r from-transparent via-love-red to-transparent mx-auto mt-4"
            />
          </div>
        </motion.div>

        {/* Time Counter - ✅ Dynamic anniversary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <TimeCounter anniversaryDate={user?.anniversary_date || '2024-01-01'} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <StatsCard
            icon={<Calendar className="w-6 h-6" />}
            label="Days Together"
            value={stats.days_together}
            color="from-love-red to-romantic-red"
          />
          <StatsCard
            icon={<Star className="w-6 h-6" />}
            label="Years of Love"
            value={stats.total_years}
            color="from-romantic-red to-deep-pink"
          />
          <StatsCard
            icon={<ImageIcon className="w-6 h-6" />}
            label="Precious Memories"
            value={stats.total_memories}
            color="from-cherry-blossom to-love-red"
          />
          <StatsCard
            icon={<Heart className="w-6 h-6" />}
            label="Favorite Moments"
            value={stats.favorite_memories}
            color="from-love-red to-cherry-blossom"
          />
        </motion.div>

        {/* Envelope */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Envelope />
        </motion.div>

        {/* Years Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className={`text-4xl font-serif text-center mb-8 ${
            theme === 'dark' ? 'text-purple-100' : 'text-gray-800'
          }`}>
            <span className="text-gradient-soft">Our Journey Through The Years</span>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '120px' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-0.5 bg-gradient-to-r from-transparent via-love-red to-transparent mx-auto mt-2"
            />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-3xl p-6 animate-pulse">
                  <div className="h-56 bg-cherry-blossom/30 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-cherry-blossom/30 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-cherry-blossom/30 rounded w-3/4"></div>
                </div>
              ))
            ) : years.length > 0 ? (
              years.map((year: Year) => (
                <YearCard
                  key={year.id}
                  year={year}
                  onClick={() => navigate(`/year/${year.id}`)}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-16"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-20 h-20 text-cherry-blossom/50 mx-auto mb-6" />
                </motion.div>
                <h3 className={`text-2xl font-serif mb-3 ${
                  theme === 'dark' ? 'text-purple-200' : 'text-gray-600'
                }`}>
                  Start Your Love Story
                </h3>
                <p className={`mb-8 font-light ${
                  theme === 'dark' ? 'text-purple-300' : 'text-gray-500'
                }`}>
                  Create your first year to begin capturing beautiful memories together
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateYearModalOpen(true)}
                  className="btn-romantic"
                >
                  Create First Year ✨
                </motion.button>
              </motion.div>
            )}
          </div>

          {years.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-romantic"
                onClick={() => setIsCreateYearModalOpen(true)}
              >
                <span className="flex items-center gap-2">
                  Add New Year
                  <Sparkles className="w-4 h-4" />
                </span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className={`font-light italic text-sm ${
            theme === 'dark' ? 'text-purple-300' : 'text-gray-500'
          }`}>
            "Forever is composed of nows" — Emily Dickinson
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              >
                <Heart className="w-3 h-3 text-love-red/30 fill-current" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <CreateYearModal
        isOpen={isCreateYearModalOpen}
        onClose={() => setIsCreateYearModalOpen(false)}
      />

      <LoveLetterManager />

      {/* Invite Code Modal */}
      {showInviteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">💌</div>
            <h3 className="text-2xl font-serif text-gray-800 mb-2">Invite Your Partner</h3>
            <p className="text-gray-600 mb-6">
              Share this code with your partner so they can join your diary
            </p>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-dashed border-purple-300">
              <p className="text-4xl font-mono font-bold text-purple-600 tracking-[0.3em] select-all">
                {inviteCode || 'Loading...'}
              </p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyInviteCode}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold"
              >
                📋 Copy Code
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInviteModal(false)}
                className="flex-1 btn-soft py-3"
              >
                Close
              </motion.button>
            </div>
            
            <p className="text-xs text-gray-400 mt-4">
              Your partner can join at <strong>/join</strong> with this code
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;