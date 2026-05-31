import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import type { BucketListStats as BucketListStatsType } from './bucketlistTypes';

interface BucketListStatsProps {
  stats: BucketListStatsType;
  theme: string | null;
}

const BucketListStats: React.FC<BucketListStatsProps> = ({ stats, theme }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
      >
        {[
          {
            icon: <Target className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-rose-500'}`} />,
            value: stats.total,
            label: 'Total Dreams',
            bg: theme === 'dark' 
              ? '!bg-gray-800 !border-gray-700 !text-slate-100 !bg-none' 
              : 'bg-white border-slate-200 text-slate-900',
          },
          {
            icon: <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />,
            value: stats.completed,
            label: 'Achieved',
            bg: theme === 'dark' 
              ? '!bg-gray-800 !border-gray-700 !text-slate-100 !bg-none' 
              : 'bg-white border-slate-200 text-slate-900',
          },
          {
            icon: <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />,
            value: stats.pending + stats.planned,
            label: 'In Progress',
            bg: theme === 'dark' 
              ? '!bg-gray-800 !border-gray-700 !text-slate-100 !bg-none' 
              : 'bg-white border-slate-200 text-slate-900',
          },
          {
            icon: <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />,
            value: `${stats.completion_rate}%`,
            label: 'Completion',
            bg: theme === 'dark' 
              ? '!bg-gray-800 !border-gray-700 !text-slate-100 !bg-none' 
              : 'bg-white border-slate-200 text-slate-900',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`relative rounded-4xl border p-6 text-center shadow-sm notebook-card ${card.bg}`}
          >
            {/* The decorative notebook line */}
            <div className={`absolute inset-x-6 top-5 h-1.5 rounded-full ${theme === 'dark' ? '!bg-gray-700' : 'bg-slate-200/80'}`} />
            
            <div className="relative pt-6">
              {card.icon}
              <p className={`text-3xl font-semibold ${theme === 'dark' ? '!text-white' : 'text-slate-900'}`}>{card.value}</p>
              <p className={`text-sm ${theme === 'dark' ? '!text-gray-400' : 'text-slate-500'}`}>{card.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className={`relative rounded-4xl border p-6 shadow-sm notebook-card ${
          theme === 'dark'
            ? '!bg-gray-800 !border-gray-700 !text-slate-100 !bg-none'
            : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* The decorative notebook line */}
          <div className={`absolute inset-x-6 top-5 h-1.5 rounded-full ${theme === 'dark' ? '!bg-gray-700' : 'bg-slate-200/80'}`} />
          
          <div className="relative pt-5">
            <p className={`text-sm mb-3 ${theme === 'dark' ? '!text-gray-400' : 'text-slate-500'}`}>Overall Progress</p>
            
            {/* Progress Bar Background */}
            <div className={`h-4 rounded-full overflow-hidden ${theme === 'dark' ? '!bg-gray-700' : 'bg-rose-100'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completion_rate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${theme === 'dark' ? 'bg-pink-500' : 'bg-[#ff6b8b]'}`}
              />
            </div>
            
            <p className={`text-xs mt-2 ${theme === 'dark' ? '!text-gray-400' : 'text-slate-500'}`}>
              {stats.completed} of {stats.total} dreams achieved ✨
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default BucketListStats;