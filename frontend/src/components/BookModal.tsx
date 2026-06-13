import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';

interface CalendarMemory {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string | null;
  memory_type: string;
  is_favorite: boolean;
  location: string;
  favorite_quote?: string;
  year_id: number;
  year: number;
}

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  memories: CalendarMemory[];
  allMemories: Record<string, CalendarMemory[]>;
  onNavigate: (yearId: number, memoryId?: number) => void;
  onDateChange: (date: string) => void;
}

const BookModal: React.FC<BookModalProps> = ({
  isOpen, onClose, date, memories, allMemories, onNavigate, onDateChange
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevDateRef = useRef(date);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevDateRef.current !== date) {
      setCurrentPage(0);
      setIsFlipping(false);
      prevDateRef.current = date;
      // Reset scroll position on date change
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [date]);

  const currentMemory = memories[currentPage];
  const totalPages = memories.length;

  const datesWithMemories = Object.keys(allMemories)
    .filter(d => allMemories[d] && allMemories[d].length > 0)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const currentDateIndex = datesWithMemories.indexOf(date);

  const hasNextDate = currentDateIndex !== -1 && currentDateIndex < datesWithMemories.length - 1;
  const hasPrevDate = currentDateIndex > 0;

  const canGoNext = currentPage < totalPages - 1 || hasNextDate;
  const canGoPrev = currentPage > 0 || hasPrevDate;

  const flipPage = useCallback((dir: number) => {
    if (isFlipping) return;
    setIsFlipping(true);
    setDirection(dir);

    if (dir === 1) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
      } else if (hasNextDate) {
        const nextDate = datesWithMemories[currentDateIndex + 1];
        onDateChange(nextDate);
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      } else if (hasPrevDate) {
        const prevDate = datesWithMemories[currentDateIndex - 1];
        onDateChange(prevDate);
      }
    }

    // Reset scroll position on page flip
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }, 300); // Wait for half the animation
    }

    setTimeout(() => setIsFlipping(false), 600);
  }, [isFlipping, currentPage, totalPages, hasNextDate, hasPrevDate, datesWithMemories, currentDateIndex, onDateChange]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isFlipping) return;
      if (e.key === 'ArrowRight' && canGoNext) flipPage(1);
      else if (e.key === 'ArrowLeft' && canGoPrev) flipPage(-1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipping, canGoNext, canGoPrev, flipPage, onClose]);

  useEffect(() => {
    if (prevDateRef.current !== date && direction === -1 && memories.length > 0) {
      setCurrentPage(memories.length - 1);
    }
  }, [memories.length, date, direction]);

  if (!currentMemory) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Inject custom scrollbar styling for the mobile portrait view */}
          <style dangerouslySetInnerHTML={{__html: `
            .journal-scroll::-webkit-scrollbar { width: 6px; }
            .journal-scroll::-webkit-scrollbar-track { background: transparent; }
            .journal-scroll::-webkit-scrollbar-thumb { background: rgba(140, 35, 50, 0.2); border-radius: 10px; }
            .journal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(140, 35, 50, 0.4); }
          `}} />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-5xl"
            style={{ perspective: "2500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Book Cover */}
            <div className="relative overflow-visible rounded-xl bg-[#2C292A] p-1.5 sm:p-2 pb-2 sm:pb-3 pr-2 sm:pr-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] dark:bg-[#1A1819]">

              <button onClick={onClose}
                className="absolute -right-3 -top-3 sm:-right-4 sm:-top-4 z-50 rounded-full bg-white p-2 sm:p-2.5 text-gray-800 shadow-xl transition-all hover:scale-110 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-200">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {/* Side Date Navigation (Desktop Only) */}
              <div className="absolute -left-14 top-1/2 -translate-y-1/2 z-50 hidden md:block">
                <button
                  onClick={() => { if (hasPrevDate) { setDirection(-1); onDateChange(datesWithMemories[currentDateIndex - 1]); } }}
                  disabled={!hasPrevDate || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-l-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronsLeft className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold rotate-180">Prev Day</span>
                </button>
              </div>

              <div className="absolute -right-14 top-1/2 -translate-y-1/2 z-50 hidden md:block">
                <button
                  onClick={() => { if (hasNextDate) { setDirection(1); onDateChange(datesWithMemories[currentDateIndex + 1]); } }}
                  disabled={!hasNextDate || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-r-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronsRight className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold">Next Day</span>
                </button>
              </div>

              <div className="absolute bottom-1 left-1.5 right-1.5 top-1.5 sm:bottom-2 sm:left-2 sm:right-2 sm:top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
              <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#F0ECE1]/50 bg-[#F0ECE1] dark:border-gray-700/50 dark:bg-gray-700 hidden md:block" />

              {/* Book Pages Container */}
              <div className="light-book-page relative flex h-[80vh] max-h-[750px] md:h-[650px] md:max-h-none w-full overflow-hidden rounded bg-[#FDFBF7] dark:bg-[#FDFBF7]" style={{ perspective: "2500px" }}>

                {/* Desktop Center Shadow */}
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent md:block z-20" />
                
                {/* Desktop Top Bookmark/Binding */}
                <div className="absolute left-1/2 top-0 hidden h-32 w-8 -translate-x-1/2 bg-[#8C2332] shadow-md md:block z-10">
                  <div className="absolute bottom-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#FDFBF7]" />
                </div>

                {/* Mobile Left Spine Shadow (Journal Vibe) */}
                <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-6 bg-gradient-to-r from-[rgba(0,0,0,0.1)] to-transparent md:hidden z-20" />

                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`${date}-${currentPage}`} custom={direction}
                    className="absolute inset-0 flex w-full flex-col md:flex-row h-full"
                    style={{ transformStyle: "preserve-3d", transformOrigin: "center left" }} // Flip from left on mobile to mimic notepad turning
                    initial={{ rotateY: direction > 0 ? 90 : -90, z: 150, scale: 0.98, opacity: 0 }}
                    animate={{ rotateY: 0, z: 0, scale: 1, opacity: 1 }}
                    exit={{ rotateY: direction > 0 ? -90 : 90, z: 150, scale: 0.98, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}>
                    
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-30 hidden md:block"
                      initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} exit={{ opacity: 0.6 }} transition={{ duration: 0.5 }}
                      style={{ background: direction > 0
                        ? 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)'
                        : 'linear-gradient(to left, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)' }} />

                    {/* Scrolling wrapper for mobile portrait view */}
                    <div 
                      ref={scrollContainerRef}
                      className="flex flex-col md:flex-row w-full h-full overflow-y-auto md:overflow-hidden journal-scroll pb-20 md:pb-0"
                    >
                      {/* LEFT PAGE (Image / Mobile Top) */}
                      <div className="relative flex shrink-0 w-full flex-col items-center justify-center p-6 pt-10 md:h-full md:w-1/2 md:p-12 bg-[#FDFBF7]">
                        
                        {/* Mobile Day Navigation Header */}
                        <div className="absolute top-4 left-0 right-0 flex justify-between px-6 md:hidden z-40">
                          <button
                            onClick={() => { if (hasPrevDate) { setDirection(-1); onDateChange(datesWithMemories[currentDateIndex - 1]); } }}
                            disabled={!hasPrevDate || isFlipping}
                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-rose-500 disabled:opacity-30">
                            <ChevronsLeft className="h-4 w-4" /> Prev Day
                          </button>
                          <button
                            onClick={() => { if (hasNextDate) { setDirection(1); onDateChange(datesWithMemories[currentDateIndex + 1]); } }}
                            disabled={!hasNextDate || isFlipping}
                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-rose-500 disabled:opacity-30">
                            Next Day <ChevronsRight className="h-4 w-4" />
                          </button>
                        </div>

                        {currentMemory.image ? (
                          <div className="polaroid-bg relative group -rotate-2 bg-white p-3 sm:p-4 pb-10 sm:pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-0 mt-4 md:mt-0">
                            <div className="absolute -top-3 sm:-top-4 left-1/2 h-8 sm:h-10 w-24 sm:w-28 -translate-x-1/2 rotate-2 bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm"
                              style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)' }} />
                            <div className="absolute -bottom-2 left-1/3 h-6 sm:h-8 w-16 sm:w-20 -translate-x-1/2 -rotate-2 bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm"
                              style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }} />
                            <img src={currentMemory.image} alt={currentMemory.title}
                              className="h-52 w-48 sm:h-60 sm:w-55 object-cover shadow-inner md:h-90 md:w-80" />
                            <div className="polaroid-text absolute bottom-3 sm:bottom-4 left-0 right-0 text-center font-serif text-xs sm:text-sm italic text-gray-700">
                              {currentMemory.location || "Captured moment"}
                            </div>
                          </div>
                        ) : (
                          <div className="polaroid-bg flex h-52 w-48 sm:h-60 sm:w-55 md:h-90 md:w-80 -rotate-2 flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white mt-4 md:mt-0">
                            <Camera className="mb-3 h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                            <span className="font-serif text-xs sm:text-sm italic text-gray-600">No photo</span>
                          </div>
                        )}
                      </div>

                      {/* RIGHT PAGE (Text / Mobile Bottom) */}
                      <div className="relative flex flex-1 w-full flex-col p-6 pt-0 md:pt-8 md:h-full md:w-1/2 md:p-12 md:pl-16">
                        <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-[length:100%_32px]" />

                        <div className="relative z-10 mb-4 md:mb-6 flex shrink-0 justify-center md:justify-end">
                          <div className="text-center md:text-right font-serif">
                            <p className="text-base md:text-lg text-gray-800">
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })},
                            </p>
                            <p className="text-xs md:text-sm italic text-gray-500">
                              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 flex-1 flex flex-col text-gray-700">
                          <div className="space-y-4 pt-2">
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-800 text-center md:text-left">
                              {currentMemory.title}
                              {currentMemory.is_favorite && (
                                <Heart className="ml-2 md:ml-3 inline-block h-5 w-5 md:h-6 md:w-6 -translate-y-1 fill-[#8C2332] text-[#8C2332]" />
                              )}
                            </h2>
                            
                            <div className="text-center md:text-left">
                              <span className="inline-block rounded border border-rose-100 bg-rose-50 px-3 py-1 font-serif text-[10px] md:text-xs italic tracking-wide text-rose-700">
                                {currentMemory.memory_type.charAt(0).toUpperCase() + currentMemory.memory_type.slice(1)}
                              </span>
                            </div>

                            <p className="font-serif text-base md:text-lg leading-7 md:leading-8 text-gray-700 whitespace-pre-line text-center md:text-left">
                              {currentMemory.description}
                            </p>
                            
                            {currentMemory.location && (
                              <div className="flex justify-center md:justify-start">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-gray-200 rounded-full mt-2">
                                  <span className="text-[10px] md:text-xs text-gray-500">📍 {currentMemory.location}</span>
                                </div>
                              </div>
                            )}
                            
                            {currentMemory.favorite_quote && (
                              <div className="border-l-4 border-rose-300 pl-4 py-2 mt-4 bg-rose-50/50 rounded-r-lg">
                                <p className="font-serif text-sm italic text-gray-600">"{currentMemory.favorite_quote}"</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer Link */}
                        <div className="relative z-10 mt-8 md:mt-auto flex shrink-0 justify-center gap-4 pt-4 pb-2">
                          <button
                            onClick={() => {
                              onClose();
                              onNavigate(currentMemory.year_id, currentMemory.id);
                            }}
                            className="font-serif text-sm italic text-rose-500 underline decoration-rose-300 underline-offset-4 transition-colors hover:text-rose-700"
                          >
                            Read full story...
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Within-Day Flip Buttons (Pinned to bottom of container) */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FDFBF7] to-transparent pointer-events-none md:hidden z-30" />
                
                <button onClick={() => flipPage(-1)} disabled={!canGoPrev || isFlipping}
                  className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-40 flex h-10 w-10 md:h-10 md:w-10 items-center justify-center rounded-full bg-white border border-gray-200 md:border-none md:bg-white/90 text-gray-600 shadow-md transition-all hover:bg-gray-50 md:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="h-5 w-5 md:h-5 md:w-5" />
                </button>
                
                <div className="absolute bottom-6 md:bottom-8 left-1/2 z-40 -translate-x-1/2 font-serif text-[10px] md:text-xs italic text-gray-400 select-none bg-[#FDFBF7]/80 px-3 py-1 rounded-full md:bg-transparent md:px-0 md:py-0">
                  {currentPage + 1} / {totalPages}
                </div>
                
                <button onClick={() => flipPage(1)} disabled={!canGoNext || isFlipping}
                  className="absolute bottom-4 md:bottom-6 right-4 md:right-6 z-40 flex h-10 w-10 md:h-10 md:w-10 items-center justify-center rounded-full bg-white border border-gray-200 md:border-none md:bg-white/90 text-gray-600 shadow-md transition-all hover:bg-gray-50 md:hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight className="h-5 w-5 md:h-5 md:w-5" />
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