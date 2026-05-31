import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
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
  const categoryColor = theme === 'dark' ? category?.darkColor : category?.color;
  
  // Force important colors so global typography overrides don't ruin contrast
  const titleColorClass = isCompleted 
    ? 'line-through !text-slate-400' 
    : (theme === 'dark' ? '!text-white' : 'text-slate-900');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative rounded-4xl border p-6 shadow-[0_24px_50px_rgba(255,112,157,0.14)] transition-all duration-300 notebook-card ${isCompleted ? 'opacity-80' : 'hover:-translate-y-1'} ${
        theme === 'dark'
          ? '!bg-gray-800 !border-gray-700 !text-slate-100 !bg-none' // !bg-none removes paper texture
          : 'bg-white border-rose-100 text-slate-900'
      }`}
    >
      <div className={`absolute inset-x-6 top-5 h-1.5 rounded-full ${theme === 'dark' ? '!bg-gray-700' : 'bg-rose-100'}`} />
      
      {/* Hide the notebook rings in dark mode so they don't look weird on the dark background */}
      <div className={`notebook-rings absolute left-0 top-20 h-0 w-0 ${theme === 'dark' ? 'hidden' : ''}`} />
      
      <div className={`absolute left-5 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] shadow-sm ${
        theme === 'dark' ? '!bg-gray-900/95 !text-gray-300' : 'bg-white/90 text-slate-500'
      }`}>
        <span className={`inline-flex h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-rose-400' : 'bg-pink-400'}`} />
        {category?.label}
      </div>

      <div className="p-6 pt-14 relative">
        {/* Hide notebook lines in dark mode */}
        <div className={`notebook-lines absolute inset-x-6 top-24 bottom-6 rounded-3xl opacity-60 ${theme === 'dark' ? 'hidden' : ''}`} />
        
        <div className="flex items-start gap-3 relative">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r ${categoryColor || 'from-gray-400 to-gray-500'}`}>
            {category?.icon && <category.icon className="w-5 h-5 text-white" />}
          </div>
          <div className="flex-1">
            <h4 className={`text-2xl font-semibold font-handwriting ${titleColorClass}`}>
              {item.title}
            </h4>
            {item.description && (
              <p className={`text-sm mt-3 leading-7 ${theme === 'dark' ? '!text-gray-300' : 'text-slate-600'}`}>
                {item.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm relative z-10">
          {Array.from({ length: item.priority }).map((_, i) => (
            <Star key={i} className="w-3 h-3 text-amber-500" />
          ))}
          {item.target_date && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${theme === 'dark' ? '!bg-gray-700 !text-gray-300' : 'bg-slate-100 text-slate-600'}`}>
              📅 {new Date(item.target_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {isCompleted && item.completion_notes && (
          <p className={`mt-4 text-xs italic ${theme === 'dark' ? '!text-gray-400' : 'text-slate-500'}`}>
            "{item.completion_notes}"
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 relative z-10">
          {!isCompleted && (
            <button
              onClick={() => onComplete(item)}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                theme === 'dark'
                  ? '!bg-emerald-500/20 !text-emerald-300 hover:!bg-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              }`}
            >
              Complete
            </button>
          )}
          <button
            onClick={() => onEdit(item)}
            className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
              theme === 'dark'
                ? '!bg-gray-700 !text-gray-100 hover:!bg-gray-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
              theme === 'dark'
                ? '!bg-rose-500/20 !text-rose-300 hover:!bg-rose-500/30'
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BucketListCard;