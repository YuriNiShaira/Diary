import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera } from 'lucide-react';
import type { Memory } from './year-detail';

interface MemoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
  onEdit?: (memory: Memory) => void;
  onReturnToBook?: () => void;
}

const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  isOpen,
  onClose,
  memory,
  onEdit,
  onReturnToBook,
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute -right-3 -top-3 z-50 rounded-full bg-white p-2.5 text-gray-800 shadow-xl transition-all hover:scale-110 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-200 md:-right-4 md:-top-4"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            {/* Mobile View (Scrapbook / Journal Page) */}
            <div className="md:hidden relative w-full max-h-[85vh] overflow-hidden rounded-2xl bg-[#FDFBF7] shadow-2xl flex flex-col">
              {/* Subtle Journal Lines Background */}
              <div className="pointer-events-none absolute inset-0 top-32 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.04)_32px)] bg-[length:100%_32px] z-0" />

              <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-6">
                {/* Image Section - Styled as a taped Polaroid */}
                <div className="pt-8 px-6 pb-2 flex justify-center">
                  {memory.image ? (
                    <div className="relative bg-white p-3 pb-10 shadow-[0_8px_20px_rgba(0,0,0,0.12)] rotate-1 max-w-sm w-full transition-transform hover:rotate-0">
                      {/* Washi Tape */}
                      <div
                        className="absolute -top-3 left-1/2 h-8 w-24 -translate-x-1/2 -rotate-3 bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm z-10"
                        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.4) 5px, rgba(255,255,255,0.4) 10px)' }}
                      />
                      
                      <div className="relative h-64 w-full overflow-hidden rounded-sm">
                        <img
                          src={memory.image}
                          alt={memory.title}
                          className="h-full w-full object-cover"
                        />
                        {memory.is_favorite && (
                          <div className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-md backdrop-blur-sm">
                            <Heart className="h-4 w-4 fill-[#8C2332] text-[#8C2332]" />
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute bottom-3 left-0 right-0 text-center font-serif text-sm italic text-gray-600">
                        {memory.location || "Captured moment"}
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-white p-3 pb-10 shadow-[0_8px_20px_rgba(0,0,0,0.12)] -rotate-1 max-w-sm w-full">
                      <div className="absolute -top-3 left-1/2 h-8 w-24 -translate-x-1/2 rotate-2 bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm z-10" />
                      <div className="flex h-64 w-full flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50">
                        <Camera className="mb-3 h-8 w-8 text-gray-300" />
                        <span className="font-serif text-sm italic text-gray-400">No photo available</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="px-6 pt-6 pb-4">
                  {/* Header: Date & Type */}
                  <div className="mb-4 flex flex-col items-center text-center">
                    {memory.date && (
                      <div className="mb-3">
                        <p className="font-serif text-sm font-semibold text-gray-800">
                          {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                        <p className="font-serif text-xs italic text-gray-500">
                          {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    )}
                    <span className="inline-block rounded border border-rose-100 bg-rose-50 px-3 py-1 font-serif text-xs italic tracking-wide text-rose-700">
                      {memory.memory_type.charAt(0).toUpperCase() + memory.memory_type.slice(1)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-4 text-center font-serif text-2xl font-bold text-gray-800">
                    {memory.title}
                  </h2>

                  {/* Description */}
                  <p className="mb-6 font-serif text-base leading-relaxed text-gray-700 whitespace-pre-line text-justify">
                    {memory.description}
                  </p>

                  {/* Favorite Quote */}
                  {memory.favorite_quote && (
                    <div className="mb-6 rounded-r-lg border-l-4 border-rose-300 bg-rose-50/70 p-4">
                      <p className="font-serif text-sm italic text-gray-600 leading-relaxed">"{memory.favorite_quote}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="border-t border-gray-200/60 bg-[#FDFBF7]/95 p-4 backdrop-blur-md z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <div className="flex justify-around items-center gap-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(memory)}
                      className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 font-serif text-sm italic text-gray-700 transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                    >
                      Edit Page
                    </button>
                  )}
                  {onReturnToBook && (
                    <button
                      onClick={() => onReturnToBook()}
                      className="flex-1 rounded-lg bg-[#8C2332]/10 py-2.5 font-serif text-sm italic text-[#8C2332] transition-all hover:bg-[#8C2332]/20 active:scale-95 border border-[#8C2332]/20 shadow-sm"
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop View (Book Style) */}
            <div className="hidden md:block">
              <div className="relative overflow-visible rounded-xl bg-[#2C292A] p-2 pb-3 pr-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] dark:bg-[#1A1819]">
                {/* Stacked Pages */}
                <div className="absolute bottom-1 left-2 right-2 top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
                <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#F0ECE1]/50 bg-[#F0ECE1] dark:border-gray-700/50 dark:bg-gray-700" />

                {/* Book Pages Container */}
                <div className="light-book-page relative flex min-h-[500px] w-full overflow-hidden rounded bg-[#FDFBF7] dark:bg-[#FDFBF7] md:min-h-[600px]" style={{ perspective: "2500px" }}>
                  {/* Center binding */}
                  <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent md:block z-20" />

                  {/* Ribbon Bookmark */}
                  <div className="absolute left-1/2 top-0 hidden h-32 w-8 -translate-x-1/2 bg-[#8C2332] shadow-md md:block z-10">
                    <div className="absolute bottom-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#FDFBF7]" />
                  </div>

                  <div className="flex w-full flex-col md:flex-row h-full">
                    {/* LEFT PAGE (Polaroid) */}
                    <div className="relative flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:p-12 bg-[#FDFBF7]">
                      {memory.image ? (
                        <div className="polaroid-bg relative group -rotate-2 bg-white p-4 pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-0">
                          <div
                            className="absolute -top-4 left-1/2 h-10 w-28 -translate-x-1/2 rotate-2 bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)' }}
                          />
                          <div
                            className="absolute -bottom-2 left-1/3 h-8 w-20 -translate-x-1/2 -rotate-2 bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }}
                          />
                          <img
                            src={memory.image}
                            alt={memory.title}
                            className="h-[300px] w-[280px] object-cover shadow-inner md:h-[360px] md:w-[320px]"
                          />
                          <div className="absolute bottom-4 left-0 right-0 text-center font-serif text-sm italic text-gray-700">
                            {memory.location || "Captured moment"}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-[360px] w-[320px] -rotate-2 flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white">
                          <Camera className="mb-3 h-10 w-10 text-gray-400" />
                          <span className="font-serif text-sm italic text-gray-600">No photo</span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT PAGE (Scrollable) */}
                    <div className="relative flex w-full flex-col justify-start p-8 md:w-1/2 md:p-12 md:pl-16 bg-[#FDFBF7] overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-[length:100%_32px]" />

                      <div className="relative flex h-full flex-col z-10">
                        {/* Date Header - fixed */}
                        <div className="mb-6 flex justify-end shrink-0">
                          <div className="text-right font-serif">
                            {memory.date ? (
                              <>
                                <p className="text-lg text-gray-800">
                                  {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })},
                                </p>
                                <p className="text-sm italic text-gray-500">
                                  {new Date(memory.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm italic text-gray-500">A beautiful memory</p>
                            )}
                          </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                          <div className="space-y-6 pb-8 pt-2">
                            {/* Title */}
                            <h2 className="font-serif text-3xl font-bold text-gray-800">
                              {memory.title}
                              {memory.is_favorite && (
                                <Heart className="ml-3 inline-block h-6 w-6 -translate-y-1 fill-[#8C2332] text-[#8C2332]" />
                              )}
                            </h2>

                            {/* Memory Type Badge */}
                            <span className="inline-block rounded border border-rose-100 bg-rose-50 px-3 py-1 font-serif text-xs italic tracking-wide text-rose-700">
                              {memory.memory_type.charAt(0).toUpperCase() + memory.memory_type.slice(1)}
                            </span>

                            {/* Description */}
                            <p className="font-serif text-lg leading-8 text-gray-700 whitespace-pre-line">
                              {memory.description}
                            </p>

                            {/* Favorite Quote */}
                            {memory.favorite_quote && (
                              <div className="rounded-r-lg border-l-4 border-rose-300 bg-rose-50/50 py-2 pl-4">
                                <p className="font-serif text-sm italic text-gray-600">"{memory.favorite_quote}"</p>
                              </div>
                            )}

                            {/* Location */}
                            {memory.location && (
                              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/60 px-3 py-1.5">
                                <span className="text-xs text-gray-500">📍 {memory.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions - fixed at bottom */}
                        <div className="mt-4 flex justify-end gap-6 shrink-0">
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(memory)} 
                              className="font-serif text-sm italic text-gray-500 transition-colors hover:text-gray-800 underline decoration-gray-300 underline-offset-4"
                            >
                              Edit Page
                            </button>
                          )}
                          {onReturnToBook && (
                            <button
                              onClick={() => onReturnToBook()}
                              className="font-serif text-sm italic text-blue-600 transition-colors hover:text-blue-800 underline decoration-blue-200 underline-offset-4"
                            >
                              Return
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemoryDetailModal;