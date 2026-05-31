import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface YearHeaderProps {
  year: number;
  description?: string;
  onDeleteYear: () => void;
}

const YearHeader: React.FC<YearHeaderProps> = ({ year, description, onDeleteYear }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDateRange = () => {
    if (!user?.anniversary_date) return null;
    const anniversary = new Date(user.anniversary_date);
    if (isNaN(anniversary.getTime())) return null;
    
    if (year === 0) {
      const end = new Date(anniversary);
      end.setDate(end.getDate() - 1);
      return { start: null, end };
    }
    const start = new Date(anniversary);
    start.setFullYear(start.getFullYear() + (year - 1));
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return { start, end };
  };

  const dateRange = getDateRange();
  const isPrequel = year === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-12 relative"
    >
      <div className="flex items-center justify-between mb-8 px-2 relative z-20">
        <motion.button
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm border transition-all font-medium bg-white/80 border-rose-100 text-gray-700 hover:bg-white hover:shadow-md dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 text-rose-500" />
          <span className="hidden sm:inline font-serif">Close Journal</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDeleteYear}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md shadow-sm border transition-all font-medium group bg-red-50/80 border-red-100 text-red-600 hover:bg-red-100 hover:shadow-md dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/50"
          title="Delete this year"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline font-serif">Burn Pages</span>
        </motion.button>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] p-10 md:p-16 text-center shadow-2xl border bg-[#fffaf6] border-white dark:bg-[#1e1a1b] dark:border-gray-800">
        
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />

        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-6 right-16 text-amber-400/60"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>

        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-rose-300 dark:border-rose-800 rounded-tl-xl" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-rose-300 dark:border-rose-800 rounded-tr-xl" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-rose-300 dark:border-rose-800 rounded-bl-xl" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-rose-300 dark:border-rose-800 rounded-br-xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className="inline-block mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-1 shadow-lg mx-auto">
              <div className="w-full h-full rounded-full border-2 border-dashed border-white/50 flex items-center justify-center bg-amber-500/20 backdrop-blur-sm">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </motion.div>
          
          <p className="font-handwriting text-3xl md:text-4xl text-rose-500 dark:text-rose-400 mb-2 transform -rotate-2">
            {isPrequel ? 'Where it all began...' : 'The beautiful memories of'}
          </p>
          
          <h1 className="text-7xl md:text-[8rem] font-serif font-black tracking-tighter leading-none mb-6">
            <span className="bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-700 bg-clip-text text-transparent drop-shadow-sm" 
              style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
              {isPrequel ? 'Prequel' : year}
            </span>
          </h1>

          {/* ✅ Fixed Date Range Badge */}
          {dateRange && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full mb-6"
            >
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {dateRange.start
                  ? `📅 ${dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : `📖 Before ${dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </span>
            </motion.div>
          )}

          {description && (
            <div className="max-w-2xl mx-auto flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-rose-300 dark:to-rose-800" />
              <p className="text-xl md:text-2xl font-serif text-gray-700 dark:text-gray-300 italic px-4">
                "{description}"
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-rose-300 dark:to-rose-800" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default YearHeader;