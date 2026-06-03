import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Trash2, Image } from 'lucide-react';
import type { Memory } from './utils';
import { getMemoryTypeIcon, formatDate } from './utils';

interface ScatteredPolaroidCardProps {
  memory: Memory;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ScatteredPolaroidCard: React.FC<ScatteredPolaroidCardProps> = ({
  memory,
  index,
  onView,
  onEdit,
  onDelete,
}) => {
  const memoryIcon = getMemoryTypeIcon(memory.memory_type);
  const formattedDate = formatDate(memory.date);
  
  const rotation = useMemo(() => {
    const rotations = [-6, -4, -2, 0, 2, 4, 6];
    return rotations[Math.floor(Math.random() * rotations.length)];
  }, [index]);
  
  const yOffset = useMemo(() => (Math.random() - 0.5) * 20, [index]);
  const scale = useMemo(() => 0.95 + Math.random() * 0.1, [index]);
  const zIndex = useMemo(() => Math.floor(Math.random() * 10) + 10, [index]);

  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, rotate: rotation, scale: scale, y: yOffset }}
      whileHover={{ rotate: 0, scale: 1.05, y: -10, zIndex: 50, transition: { duration: 0.2, type: 'spring', stiffness: 300 } }}
      transition={{ delay: index * 0.03, duration: 0.5, type: 'spring', stiffness: 200 }}
      className="group relative cursor-pointer"
      style={{ transformOrigin: 'center center', zIndex }}
    >
      {/* CHANGED: */}
      <div className="polaroid-bg bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 p-3 pb-6" onClick={onView}>
        <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-linear-to-br from-pink-50 to-rose-50">
          {memory.image ? (
            <>
              <img src={memory.image} alt={memory.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-pink-100 to-rose-100">
              <Image className="w-16 h-16 text-pink-300/60 mb-2" />
              <span className="text-xs text-pink-400/80">No photo yet</span>
            </div>
          )}
          
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl border-2 border-white">
              {memoryIcon}
            </div>
          </div>
          
          {memory.is_favorite && (
            <div className="absolute top-2 right-2">
              <div className="relative">
                <div className="absolute inset-0 bg-rose-500 rounded-full blur-md opacity-50" />
                <div className="relative w-8 h-8 rounded-full bg-linear-to-r from-amber-400 to-rose-500 shadow-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-mono">
            📸 {formattedDate}
          </div>
        </div>
        
        <div className="text-center px-2">
          {/* CHANGED: */}
          <h3 className="polaroid-text font-handwriting text-xl text-gray-700 mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
            {memory.title}
          </h3>
          
          {memory.location && (
            /* CHANGED: */
            <div className="polaroid-subtext flex items-center justify-center gap-1 text-gray-400 text-xs mt-1">
              <MapPin className="w-3 h-3" /> 
              <span className="line-clamp-1">{memory.location}</span>
            </div>
          )}
          
          {/* CHANGED: */}
          <p className="polaroid-subtext text-gray-500 text-xs mt-2 line-clamp-2 italic px-2">
            {memory.description.length > 80 ? `${memory.description.substring(0, 80)}...` : memory.description}
          </p>
          
          {/* CHANGED: Added 'polaroid-subtext' to lock hover tooltip color */}
          <div className="polaroid-subtext mt-2 text-2.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
            click to read full story ✨
          </div>
        </div>
        
        {/* Buttons */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="bg-white/90 backdrop-blur rounded-full p-2 shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <svg className="w-4 h-4 text-gray-600 hover:text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="bg-white/90 backdrop-blur rounded-full p-2 shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </motion.button>
        </div>
        
        {/* Tape overlays */}
        {index % 3 === 0 && <div className="absolute -top-1 left-4 w-12 h-6 bg-amber-200/40 rotate-[-15deg] rounded-sm blur-[1px]" />}
        {index % 5 === 0 && <div className="absolute -bottom-1 right-4 w-10 h-5 bg-amber-200/40 rotate-10 rounded-sm blur-[1px]" />}
      </div>
    </motion.div>
  );
};

export default ScatteredPolaroidCard;