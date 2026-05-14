import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { X, Heart, Camera, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CalendarMemory {
  id: number;
  title: string;
  description: string;
  image: string | null;
  memory_type: string;
  is_favorite: boolean;
  location: string;
  year_id: number;
  year: number;
}

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  memories: CalendarMemory[];
  allMemories: Record<string, CalendarMemory[]>;
  onNavigate: (yearId: number) => void;
  onDateChange: (date: string) => void;
}

const BookModal: React.FC<BookModalProps> = ({ 
  isOpen, 
  onClose, 
  date, 
  memories, 
  allMemories,
  onNavigate,
  onDateChange 
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const datesWithMemories = Object.keys(allMemories).sort();
  
  useEffect(() => {
    const index = datesWithMemories.indexOf(date);
    if (index !== -1) setCurrentDateIndex(index);
    setCurrentPage(0);
  }, [date, datesWithMemories]);

  const currentMemory = memories[currentPage];
  const totalPages = memories.length;
  const totalDates = datesWithMemories.length;

  const goToNextDate = () => {
    if (currentDateIndex < totalDates - 1) {
      setDirection(1);
      onDateChange(datesWithMemories[currentDateIndex + 1]);
    }
  };

  const goToPrevDate = () => {
    if (currentDateIndex > 0) {
      setDirection(-1);
      onDateChange(datesWithMemories[currentDateIndex - 1]);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage(prev => prev + 1);
    } else {
      goToNextDate();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(prev => prev - 1);
    } else {
      goToPrevDate();
    }
  };

  const pageVariants: Variants = {
    initial: (direction: number) => ({
      rotateY: direction > 0 ? 80 : -80,
      opacity: 0,
      transformOrigin: direction > 0 ? "left center" : "right center",
    }),
    animate: {
      rotateY: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? -80 : 80,
      opacity: 0,
      transformOrigin: direction > 0 ? "right center" : "left center",
      transition: { duration: 0.5, ease: "easeIn" }
    })
  };

  if (!currentMemory || memories.length === 0) return null;

  const hasNext = currentPage < totalPages - 1 || currentDateIndex < totalDates - 1;
  const hasPrev = currentPage > 0 || currentDateIndex > 0;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          style={{ perspective: "1200px" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Physical Book Border/Stiff Cover */}
            <div className="relative overflow-visible rounded-xl bg-[#2C292A] p-2 pb-3 pr-3 shadow-[0_50px_100px_rgba(0,0,0,0.6)] dark:bg-[#1A1819]">
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -right-3 -top-3 z-50 rounded-full bg-white p-2 text-gray-800 shadow-xl transition-all hover:scale-110 hover:bg-rose-50 dark:bg-gray-800 dark:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Sidebar Navigation: Previous Day */}
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
                <button
                  onClick={goToPrevDate}
                  disabled={currentDateIndex === 0}
                  className="group flex flex-col items-center gap-1 rounded-l-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-0"
                >
                  <ChevronsLeft className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold rotate-180">Prev Day</span>
                </button>
              </div>

              {/* Sidebar Navigation: Next Day */}
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
                <button
                  onClick={goToNextDate}
                  disabled={currentDateIndex === totalDates - 1}
                  className="group flex flex-col items-center gap-1 rounded-r-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-0"
                >
                  <ChevronsRight className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold">Next Day</span>
                </button>
              </div>

              {/* Stacked Pages Illusion */}
              <div className="absolute bottom-1 left-2 right-2 top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
              
              {/* Main Page Container */}
              <div className="relative flex min-h-[600px] w-full flex-col overflow-hidden rounded bg-[#FDFBF7] shadow-inner dark:bg-[#232323] md:flex-row">
                
                {/* Center Fold / Gutter */}
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent dark:via-[rgba(0,0,0,0.5)] md:block z-20" />
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(0,0,0,0.7)] md:block z-20" />

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={`${currentDateIndex}-${currentPage}`}
                    custom={direction}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex w-full flex-col md:flex-row"
                  >
                    {/* LEFT PAGE - Photo */}
                    <div className="relative flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:p-12">
                      {/* Page Back Button */}
                      {hasPrev && (
                        <button 
                          onClick={prevPage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-rose-500 transition-colors z-30"
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </button>
                      )}

                      {currentMemory.image ? (
                        <div className="relative -rotate-1 bg-white p-3 pb-10 shadow-lg dark:bg-[#1A1A1A]">
                          <img
                            src={currentMemory.image}
                            alt={currentMemory.title}
                            className="h-80 w-72 object-cover md:h-96 md:w-80"
                          />
                          <div className="absolute bottom-3 left-0 right-0 text-center font-serif text-xs italic text-gray-400">
                            {currentMemory.location || "A beautiful moment"}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-96 w-80 flex-col items-center justify-center border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-black/20">
                          <Camera className="h-8 w-8 text-gray-300" />
                          <p className="mt-2 text-sm text-gray-400">No photo</p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT PAGE - Story */}
                    <div className="relative flex w-full flex-col p-8 md:w-1/2 md:p-12 md:pl-16">
                      {/* Page Next Button */}
                      {hasNext && (
                        <button 
                          onClick={nextPage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-rose-500 transition-colors z-30"
                        >
                          <ChevronRight className="h-8 w-8" />
                        </button>
                      )}

                      {/* Notebook Lines */}
                      <div className="pointer-events-none absolute inset-0 bottom-12 top-32 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.04)_32px)] bg-[length:100%_32px] px-16 dark:bg-[linear-gradient(transparent_31px,rgba(255,255,255,0.03)_32px)]" />

                      <div className="relative z-10 flex h-full flex-col">
                        {/* Date Header */}
                        <div className="mb-10 text-right font-serif">
                          <p className="text-xl text-gray-800 dark:text-gray-100">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                          <p className="text-sm italic text-rose-600/70 dark:text-rose-400/70">
                            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-6">
                          <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                            {currentMemory.title}
                            {currentMemory.is_favorite && (
                              <Heart className="ml-2 inline h-5 w-5 fill-rose-600 text-rose-600" />
                            )}
                          </h2>
                          
                          <p className="font-serif text-lg leading-8 text-gray-700 dark:text-gray-300 italic">
                            {currentMemory.description}
                          </p>

                          {/* Location Badge */}
                          {currentMemory.location && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-full">
                              <span className="text-xs text-rose-600 dark:text-rose-400">
                                📍 {currentMemory.location}
                              </span>
                            </div>
                          )}

                          {/* Memory Type Badge */}
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {currentMemory.memory_type === 'milestone' && '💫 Milestone'}
                              {currentMemory.memory_type === 'date' && '💕 Date'}
                              {currentMemory.memory_type === 'travel' && '✈️ Travel'}
                              {currentMemory.memory_type === 'everyday' && '🌸 Everyday Magic'}
                              {currentMemory.memory_type === 'special' && '✨ Special Moment'}
                            </span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-6 text-center">
                          <button
                            onClick={() => { 
                              onClose(); 
                              onNavigate(currentMemory.year_id); 
                            }}
                            className="font-serif text-xs uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            Explore {currentMemory.year} Collection
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookModal;