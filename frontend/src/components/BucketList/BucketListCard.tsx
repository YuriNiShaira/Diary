import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, CalendarDays, Check } from 'lucide-react';
import type { BucketListItem } from './bucketlistTypes';
import { categories } from './bucketlistConstants';

interface BucketListCardProps {
  item: BucketListItem;
  index: number;
  theme: string | null;
  onEdit: (item: BucketListItem) => void;
  onDelete: (item: BucketListItem) => void;
  onComplete: (item: BucketListItem) => void;
}

const BucketListCard: React.FC<BucketListCardProps> = ({
  item,
  index,
  theme,
  onEdit,
  onDelete,
  onComplete,
}) => {
  const category = categories.find((c) => c.value === item.category);
  const isCompleted = item.status === 'completed';
  const isDark = theme === 'dark';

  // Premium Stationery Palette
  const cardBg = isDark ? 'bg-[#1a050f]/80' : 'bg-[#FFFAF0]/90';
  const borderColor = isDark ? 'border-rose-900/60' : 'border-rose-200/60';
  const titleColor = isDark ? 'text-rose-100' : 'text-rose-950';
  const textColor = isDark ? 'text-rose-200/90' : 'text-rose-800/80';
  const mutedText = isDark ? 'text-rose-400/60' : 'text-rose-600/60';
  
  // Hand-taped look
  const tapeRotation = useMemo(() => (Math.random() * 6) - 3, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative rounded-sm border p-6 sm:p-8 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] ${
        isCompleted ? 'opacity-75 grayscale-[20%]' : 'hover:-translate-y-1'
      } ${cardBg} ${borderColor}`}
    >
      {/* Paper Grain Texture */}
      <style>{`
        .card-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E");
        }
      `}</style>
      <div className="absolute inset-0 opacity-[0.03] card-grain pointer-events-none mix-blend-multiply dark:mix-blend-overlay rounded-sm"></div>

      {/* Washi Tape at the top */}
      <div 
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 backdrop-blur-sm shadow-sm z-20 ${
          isDark ? 'bg-rose-900/40' : 'bg-rose-200/50'
        }`}
        style={{ 
          rotate: `${tapeRotation}deg`,
          borderRadius: '2px 8px 3px 6px' 
        }} 
      />

      {/* Category Tag (Top Left) */}
      <div className={`absolute left-5 top-5 inline-flex items-center gap-2 px-3 py-1 rounded-sm border shadow-sm ${
        isDark ? 'bg-[#2a0815] border-rose-900/50 text-rose-300' : 'bg-white border-rose-100 text-rose-600'
      }`}>
        <span className={`inline-flex h-1.5 w-1.5 rounded-full ${isDark ? 'bg-rose-400' : 'bg-rose-400'}`} />
        <span className="text-2.25 uppercase font-serif tracking-[0.2em] font-semibold pt-px">
          {category?.label}
        </span>
      </div>

      {/* Content Area */}
      <div className="pt-10 relative z-10">
        
        <div className="flex items-start gap-4">
          {/* Icon Container (Stamped Style) */}
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border ${
            isDark ? 'bg-[#110307]/50 border-rose-800 text-rose-300' : 'bg-rose-50/50 border-rose-200 text-rose-600'
          }`}>
            {category?.icon ? <category.icon className="w-5 h-5" /> : <Star className="w-5 h-5" />}
          </div>

          <div className="flex-1 pt-1">
            {/* Hand-written style title */}
            <h4 className={`text-3xl font-semibold font-handwriting tracking-wide ${
              isCompleted ? `line-through ${mutedText}` : titleColor
            }`}>
              {item.title}
            </h4>
            
            {/* Description */}
            {item.description && (
              <p className={`text-sm mt-3 leading-relaxed font-serif italic ${textColor}`}>
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Metadata: Stars & Date */}
        <div className={`mt-6 flex flex-wrap items-center gap-4 pl-16 border-t pt-4 ${isDark ? 'border-rose-900/30' : 'border-rose-100'}`}>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${
                  i < item.priority 
                    ? (isDark ? 'text-amber-500/80 fill-amber-500/80' : 'text-amber-400 fill-amber-400') 
                    : (isDark ? 'text-rose-950' : 'text-rose-100')
                }`} 
              />
            ))}
          </div>

          {item.target_date && (
            <div className={`flex items-center gap-2 text-2.5 font-serif uppercase tracking-widest px-3 py-1 rounded-sm border ${
              isDark ? 'bg-[#110307] border-rose-900/50 text-rose-300' : 'bg-white border-rose-200/60 text-rose-600'
            }`}>
              <CalendarDays className="w-3 h-3" />
              {new Date(item.target_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* Completion Notes (Indented paper look) */}
        {isCompleted && item.completion_notes && (
          <div className="mt-5 pl-16">
            <div className={`relative p-4 rounded-sm border shadow-inner ${
              isDark 
                ? 'bg-[#110307]/80 border-rose-900/50 text-rose-200' 
                : 'bg-white/60 border-rose-200/50 text-rose-800'
            }`}>
              {/* Small "Achieved" watermark */}
              <div className="absolute top-2 right-2 text-2 uppercase tracking-[0.3em] font-serif font-bold opacity-30">
                Achieved
              </div>
              <p className="text-sm italic font-serif leading-relaxed pr-10">
                "{item.completion_notes}"
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 pl-16">
          {!isCompleted && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onComplete(item)}
              className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-2.5 font-serif uppercase tracking-widest font-bold transition-colors border shadow-sm ${
                isDark
                  ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800'
                  : 'bg-rose-900 border-rose-950 text-rose-50 hover:bg-rose-800'
              }`}
            >
              <Check className="w-3 h-3" />
              Complete
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onEdit(item)}
            className={`rounded-full px-5 py-2 text-2.5 font-serif uppercase tracking-widest font-bold transition-colors border ${
              isDark
                ? 'bg-transparent border-rose-800/60 text-rose-300 hover:bg-rose-900/40 hover:border-rose-700'
                : 'bg-transparent border-rose-200 text-rose-600 hover:bg-white hover:border-rose-300'
            }`}
          >
            Edit
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onDelete(item)}
            className={`rounded-full px-5 py-2 text-2.5 font-serif uppercase tracking-widest font-bold transition-colors border ${
              isDark
                ? 'bg-transparent border-rose-950 text-rose-500/70 hover:bg-rose-950/50 hover:text-rose-400 hover:border-rose-900'
                : 'bg-transparent border-rose-100 text-rose-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
            }`}
          >
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BucketListCard;