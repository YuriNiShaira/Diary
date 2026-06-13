import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, MapPin, Quote } from 'lucide-react';

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

    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }, 300);
    }

    setTimeout(() => setIsFlipping(false), 600);
  }, [isFlipping, currentPage, totalPages, hasNextDate, hasPrevDate, datesWithMemories, currentDateIndex, onDateChange]);

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

  const formattedDate = new Date(date + 'T00:00:00');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 md:bg-black/70 md:p-6 backdrop-blur-lg md:backdrop-blur-sm"
          onClick={onClose}
        >
          {/* ========================================== */}
          {/* DESKTOP VIEW: The 3D Book Layout           */}
          {/* ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative hidden md:block w-full max-w-5xl"
            style={{ perspective: "2500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-visible rounded-xl bg-[#2C292A] p-2 pb-3 pr-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] dark:bg-[#1A1819]">
              <button onClick={onClose}
                className="absolute -right-4 -top-4 z-50 rounded-full bg-white p-2.5 text-gray-800 shadow-xl transition-all hover:scale-110 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-200">
                <X className="h-5 w-5" />
              </button>

              <div className="absolute -left-14 top-1/2 -translate-y-1/2 z-50">
                <button onClick={() => { if (hasPrevDate) { setDirection(-1); onDateChange(datesWithMemories[currentDateIndex - 1]); } }}
                  disabled={!hasPrevDate || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-l-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronsLeft className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold rotate-180">Prev Day</span>
                </button>
              </div>

              <div className="absolute -right-14 top-1/2 -translate-y-1/2 z-50">
                <button onClick={() => { if (hasNextDate) { setDirection(1); onDateChange(datesWithMemories[currentDateIndex + 1]); } }}
                  disabled={!hasNextDate || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-r-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronsRight className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold">Next Day</span>
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
              <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#F0ECE1]/50 bg-[#F0ECE1] dark:border-gray-700/50 dark:bg-gray-700" />

              <div className="light-book-page relative flex h-[650px] w-full overflow-hidden rounded bg-[#FDFBF7] dark:bg-[#FDFBF7]" style={{ perspective: "2500px" }}>
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent z-20" />
                <div className="absolute left-1/2 top-0 h-32 w-8 -translate-x-1/2 bg-[#8C2332] shadow-md z-10">
                  <div className="absolute bottom-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#FDFBF7]" />
                </div>

                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`${date}-${currentPage}-desktop`} custom={direction}
                    className="absolute inset-0 flex w-full h-full"
                    style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
                    initial={{ rotateY: direction > 0 ? 90 : -90, z: 150, scale: 0.98, opacity: 0 }}
                    animate={{ rotateY: 0, z: 0, scale: 1, opacity: 1 }}
                    exit={{ rotateY: direction > 0 ? -90 : 90, z: 150, scale: 0.98, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}>
                    
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-30"
                      initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} exit={{ opacity: 0.6 }} transition={{ duration: 0.5 }}
                      style={{ background: direction > 0
                        ? 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)'
                        : 'linear-gradient(to left, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)' }} />

                    <div className="relative flex shrink-0 w-1/2 flex-col items-center justify-center p-12 bg-[#FDFBF7]">
                      {currentMemory.image ? (
                        <div className="polaroid-bg relative group -rotate-2 bg-white p-4 pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-0">
                          <div className="absolute -top-4 left-1/2 h-10 w-28 -translate-x-1/2 rotate-2 bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)' }} />
                          <div className="absolute -bottom-2 left-1/3 h-8 w-20 -translate-x-1/2 -rotate-2 bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }} />
                          <img src={currentMemory.image} alt={currentMemory.title} className="h-90 w-80 object-cover shadow-inner" />
                          <div className="polaroid-text absolute bottom-4 left-0 right-0 text-center font-serif text-sm italic text-gray-700">
                            {currentMemory.location || "Captured moment"}
                          </div>
                        </div>
                      ) : (
                        <div className="polaroid-bg flex h-90 w-80 -rotate-2 flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white">
                          <Camera className="mb-3 h-10 w-10 text-gray-400" />
                          <span className="font-serif text-sm italic text-gray-600">No photo</span>
                        </div>
                      )}
                    </div>

                    <div className="relative flex flex-1 w-1/2 flex-col bg-[#FDFBF7] p-12 pl-16">
                      <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-[length:100%_32px]" />
                      <div className="relative z-10 mb-6 flex shrink-0 justify-end">
                        <div className="text-right font-serif">
                          <p className="text-lg text-gray-800">{formattedDate.toLocaleDateString('en-US', { weekday: 'long' })},</p>
                          <p className="text-sm italic text-gray-500">{formattedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>

                      <div className="relative z-10 flex-1 flex flex-col text-gray-700">
                        <div className="space-y-4 pt-2">
                          <h2 className="font-serif text-3xl font-bold text-gray-800 line-clamp-2">
                            {currentMemory.title}
                            {currentMemory.is_favorite && <Heart className="ml-3 inline-block h-6 w-6 -translate-y-1 fill-[#8C2332] text-[#8C2332]" />}
                          </h2>
                          <span className="inline-block rounded border border-rose-100 bg-rose-50 px-3 py-1 font-serif text-xs italic tracking-wide text-rose-700">
                            {currentMemory.memory_type.charAt(0).toUpperCase() + currentMemory.memory_type.slice(1)}
                          </span>
                          <p className="font-serif text-lg leading-8 text-gray-700 whitespace-pre-line">
                            {currentMemory.description}
                          </p>
                          {currentMemory.location && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-gray-200 rounded-full mt-2">
                              <span className="text-xs text-gray-500">📍 {currentMemory.location}</span>
                            </div>
                          )}
                          {currentMemory.favorite_quote && (
                            <div className="border-l-4 border-rose-300 pl-4 py-2 mt-2 bg-rose-50/50 rounded-r-lg line-clamp-2">
                              <p className="font-serif text-sm italic text-gray-600">"{currentMemory.favorite_quote}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10 mt-auto flex shrink-0 justify-center gap-4 pt-4 pb-2">
                        <button onClick={() => { onClose(); onNavigate(currentMemory.year_id, currentMemory.id); }}
                          className="font-serif text-sm italic text-rose-500 underline decoration-rose-300 underline-offset-4 transition-colors hover:text-rose-700">
                          Read full story...
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button onClick={() => flipPage(-1)} disabled={!canGoPrev || isFlipping}
                  className="absolute bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-all hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 font-serif text-xs italic text-gray-400 select-none">
                  {currentPage + 1} / {totalPages}
                </div>
                <button onClick={() => flipPage(1)} disabled={!canGoNext || isFlipping}
                  className="absolute bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-all hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ========================================== */}
          {/* MOBILE VIEW: Immersive App Modal           */}
          {/* ========================================== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] flex md:hidden flex-col w-full h-[100dvh] bg-[#0a0a0a] text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Date & Close */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-[env(safe-area-inset-top,1rem)]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">
                  {formattedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
                <span className="text-sm font-semibold text-white/90">
                  {formattedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <button onClick={onClose} className="bg-white/10 backdrop-blur-md p-2 rounded-full text-white active:scale-95 transition-transform">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-28">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`${date}-${currentPage}-mobile`} custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex flex-col min-h-full"
                >
                  {/* Image Hero (Full Bleed) */}
                  <div className="relative w-full aspect-[4/5] sm:aspect-square bg-[#1a1a1a] shrink-0 overflow-hidden rounded-b-[2.5rem]">
                    {currentMemory.image ? (
                      <img src={currentMemory.image} alt={currentMemory.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                        <Camera className="h-16 w-16 mb-3 opacity-50" />
                        <span className="text-sm tracking-wider uppercase font-semibold opacity-50">No Image</span>
                      </div>
                    )}
                    
                    {/* Inner Gradient for seamless blend */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                    
                    {/* Tags Overlaid on Image */}
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <span className="inline-block bg-white/10 backdrop-blur-md text-white border border-white/10 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold">
                        {currentMemory.memory_type}
                      </span>
                      {currentMemory.is_favorite && (
                        <div className="bg-rose-500/20 backdrop-blur-md p-2 rounded-full border border-rose-500/30">
                          <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clean Content Area */}
                  <div className="px-6 py-6 flex flex-col gap-5 flex-1">
                    <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
                      {currentMemory.title}
                    </h2>

                    <p className="text-lg leading-relaxed text-white/70 whitespace-pre-line font-light">
                      {currentMemory.description}
                    </p>

                    {currentMemory.location && (
                      <div className="flex items-center gap-2 mt-2 text-white/50 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">{currentMemory.location}</span>
                      </div>
                    )}

                    {currentMemory.favorite_quote && (
                      <div className="mt-4 p-5 rounded-2xl bg-[#1a1a1a] border border-white/5 flex gap-3">
                        <Quote className="h-5 w-5 text-rose-500 shrink-0 opacity-80" />
                        <p className="italic text-white/80 leading-relaxed text-sm">
                          {currentMemory.favorite_quote}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating Glassmorphic Nav Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-[env(safe-area-inset-bottom,1.5rem)] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent">
              <div className="flex items-center gap-3 max-w-sm mx-auto">
                
                {/* Previous Button */}
                <button 
                  onClick={() => { if (hasPrevDate) { setDirection(-1); onDateChange(datesWithMemories[currentDateIndex - 1]); } else if (canGoPrev) { flipPage(-1); } }}
                  disabled={!canGoPrev || isFlipping}
                  className="h-14 w-14 shrink-0 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/10 text-white disabled:opacity-20 active:scale-95 transition-all">
                  {currentPage === 0 && hasPrevDate ? <ChevronsLeft className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                </button>

                {/* Primary Action */}
                <button 
                  onClick={() => { onClose(); onNavigate(currentMemory.year_id, currentMemory.id); }}
                  className="flex-1 h-14 bg-rose-500 text-white rounded-full font-semibold shadow-lg shadow-rose-500/20 active:scale-95 transition-transform flex items-center justify-center text-sm tracking-wide">
                  Read Full Story
                </button>

                {/* Next Button */}
                <button 
                  onClick={() => { if (currentPage === totalPages - 1 && hasNextDate) { setDirection(1); onDateChange(datesWithMemories[currentDateIndex + 1]); } else if (canGoNext) { flipPage(1); } }}
                  disabled={!canGoNext || isFlipping}
                  className="h-14 w-14 shrink-0 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-lg border border-white/10 text-white disabled:opacity-20 active:scale-95 transition-all">
                  {currentPage === totalPages - 1 && hasNextDate ? <ChevronsRight className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                </button>

              </div>
              
              {/* Simple dot indicators (only show if multiple memories on this day) */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentPage ? 'w-4 bg-rose-500' : 'w-1.5 bg-white/20'}`} />
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookModal;