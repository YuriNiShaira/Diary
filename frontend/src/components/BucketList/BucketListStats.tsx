import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { BucketListStats as BucketListStatsType } from './bucketlistTypes';

interface BucketListStatsProps {
  stats: BucketListStatsType;
  theme: string | null;
}

const BucketListStats: React.FC<BucketListStatsProps> = ({ stats, theme }) => {
  const isDark = theme === 'dark';

  // Premium Stationery Palette
  const cardBg = isDark ? 'bg-[#1a050f]/80' : 'bg-[#FFFAF0]/90';
  const outerBorder = isDark ? 'border-rose-900/60' : 'border-rose-200/60';
  const innerBorder = isDark ? 'border-rose-900/40' : 'border-rose-200/50';
  const textColor = isDark ? 'text-rose-100' : 'text-rose-950';
  const subTextColor = isDark ? 'text-rose-300/80' : 'text-rose-800/70';

  return (
    <>
      {/* Paper Grain Texture */}
      <style>{`
        .stats-paper-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E");
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8"
      >
        {[
          {
            icon: <Target className={`w-5 h-5 mx-auto mb-3 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />,
            value: stats.total,
            label: 'Total Dreams',
          },
          {
            icon: <CheckCircle className={`w-5 h-5 mx-auto mb-3 ${isDark ? 'text-emerald-500/80' : 'text-emerald-600/80'}`} />,
            value: stats.completed,
            label: 'Achieved',
          },
          {
            icon: <Clock className={`w-5 h-5 mx-auto mb-3 ${isDark ? 'text-amber-500/80' : 'text-amber-600/80'}`} />,
            value: stats.pending + stats.planned,
            label: 'In Progress',
          },
          {
            icon: <TrendingUp className={`w-5 h-5 mx-auto mb-3 ${isDark ? 'text-rose-300/80' : 'text-rose-400'}`} />,
            value: `${stats.completion_rate}%`,
            label: 'Completion',
          },
        ].map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`relative rounded-sm border p-6 text-center shadow-[0_8px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all ${cardBg} ${outerBorder}`}
          >
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] stats-paper-grain pointer-events-none mix-blend-multiply dark:mix-blend-overlay rounded-sm" />
            
            {/* Delicate Inner Dashed Border */}
            <div className={`absolute inset-1.5 border border-dashed rounded-sm pointer-events-none ${innerBorder}`} />
            
            <div className="relative z-10">
              {card.icon}
              <p className={`text-3xl sm:text-4xl font-serif tracking-tight mb-1 ${textColor}`}>
                {card.value}
              </p>
              <p className={`text-[10px] sm:text-xs font-serif uppercase tracking-[0.15em] ${subTextColor}`}>
                {card.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className={`relative rounded-sm border p-6 sm:p-8 shadow-sm ${cardBg} ${outerBorder}`}>
          {/* Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] stats-paper-grain pointer-events-none mix-blend-multiply dark:mix-blend-overlay rounded-sm" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <p className={`text-xs font-serif uppercase tracking-[0.2em] font-semibold ${textColor}`}>
                Journey Progress
              </p>
              <p className={`text-[11px] font-serif italic tracking-wide ${subTextColor}`}>
                {stats.completed} of {stats.total} dreams achieved ✨
              </p>
            </div>
            
            {/* Progress Bar Background */}
            <div className={`h-3 rounded-full overflow-hidden border shadow-inner ${isDark ? 'bg-[#2a0815] border-rose-900/80' : 'bg-rose-50 border-rose-200/50'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completion_rate}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                className={`h-full ${isDark ? 'bg-gradient-to-r from-rose-800 to-rose-400' : 'bg-gradient-to-r from-rose-300 to-rose-500'}`}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default BucketListStats;