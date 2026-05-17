import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Calendar, Clock, Camera } from 'lucide-react';
import type { Memory } from './utils';
import { getMemoryTypeIcon, formatDate } from './utils';

interface TimelineMemoryProps {
  memory: Memory;
  index: number;
  isEven: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TimelineMemory: React.FC<TimelineMemoryProps> = ({
  memory,
  index,
  isEven,
  onView,
  onEdit,
  onDelete,
}) => {
  const memoryIcon = getMemoryTypeIcon(memory.memory_type);
  const formattedDate = formatDate(memory.date);
  const fullDate = new Date(memory.date);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -50 : 50, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative mb-16"
    >
      {/* Timeline connection line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-pink-300 via-rose-400 to-pink-300" />
      
      {/* Date marker circle */}
      <motion.div 
        className="absolute left-1/2 transform -translate-x-1/2 -top-3 z-20"
        whileHover={{ scale: 1.2 }}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-white border-4 border-rose-400 shadow-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-rose-500" />
          </div>
          <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
        </div>
      </motion.div>
      
      {/* Month indicator */}
      <div className={`absolute ${isEven ? 'right-[52%]' : 'left-[52%]'} top-0 whitespace-nowrap`}>
        <div className="inline-block px-4 py-2 bg-rose-100/90 backdrop-blur-sm rounded-full text-sm font-semibold text-rose-600 shadow-sm border border-rose-200">
          {fullDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-12`}>
        {/* Content side */}
        <div className={`${isEven ? 'md:order-1' : 'md:order-2'} pl-0 md:pl-0`}>
          <div className={`max-w-lg ${isEven ? 'md:ml-auto md:pr-8' : 'md:mr-auto md:pl-8'}`}>
            {/* Memory Type Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-rose-100 rounded-full mb-4">
              <span className="text-lg">{memoryIcon}</span>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                {memory.memory_type}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-3xl md:text-4xl font-serif text-gray-800 mb-3 group-hover:text-rose-600 transition-colors">
              {memory.title}
            </h3>
            
            {/* Date */}
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
              <Clock className="w-4 h-4" />
              <span>{formattedDate}</span>
              {memory.is_favorite && (
                <>
                  <span className="mx-2">•</span>
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-amber-600">Favorite Memory</span>
                </>
              )}
            </div>
            
            {/* Location */}
            {memory.location && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-white/50 rounded-lg inline-flex">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="text-gray-600 text-sm">{memory.location}</span>
              </div>
            )}
            
            {/* Description preview */}
            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
              {memory.description}
            </p>
            
            {/* Quote if exists */}
            {memory.favorite_quote && (
              <div className="border-l-4 border-rose-300 pl-4 py-2 mb-4 bg-rose-50/50 rounded-r-lg">
                <p className="text-gray-600 text-sm italic">"{memory.favorite_quote}"</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onView}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                Read Full Story
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="px-6 py-2.5 rounded-full bg-white/80 backdrop-blur text-gray-700 font-medium shadow-md hover:shadow-lg transition-all border border-pink-200"
              >
                Edit Memory
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="px-6 py-2.5 rounded-full bg-red-50 text-red-600 font-medium shadow-md hover:shadow-lg transition-all border border-red-200"
              >
                Delete
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Image side */}
        <div className={`${isEven ? 'md:order-2' : 'md:order-1'}`}>
          <motion.div
            whileHover={{ scale: 1.02, rotate: isEven ? 1 : -1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="relative rounded-2xl overflow-hidden shadow-xl group cursor-pointer min-h-[320px]"
            onClick={onView}
          >
            {memory.image ? (
              <>
                <img 
                  src={memory.image} 
                  alt={memory.title} 
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            ) : (
              <div className="w-full h-80 bg-gradient-to-br from-pink-100 to-rose-100 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Heart className="w-20 h-20 text-pink-300/60 mb-4" />
                </motion.div>
                <p className="text-rose-400/70 text-sm italic">A beautiful moment waiting to be captured 📸</p>
                <p className="text-gray-400 text-xs mt-2">Click to add a photo</p>
              </div>
            )}
            
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-white/60 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-white/60 rounded-br-2xl" />
            
            {/* Add photo overlay when no image */}
            {!memory.image && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur rounded-full p-3">
                  <Camera className="w-6 h-6 text-rose-500" />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineMemory;