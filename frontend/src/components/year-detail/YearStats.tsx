import React from 'react';
import { motion } from 'framer-motion';

interface YearStatsProps {
  totalMemories: number;
  favoriteCount: number;
  uniqueLocations: number;
  monthsWithMemories: number;
}

const YearStats: React.FC<YearStatsProps> = ({
  totalMemories,
  favoriteCount,
  uniqueLocations,
  monthsWithMemories,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
        <div className="text-2xl font-bold text-rose-500">{totalMemories}</div>
        <div className="text-sm text-gray-600">Total Memories</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
        <div className="text-2xl font-bold text-amber-500">{favoriteCount}</div>
        <div className="text-sm text-gray-600">Favorite Moments</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
        <div className="text-2xl font-bold text-teal-500">{uniqueLocations}</div>
        <div className="text-sm text-gray-600">Places Visited</div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-sm border border-white/50">
        <div className="text-2xl font-bold text-indigo-500">{monthsWithMemories}</div>
        <div className="text-sm text-gray-600">Months with Memories</div>
      </div>
    </motion.div>
  );
};

export default YearStats;