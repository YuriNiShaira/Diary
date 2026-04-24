import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart } from 'lucide-react';

interface YearCardProps {
  year: {
    id: number;
    year: number;
    cover_image?: string;
    description?: string;
    memory_count?: number;
  };
  onClick: () => void;
}

const YearCard: React.FC<YearCardProps> = ({ year, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="glass-card rounded-3xl overflow-hidden cursor-pointer group"
    >
      <div className="relative h-56 bg-gradient-to-br from-blush via-misty-rose to-cherry-blossom">
        {year.cover_image ? (
          <img
            src={year.cover_image}
            alt={`${year.year}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Calendar className="w-20 h-20 text-white/60" />
            </motion.div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Year Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-love-red font-bold shadow-lg">
            {year.year}
          </span>
        </div>
        
        <h2 className="absolute bottom-4 left-4 text-4xl font-serif font-bold text-white drop-shadow-lg">
          {year.year}
        </h2>
      </div>
      
      <div className="p-6">
        {year.description && (
          <p className="text-gray-700 mb-4 line-clamp-2 italic">
            "{year.description}"
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-love-red">
            <Heart className="w-5 h-5 fill-current animate-pulse" />
            <span className="font-medium">{year.memory_count || 0} memories</span>
          </div>
          <motion.span 
            whileHover={{ x: 5 }}
            className="text-love-red font-medium flex items-center gap-1"
          >
            Explore 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default YearCard;