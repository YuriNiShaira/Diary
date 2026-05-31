import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera } from 'lucide-react';

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

const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  isOpen,
  onClose,
  memory,
  onEdit,
}) => {
  if (!memory) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-5xl"
            style={{ perspective: "2500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Book Cover */}
            <div className="relative overflow-visible rounded-xl bg-[#2C292A] p-2 pb-3 pr-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] dark:bg-[#1A1819]">

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -right-4 -top-4 z-50 rounded-full bg-white p-2.5 text-gray-800 shadow-xl transition-all hover:scale-110 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Stacked Pages Behind Background */}
              <div className="absolute bottom-1 left-2 right-2 top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
              <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#F0ECE1]/50 bg-[#F0ECE1] dark:border-gray-700/50 dark:bg-gray-700" />

              {/* Book Pages Container */}
              <div className="light-book-page relative flex min-h-[500px] w-full overflow-hidden rounded bg-[#FDFBF7] dark:bg-[#FDFBF7] md:min-h-[600px]" style={{ perspective: "2500px" }}>

                {/* Center binding split */}
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent md:block z-20" />

                {/* Ribbon Bookmark */}
                <div className="absolute left-1/2 top-0 hidden h-32 w-8 -translate-x-1/2 bg-[#8C2332] shadow-md md:block z-10">
                  <div className="absolute bottom-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#FDFBF7]" />
                </div>

                <div className="flex w-full flex-col md:flex-row">
                  {/* LEFT PAGE (Visual Frame / Polaroid) */}
                  <div className="relative flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:p-12 bg-[#FDFBF7]">
                    {memory.image ? (
                      <div className="polaroid-bg relative group rotate-[-2deg] bg-white p-4 pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-0">
                        {/* Washi Tape Accents */}
                        <div
                          className="absolute -top-4 left-1/2 h-10 w-28 -translate-x-1/2 rotate-[2deg] bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm"
                          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)' }}
                        />
                        <div
                          className="absolute -bottom-2 left-1/3 h-8 w-20 -translate-x-1/2 -rotate-[2deg] bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm"
                          style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }}
                        />
                        <img
                          src={memory.image}
                          alt={memory.title}
                          className="h-[300px] w-[280px] object-cover shadow-inner md:h-[360px] md:w-[320px]"
                        />
                        {/* Caption */}
                        <div className="absolute bottom-4 left-0 right-0 text-center font-serif text-sm italic text-gray-700">
                          {memory.location || "Captured moment"}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-[360px] w-[320px] rotate-[-2deg] flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white">
                        <Camera className="mb-3 h-10 w-10 text-gray-400" />
                        <span className="font-serif text-sm italic text-gray-600">No photo</span>
                      </div>
                    )}
                  </div>

                  {/* RIGHT PAGE (Journal Lines & Typography) */}
                  <div className="relative flex w-full flex-col justify-start p-8 md:w-1/2 md:p-12 md:pl-16 bg-[#FDFBF7]">
                    {/* Notebook Rules */}
                    <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-[length:100%_32px]" />

                    <div className="relative flex h-full flex-col z-10">
                      {/* Date Header */}
                      <div className="mb-8 flex justify-end">
                        <div className="text-right font-serif">
                          <p className="text-lg text-gray-800">
                            {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })},
                          </p>
                          <p className="text-sm italic text-gray-500">
                            {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-6 pt-2">
                        {/* Title */}
                        <h2 className="font-serif text-3xl font-bold text-gray-800">
                          {memory.title}
                          {memory.is_favorite && (
                            <Heart className="ml-3 inline-block h-6 w-6 -translate-y-1 fill-[#8C2332] text-[#8C2332]" />
                          )}
                        </h2>

                        {/* Memory Type Badge */}
                        <span className="inline-block font-serif text-xs italic tracking-wide text-rose-700 bg-rose-50 px-3 py-1 rounded border border-rose-100">
                          {memory.memory_type.charAt(0).toUpperCase() + memory.memory_type.slice(1)}
                        </span>

                        {/* Description */}
                        <p className="min-h-[150px] font-serif text-lg leading-[32px] text-gray-700">
                          {memory.description}
                        </p>

                        {/* Favorite Quote */}
                        {memory.favorite_quote && (
                          <div className="border-l-4 border-rose-300 pl-4 py-2 bg-rose-50/50 rounded-r-lg">
                            <p className="font-serif text-sm italic text-gray-600">"{memory.favorite_quote}"</p>
                          </div>
                        )}

                        {/* Location */}
                        {memory.location && (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-gray-200 rounded-full">
                            <span className="text-xs text-gray-500">📍 {memory.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-8 flex justify-end gap-6">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(memory)} 
                            className="font-serif text-sm italic text-gray-500 transition-colors hover:text-gray-800 underline decoration-gray-300 underline-offset-4"
                          >
                            Edit Page
                          </button>
                        )}
                        <button 
                          onClick={onClose} 
                          className="font-serif text-sm italic text-rose-500 transition-colors hover:text-rose-700 underline decoration-rose-300 underline-offset-4"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
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