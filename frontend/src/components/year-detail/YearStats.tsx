import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, CalendarDays, Camera } from 'lucide-react';

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
  // Vibrant stationery colors using native Tailwind dark classes
  const stats = [
    { 
      label: 'Photos Snapped', 
      value: totalMemories, 
      icon: Camera, 
      paperColor: 'bg-[#fff0f3] dark:bg-[#3b2a2f]', // Soft Rose
      pinRotate: 'rotate-3',
      cardRotate: '-rotate-2'
    },
    { 
      label: 'Core Memories', 
      value: favoriteCount, 
      icon: Heart, 
      paperColor: 'bg-[#fff9e6] dark:bg-[#3b3323]', // Soft Amber
      pinRotate: '-rotate-6',
      cardRotate: 'rotate-1'
    },
    { 
      label: 'Places Visited', 
      value: uniqueLocations, 
      icon: MapPin, 
      paperColor: 'bg-[#e6fbf9] dark:bg-[#233535]', // Soft Teal
      pinRotate: 'rotate-12',
      cardRotate: '-rotate-1'
    },
    { 
      label: 'Months Logged', 
      value: monthsWithMemories, 
      icon: CalendarDays, 
      paperColor: 'bg-[#f0f2ff] dark:bg-[#2a2c3b]', // Soft Indigo
      pinRotate: '-rotate-3',
      cardRotate: 'rotate-2'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16 px-4"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 120 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            className={`relative flex flex-col items-center p-6 pt-8 rounded-sm shadow-[2px_6px_15px_rgba(0,0,0,0.08)] dark:shadow-[2px_6px_15px_rgba(0,0,0,0.4)] border border-black/5 dark:border-white/5 transform ${stat.cardRotate} ${stat.paperColor} transition-transform duration-300 cursor-default`}
          >
            {/* The Gold Thumbtack */}
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-linear-to-br from-yellow-200 via-yellow-500 to-yellow-700 shadow-md border border-yellow-600 flex items-center justify-center transform ${stat.pinRotate} z-20`}>
              {/* Highlight on the pin */}
              <div className="w-1.5 h-1.5 bg-white/60 rounded-full absolute top-1 left-1" />
            </div>

            {/* Inner Polaroid-style frame */}
            <div className={`w-full flex-1 flex flex-col items-center justify-center p-4 bg-white/60 dark:bg-black/20 border border-white/40 dark:border-black/40 rounded-sm mb-4 backdrop-blur-sm shadow-inner`}>
              <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300 mb-2 opacity-80" />
              <div className="text-5xl font-serif font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </div>
            </div>
            
            {/* Handwritten Label */}
            <div className="font-handwriting text-2xl text-gray-700 dark:text-gray-300 text-center leading-tight">
              {stat.label}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default YearStats;