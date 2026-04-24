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
  LogOut,
  ListChecks,
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
import { useAuth } from '../contexts/AuthContext';
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
  const { user, logout } = useAuth();
  const [isCreateYearModalOpen, setIsCreateYearModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_years: 0,
    total_memories: 0,
    favorite_memories: 0,
    days_together: 0,
  });

  const { data: yearsData, isLoading } = useQuery({
    queryKey: ['years'],
    queryFn: async () => {
      const response = await api.get('/years/');
      console.log('Years API response:', response.data);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      // Logout locally even if API call fails
    }
    logout();
    toast.success('See you soon! 💕');
    navigate('/login');
  };

  const years = Array.isArray(yearsData) ? yearsData : [];

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      <RomanticBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative"
        >
          <div className="absolute right-0 top-0 flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/bucketlist')}
              className="btn-soft flex items-center gap-2"
            >
              <ListChecks className="w-4 h-4" />
              <span className="text-sm">Bucket List</span>
            </motion.button>

            {/* Invite Code Button (show if partner hasn't joined) */}
            {user?.partner_name === 'Waiting for partner...' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  toast.success('Share your invite code with your partner!', { duration: 5000 });
                }}
                className="btn-soft flex items-center gap-2 text-purple-600"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Invite Partner</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="btn-soft flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Leave</span>
            </motion.button>
          </div>

          <div className="text-center">
            {/* DYNAMIC NAME */}
            <h1 className="text-5xl md:text-6xl font-serif mb-4">
              <span className="text-gradient-love">
                {user?.couple_name || 'Welcome'}
              </span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block ml-3"
              >
                💕
              </motion.span>
            </h1>
            <p className="text-xl text-gray-600 font-light italic">
              Every moment with you is a beautiful memory
            </p>
          </div>
        </motion.div>

        {/* DYNAMIC ANNIVERSARY */}
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

        {/* Envelope Component */}
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
          <h2 className="text-4xl font-serif text-center mb-8">
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
                <h3 className="text-2xl font-serif text-gray-600 mb-3">
                  Start Your Love Story
                </h3>
                <p className="text-gray-500 mb-8 font-light">
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

          {/* Add Year Button */}
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

        {/* Footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 font-light italic text-sm">
            "Forever is composed of nows" — Emily Dickinson
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Heart className="w-3 h-3 text-love-red/30 fill-current" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Create Year Modal */}
      <CreateYearModal
        isOpen={isCreateYearModalOpen}
        onClose={() => setIsCreateYearModalOpen(false)}
      />

      <LoveLetterManager />
    </div>
  );
};

export default Dashboard;