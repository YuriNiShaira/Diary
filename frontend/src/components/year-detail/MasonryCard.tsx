import React from 'react';
import { motion } from 'framer-motion';
import { Star, Image } from 'lucide-react';
import type { Memory } from './utils';
import { getMemoryTypeIcon, formatDate } from './utils';

interface MasonryCardProps {
  memory: Memory;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MasonryCard: React.FC<MasonryCardProps> = ({
  memory,
  index,
  onView,
  onEdit,
  onDelete,
}) => {
  const memoryIcon = getMemoryTypeIcon(memory.memory_type);
  const formattedDate = formatDate(memory.date);
  const heights = ['h-80', 'h-96', 'h-72', 'h-88', 'h-64', 'h-104'];
  const height = heights[index % heights.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid mb-6 cursor-pointer"
      onClick={onView}
    >
      <div className={`${height} bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group relative border border-white/50`}>
        {memory.image ? (
          <>
            <img src={memory.image} alt={memory.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100 flex flex-col items-center justify-center">
            <Image className="w-20 h-20 text-pink-300/60 mb-3" />
            <span className="text-sm text-pink-400/80">No photo yet</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <h3 className="text-white font-bold text-lg mb-1">{memory.title}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{memory.description}</p>
          <div className="flex gap-2 mt-3">
            <button className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs">Read more →</button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs">Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="px-3 py-1 bg-red-500/30 backdrop-blur rounded-full text-white text-xs">Delete</button>
          </div>
        </div>
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-rose-500 flex items-center gap-1">
            <span>{memoryIcon}</span>
          </span>
          {memory.is_favorite && (
            <span className="px-2 py-1 bg-amber-500/90 backdrop-blur rounded-full text-xs font-semibold text-white flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
            </span>
          )}
        </div>
        
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-1 bg-black/50 backdrop-blur rounded-full text-xs text-white">
            {formattedDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MasonryCard;