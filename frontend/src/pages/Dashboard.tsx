import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Users,
  BookOpen,
  X,
  Copy,
  Check
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
  year_number: number; 
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
  const { theme } = useTheme();
  const [isCreateYearModalOpen, setIsCreateYearModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_years: 0,
    total_memories: 0,
    favorite_memories: 0,
    days_together: 0,
  });

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: yearsData, isLoading } = useQuery<Year[]>({
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
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Invite code copied! Share it with your partner 💕');

    // reset copied state after a moment
    window.setTimeout(() => setCopied(false), 2500);
  };

  const years = Array.isArray(yearsData) ? yearsData : [];

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Dancing Script', cursive; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
      `}} />

      <RomanticBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-6">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 relative">
          
          {/* Re-designed Invite Partner Button (Diary/Ticket Style) */}
          {user && !user.has_partner && (
            <div className="absolute right-0 top-0 hidden md:block">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInviteModal(true)}
                className={`px-5 py-2.5 rounded-lg border-2 border-dashed flex items-center gap-2 shadow-sm font-serif italic transition-colors ${
                  theme === 'dark' 
                    ? 'bg-[#2a2626] border-stone-700 text-rose-300 hover:border-rose-900' 
                    : 'bg-[#fcfbf7] border-rose-200 text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">Invite Partner</span>
              </motion.button>
            </div>
          )}

          <div className="text-center">
            {/* Updated Typography Layout */}
            <h1
              className={`flex flex-wrap items-end justify-center gap-4 mb-2 ${
                theme === 'dark' ? 'text-rose-50' : 'text-rose-950'
              }`}
            >
              {/* Changed Welcome to Cormorant Garamond */}
              <span className="text-4xl md:text-[3.25rem] font-cormorant italic mb-1 md:mb-2 tracking-widest">Welcome,</span>
              <span className="text-gradient-love font-script text-6xl md:text-7xl font-bold leading-none tracking-wide pr-2">
                {user?.display_name || 'Love'}
              </span>
            </h1>
            
            {/* Newly Styled Subtitle */}
            <p className={`text-lg md:text-xl font-serif italic tracking-wide mt-4 ${theme === 'dark' ? 'text-rose-200/80' : 'text-rose-800/70'}`}>
              Turn moments into memories. 
              <span className="block sm:inline sm:ml-2 font-handwriting text-2xl text-rose-500 dark:text-rose-400 opacity-90">
                One entry at a time.
              </span>
            </p>
            
            <div className="flex justify-center mt-6 mb-2">
              <div className="w-32 h-px bg-linear-to-r from-transparent via-rose-300 to-transparent opacity-60" />
            </div>
          </div>

          {/* Mobile Invite Button */}
          {user && !user.has_partner && (
            <div className="mt-6 flex justify-center md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInviteModal(true)}
                className={`px-5 py-2.5 rounded-lg border-2 border-dashed flex items-center gap-2 shadow-sm font-serif italic transition-colors ${
                  theme === 'dark' 
                    ? 'bg-[#2a2626] border-stone-700 text-rose-300' 
                    : 'bg-[#fcfbf7] border-rose-200 text-rose-600'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">Invite Partner</span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Time Counter */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="mb-12">
          <TimeCounter anniversaryDate={user?.anniversary_date || '2024-01-01'} />
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatsCard icon={<Calendar className="w-6 h-6" />} label="Days Together" value={stats.days_together} color="from-love-red to-romantic-red" />
          <StatsCard icon={<BookOpen className="w-6 h-6" />} label="Years of Love" value={stats.total_years} color="from-romantic-red to-deep-pink" />
          <StatsCard icon={<ImageIcon className="w-6 h-6" />} label="Precious Memories" value={stats.total_memories} color="from-cherry-blossom to-love-red" />
          <StatsCard icon={<Heart className="w-6 h-6" />} label="Favorite Moments" value={stats.favorite_memories} color="from-love-red to-cherry-blossom" />
        </motion.div>

        {/* Envelope */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
          <Envelope />
        </motion.div>

        {/* Years Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h2 className={`text-4xl font-serif text-center mb-8 tracking-wide ${theme === 'dark' ? 'text-rose-100' : 'text-rose-950'}`}>
            <span className="text-gradient-soft">Our Journey Through The Years</span>
            <motion.div initial={{ width: 0 }} animate={{ width: '120px' }} transition={{ delay: 0.5, duration: 1 }} className="h-px bg-linear-to-r from-transparent via-rose-300 to-transparent mx-auto mt-4" />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-3xl p-6 animate-pulse">
                  <div className="h-56 bg-rose-200/30 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-rose-200/30 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-rose-200/30 rounded w-3/4"></div>
                </div>
              ))
            ) : years.length > 0 ? (
              years.map((year: Year) => <YearCard key={year.id} year={year} onClick={() => navigate(`/year/${year.id}`)} />)
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Heart className="w-20 h-20 text-rose-300/50 mx-auto mb-6" />
                </motion.div>
                <h3 className={`text-2xl font-serif mb-3 ${theme === 'dark' ? 'text-rose-200' : 'text-rose-800'}`}>Start Your Love Story</h3>
                <p className={`mb-8 font-serif italic ${theme === 'dark' ? 'text-rose-300/70' : 'text-rose-700/60'}`}>Create your first year to begin capturing beautiful memories together</p>
                
                {/* Redesigned Empty State Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreateYearModalOpen(true)}
                  className={`relative overflow-hidden group px-8 py-3.5 rounded-full border shadow-md transition-all ${
                    theme === 'dark'
                      ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
                      : 'bg-rose-950 border-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_4px_15px_rgba(136,19,55,0.25)]'
                  }`}
                >
                  <div className="absolute inset-1 border border-dashed rounded-full opacity-30 pointer-events-none border-rose-200"></div>
                  <span className="relative z-10 flex items-center gap-2 font-serif uppercase tracking-widest text-2.75">
                    Pen the First Page <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                  </span>
                </motion.button>
              </motion.div>
            )}
          </div>

          {years.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-16 text-center flex justify-center">
              
              {/* Redesigned Add New Year Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateYearModalOpen(true)}
                className={`relative overflow-hidden group px-10 py-4 rounded-full border shadow-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-[#2a0815] border-rose-900/80 hover:bg-[#4c0519]/80 hover:border-rose-700 shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                    : 'bg-[#FFFAF0] border-rose-200 hover:bg-white hover:border-rose-300 shadow-[0_8px_20px_rgba(225,29,72,0.1)]'
                }`}
              >
                {/* Delicate inner dashed border */}
                <div className={`absolute inset-1.5 border border-dashed rounded-full opacity-50 pointer-events-none ${theme === 'dark' ? 'border-rose-900' : 'border-rose-200'}`}></div>
                
                <span className={`relative z-10 flex items-center gap-3 font-serif uppercase tracking-[0.2em] text-xs font-bold ${theme === 'dark' ? 'text-rose-200' : 'text-rose-800'}`}>
                  <Sparkles className={`w-4 h-4 transform group-hover:scale-110 transition-transform ${theme === 'dark' ? 'text-rose-400' : 'text-rose-400'}`} />
                  Begin a New Chapter
                  <Sparkles className={`w-4 h-4 transform group-hover:scale-110 transition-transform ${theme === 'dark' ? 'text-rose-400' : 'text-rose-400'}`} />
                </span>
              </motion.button>

            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-20 text-center pb-8">
          <p className={`font-serif italic text-sm ${theme === 'dark' ? 'text-rose-300/60' : 'text-rose-700/50'}`}>"Forever is composed of nows" — Emily Dickinson</p>
          <div className="flex justify-center gap-1 mt-3">
            {[...Array(3)].map((_, i) => (
              <motion.div key={i} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}>
                <Heart className="w-3 h-3 text-rose-400/40 fill-current" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <CreateYearModal isOpen={isCreateYearModalOpen} onClose={() => setIsCreateYearModalOpen(false)} />
      <LoveLetterManager />

      {/* Redesigned Invite Code Modal (Diary / Washi Tape style) */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, rotate: -2 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.95, y: 10, rotate: 2 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-sm rounded-xl p-8 shadow-2xl ${
                theme === 'dark' ? 'bg-[#262222] border border-stone-800' : 'bg-[#fffdfa] border border-stone-200'
              }`}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Washi Tape */}
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 opacity-90 backdrop-blur-md z-10 shadow-sm rotate-2 ${
                theme === 'dark' ? 'bg-stone-600/60' : 'bg-rose-200/70'
              }`} />
              
              <button 
                onClick={() => setShowInviteModal(false)} 
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  theme === 'dark' ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-400 hover:bg-stone-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mt-2 mb-6">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full border-2 border-dashed ${theme === 'dark' ? 'border-rose-900/50 bg-rose-900/20' : 'border-rose-200 bg-rose-50'}`}>
                    <Users className={`w-6 h-6 ${theme === 'dark' ? 'text-rose-300' : 'text-rose-500'}`} />
                  </div>
                </div>
                <h3 className={`text-4xl font-serif font-bold italic mb-2 ${theme === 'dark' ? 'text-rose-200' : 'text-rose-600'}`}>
                  Invitation
                </h3>
                <p className={`font-serif text-sm px-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                  Share this secret code with your partner so they can join your diary.
                </p>
              </div>

              {/* Code Display Area */}
              <div 
                onClick={copyInviteCode}
                className={`cursor-pointer group relative p-6 rounded-lg border-2 border-dashed text-center transition-all ${
                  theme === 'dark' 
                    ? 'border-stone-700 bg-stone-800/50 hover:border-rose-500/50 hover:bg-stone-800' 
                    : 'border-stone-300 bg-stone-50 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
                title="Click to copy"
              >
                <span className={`font-mono text-3xl tracking-[0.25em] font-bold ${theme === 'dark' ? 'text-stone-200' : 'text-stone-700'}`}>
                  {inviteCode || '...'}
                </span>
                
                {/* Tooltip badge */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-2.5 font-bold uppercase tracking-wider transition-all duration-300 ${
                  copied 
                    ? 'opacity-100 bg-emerald-500 text-white shadow-md transform -translate-y-1' 
                    : 'opacity-0 group-hover:opacity-100 bg-stone-200 text-stone-600 transform translate-y-0'
                }`}>
                  {copied ? 'Copied!' : 'Click to copy'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowInviteModal(false)} 
                  className={`flex-1 py-3 rounded-lg font-serif font-bold transition-colors ${
                    theme === 'dark' ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Close
                </button>
                <button 
                  onClick={copyInviteCode} 
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-serif font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;