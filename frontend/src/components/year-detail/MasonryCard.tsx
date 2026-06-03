import React from 'react';
import { motion } from 'framer-motion';
import { Star, Image as ImageIcon, Edit2, Trash, Maximize2 } from 'lucide-react';
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
  
  // Heights for the masonry stagger effect
  const heights = ['h-80', 'h-96', 'h-72', 'h-88', 'h-64', 'h-104'];
  const height = heights[index % heights.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="break-inside-avoid mb-6 cursor-pointer group"
      onClick={onView}
    >
      <div className={`${height} bg-[#fdfbf7] dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 p-3 pb-4 rounded-sm shadow-sm hover:shadow-md transition-all relative border flex flex-col`}>
        
        {/* Top Badges (Memory Type & Date) */}
        <div className="absolute top-5 left-5 right-5 flex justify-between z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-sm text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm flex items-center gap-1">
            {memoryIcon} <span className="capitalize">{memory.memory_type}</span>
          </span>
          {memory.is_favorite && (
            <span className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-sm shadow-sm flex items-center justify-center">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </span>
          )}
        </div>

        {/* Media Section */}
        {memory.image ? (
          <div className="w-full flex-1 overflow-hidden rounded-sm relative border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
            <img 
              src={memory.image} 
              alt={memory.title} 
              className="w-full h-full object-cover filter contrast-[1.02] group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
        ) : (
          <div className="w-full flex-1 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center rounded-sm bg-gray-50 dark:bg-[#222]">
            <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
            <p className="font-serif italic text-sm text-gray-500 dark:text-gray-400">No photo</p>
          </div>
        )}
        
        {/* Card Footer (Title & Actions) */}
        <div className="mt-4 px-1 flex flex-col justify-between shrink-0">
          <div>
            <p className="text-2.25 font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{formattedDate}</p>
            <h3 className="font-serif text-lg leading-tight line-clamp-1 text-gray-800 dark:text-gray-200">{memory.title}</h3>
          </div>

          {/* Minimalist Action Buttons (Appear on hover) */}
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex items-center gap-1 text-2.5 uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
              <Maximize2 className="w-3 h-3" /> View
            </button>
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex items-center gap-1 text-2.5 uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              <Edit2 className="w-3 h-3" /> Edit
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex items-center gap-1 text-2.5 uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors ml-auto">
              <Trash className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MasonryCard;