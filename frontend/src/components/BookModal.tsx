import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';

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
  isOpen, onClose, date, memories, allMemories, onNavigate, onDateChange
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevDateRef = useRef(date);

  // Reset page when date changes
  useEffect(() => {
    if (prevDateRef.current !== date) {
      setCurrentPage(0);
      setIsFlipping(false); 
      prevDateRef.current = date;
    }
  }, [date]);

  const currentMemory = memories[currentPage];
  const totalPages = memories.length;

  const datesWithMemories = Object.keys(allMemories).sort();
  const currentDateIndex = datesWithMemories.indexOf(date);
  const hasNextDate = currentDateIndex < datesWithMemories.length - 1;
  const hasPrevDate = currentDateIndex > 0;

  // Determine if we can actually load the next/prev date (data might not be loaded yet)
  const nextDateAvailable = hasNextDate && allMemories[datesWithMemories[currentDateIndex + 1]] !== undefined;
  const prevDateAvailable = hasPrevDate && allMemories[datesWithMemories[currentDateIndex - 1]] !== undefined;

  const canGoNext = currentPage < totalPages - 1 || nextDateAvailable;
  const canGoPrev = currentPage > 0 || prevDateAvailable;

  const flipPage = (dir: number) => {
    if (isFlipping) return;
    setDirection(dir);
    setIsFlipping(true);

    if (dir === 1) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
      } else if (nextDateAvailable) {
        const nextDate = datesWithMemories[currentDateIndex + 1];
        onDateChange(nextDate);
        // currentPage will be reset to 0 by useEffect
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      } else if (prevDateAvailable) {
        const prevDate = datesWithMemories[currentDateIndex - 1];
        onDateChange(prevDate);
        // currentPage will be reset to memories.length - 1 by useEffect? No, we need to set it manually
        // We'll let the date change trigger the reset to 0, but we want to start at last page.
        // So we'll handle it in the onDateChange of the parent? Actually we can use a ref.
      }
    }
    setTimeout(() => setIsFlipping(false), 600);
  };

  // When we go to a previous date, we want to land on its last memory
  useEffect(() => {
    if (prevDateRef.current !== date && direction === -1 && memories.length > 0) {
      // We are on a new date navigated backwards, set page to last memory
      setCurrentPage(memories.length - 1);
    }
  }, [memories.length, date, direction]);

  if (!currentMemory) {
    // Show a mini loading state instead of disappearing
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
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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

              {/* Side Date Navigation */}
              <div className="absolute -left-14 top-1/2 -translate-y-1/2 z-50 hidden md:block">
                <button
                  onClick={() => {
                    if (!prevDateAvailable) return;
                    setDirection(-1);
                    onDateChange(datesWithMemories[currentDateIndex - 1]);
                  }}
                  disabled={!prevDateAvailable || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-l-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold rotate-180">Prev Day</span>
                </button>
              </div>

              <div className="absolute -right-14 top-1/2 -translate-y-1/2 z-50 hidden md:block">
                <button
                  onClick={() => {
                    if (!nextDateAvailable) return;
                    setDirection(1);
                    onDateChange(datesWithMemories[currentDateIndex + 1]);
                  }}
                  disabled={!nextDateAvailable || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-r-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold">Next Day</span>
                </button>
              </div>

              {/* Stacked Pages */}
              <div className="absolute bottom-1 left-2 right-2 top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
              <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#F0ECE1]/50 bg-[#F0ECE1] dark:border-gray-700/50 dark:bg-gray-700" />

              {/* --- BOOK PAGES --- */}
              <div className="relative flex min-h-[500px] w-full overflow-hidden rounded bg-[#FDFBF7] dark:bg-[#232323] md:min-h-[600px]" style={{ perspective: "2500px" }}>

                {/* Center binding */}
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent dark:via-[rgba(0,0,0,0.5)] md:block z-20" />

                {/* Bookmark */}
                <div className="absolute left-1/2 top-0 hidden h-32 w-8 -translate-x-1/2 bg-[#8C2332] shadow-md dark:bg-rose-900 md:block z-10">
                  <div className="absolute bottom-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#FDFBF7] dark:border-b-[#232323]" />
                </div>

                {/* PAGE FLIP CONTAINER */}
                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`${date}-${currentPage}`}
                    custom={direction}
                    className="flex w-full flex-col md:flex-row absolute inset-0"
                    style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
                    initial={{
                      rotateY: direction > 0 ? 90 : -90,
                      z: 150,
                      scale: 0.98,
                      opacity: 0,
                    }}
                    animate={{
                      rotateY: 0,
                      z: 0,
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      rotateY: direction > 0 ? -90 : 90,
                      z: 150,
                      scale: 0.98,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.6,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    {/* Dynamic flip shadow */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-30"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        background: direction > 0
                          ? 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)'
                          : 'linear-gradient(to left, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)',
                      }}
                    />

                    {/* LEFT PAGE */}
                    <div className="relative flex w-full flex-col items-center justify-center p-8 md:w-1/2 md:p-12 bg-[#FDFBF7] dark:bg-[#232323]">
                      {currentMemory.image ? (
                        <div className="relative group rotate-[-2deg] bg-white p-4 pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-0 dark:bg-[#1A1A1A]">
                          <div
                            className="absolute -top-4 left-1/2 h-10 w-28 -translate-x-1/2 rotate-[2deg] bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)' }}
                          />
                          <div
                            className="absolute -bottom-2 left-1/3 h-8 w-20 -translate-x-1/2 -rotate-[2deg] bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }}
                          />
                          <img
                            src={currentMemory.image}
                            alt={currentMemory.title}
                            className="h-[300px] w-[280px] object-cover shadow-inner md:h-[360px] md:w-[320px]"
                          />
                          <div className="absolute bottom-4 left-0 right-0 text-center font-serif text-sm italic text-gray-500 dark:text-gray-400">
                            {currentMemory.location || "Captured moment"}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-[360px] w-[320px] rotate-[-2deg] flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-[#1C1C1C]">
                          <Camera className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                          <span className="font-serif text-sm italic text-gray-400">No photo</span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT PAGE */}
                    <div className="relative flex w-full flex-col justify-start p-8 md:w-1/2 md:p-12 md:pl-16 bg-[#FDFBF7] dark:bg-[#232323]">
                      <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-[length:100%_32px] dark:bg-[linear-gradient(transparent_31px,rgba(255,255,255,0.05)_32px)]" />

                      <div className="relative flex h-full flex-col z-10">
                        <div className="mb-8 flex justify-end">
                          <div className="text-right font-serif">
                            <p className="text-lg text-gray-800 dark:text-gray-200">
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })},
                            </p>
                            <p className="text-sm italic text-gray-500 dark:text-gray-400">
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex-1 space-y-6 pt-2">
                          <h2 className="font-serif text-3xl font-bold text-gray-800 dark:text-gray-100">
                            {currentMemory.title}
                            {currentMemory.is_favorite && (
                              <Heart className="ml-3 inline-block h-6 w-6 -translate-y-1 fill-[#8C2332] text-[#8C2332]" />
                            )}
                          </h2>

                          <span className="font-serif text-xs italic tracking-wide text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded border border-rose-100 dark:border-rose-900/50">
                            {currentMemory.memory_type.charAt(0).toUpperCase() + currentMemory.memory_type.slice(1)}
                          </span>

                          <p className="min-h-[150px] font-serif text-lg leading-[32px] text-gray-700 dark:text-gray-300">
                            {currentMemory.description}
                          </p>
                        </div>

                        <div className="mt-8 flex justify-center pb-4">
                          <button
                            onClick={() => { onClose(); onNavigate(currentMemory.year_id); }}
                            className="font-serif text-sm italic text-gray-400 transition-colors hover:text-gray-800 dark:hover:text-gray-200 underline decoration-gray-300 underline-offset-4"
                          >
                            Flip back to {currentMemory.year} chapter...
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Page Controls */}
                <button
                  onClick={() => flipPage(-1)}
                  disabled={!canGoPrev || isFlipping}
                  className="absolute bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-all hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed dark:bg-gray-700/90 dark:text-gray-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 font-serif text-xs italic text-gray-400 select-none">
                  {currentPage + 1} / {totalPages}
                </div>

                <button
                  onClick={() => flipPage(1)}
                  disabled={!canGoNext || isFlipping}
                  className="absolute bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-all hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed dark:bg-gray-700/90 dark:text-gray-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookModal;