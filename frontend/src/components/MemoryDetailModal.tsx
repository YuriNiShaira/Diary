import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  MapPin,
  Heart,
  Quote,
  Edit2,
} from 'lucide-react';

interface Memory {
  id: number;
  title: string;
  date: string;
  description: string;
  image?: string;
  location?: string;
  favorite_quote?: string;
  is_favorite: boolean;
  memory_type: string;
  year: number;
}

interface MemoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
  onEdit?: (memory: Memory) => void;
}

const getMemoryTypeLabel = (type: string) => {
  switch (type) {
    case 'milestone':
      return '💫 Milestone';
    case 'date':
      return '💕 Date';
    case 'travel':
      return '✈️ Travel';
    case 'everyday':
      return '🌸 Everyday';
    case 'special':
      return '✨ Special';
    default:
      return '💖 Memory';
  }
};

const getMemoryTypeAccent = (type: string) => {
  switch (type) {
    case 'milestone':
      return 'from-purple-400 to-pink-400';
    case 'date':
      return 'from-rose-400 to-pink-400';
    case 'travel':
      return 'from-sky-400 to-cyan-400';
    case 'everyday':
      return 'from-orange-300 to-pink-300';
    case 'special':
      return 'from-amber-300 to-rose-400';
    default:
      return 'from-pink-400 to-rose-400';
  }
};

const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  isOpen,
  onClose,
  memory,
  onEdit,
}) => {
  if (!memory) return null;

  const handleEdit = () => {
    onClose();
    if (onEdit) onEdit(memory);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[32px] border border-white/60 bg-white/85 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
          >
            {/* Top buttons */}
            <div className="absolute top-5 right-5 z-20 flex gap-2">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="bg-white/90 p-3 rounded-full shadow-md text-gray-500 hover:text-love-red transition"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-white/90 p-3 rounded-full shadow-md text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[92vh]">
              {/* IMAGE (FIXED HERE 🔥) */}
              <div className="relative">
                {memory.image ? (
                  <div className="relative h-[260px] sm:h-[340px] md:h-[420px] flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-100">
                    <img
                      src={memory.image}
                      alt={memory.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-200">
                    <Heart className="w-20 h-20 text-white/70" />
                  </div>
                )}

                {/* badges */}
                <div className="absolute left-5 bottom-5 flex gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm text-white bg-gradient-to-r ${getMemoryTypeAccent(
                      memory.memory_type
                    )}`}
                  >
                    {getMemoryTypeLabel(memory.memory_type)}
                  </span>

                  {memory.is_favorite && (
                    <span className="px-4 py-2 bg-white text-rose-500 rounded-full text-sm flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-current" />
                      Favorite
                    </span>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-6 md:p-10">
                {/* date + location */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm">
                    <Calendar className="w-4 h-4 text-pink-400" />
                    {new Date(memory.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  {memory.location && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full text-sm">
                      <MapPin className="w-4 h-4 text-pink-400" />
                      {memory.location}
                    </div>
                  )}
                </div>

                {/* title */}
                <h2 className="text-3xl md:text-5xl font-serif mb-6 break-words">
                  {memory.title}
                </h2>

                {/* description */}
                <div className="mb-6 p-6 bg-white/70 rounded-2xl border">
                  <p className="leading-8 whitespace-pre-line break-words">
                    {memory.description}
                  </p>
                </div>

                {/* quote */}
                {memory.favorite_quote && (
                  <div className="p-6 bg-pink-50 rounded-2xl border">
                    <div className="flex gap-3">
                      <Quote className="text-pink-400" />
                      <p className="italic">
                        “{memory.favorite_quote}”
                      </p>
                    </div>
                  </div>
                )}

                {/* actions */}
                <div className="mt-6 flex justify-end gap-3">
                  {onEdit && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 border rounded-full"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-love-red text-white rounded-full"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemoryDetailModal;