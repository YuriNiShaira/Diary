import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Sparkles } from 'lucide-react';

interface YearCardProps {
  year: {
    id: number;
    year_number: number;
    cover_image?: string;
    description?: string;
    memory_count?: number;
  };
  onClick: () => void;
}

const YearCard: React.FC<YearCardProps> = ({ year, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      {/* Floating Glow */}
      <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-rose-300/20 via-pink-200/10 to-red-300/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

      {/* Diary Layers */}
      <div className="absolute inset-0 rounded-[2.2rem] bg-white/70 border border-stone-200 rotate-1 translate-x-2 translate-y-2 shadow-md group-hover:rotate-3 group-hover:translate-x-4 group-hover:translate-y-3 transition-all duration-500" />

      <div className="absolute inset-0 rounded-[2.2rem] bg-white/80 border border-stone-200 -rotate-1 -translate-x-1 translate-y-1 shadow-md group-hover:-rotate-2 group-hover:-translate-x-2 group-hover:translate-y-2 transition-all duration-500" />

      {/* Main Card */}
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/30 bg-white/80 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition-all duration-500 z-10">
        
        {/* Cover Area */}
        <div className="relative h-72 overflow-hidden">
          
          {/* Image */}
          {year.cover_image ? (
            <img
              src={year.cover_image}
              alt={year.year_number === 0 ? 'Prequel' : `Year ${year.year_number}`}
              className="w-full h-full object-cover object-center scale-100 group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 overflow-hidden">
              
              {/* Notebook Lines */}
              <div className="absolute inset-0 flex flex-col justify-evenly px-6 opacity-20">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-stone-700"
                  />
                ))}
              </div>

              {/* Decorative Circle */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/30 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-rose-200/40 rounded-full blur-3xl" />

              {/* Empty State */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-stone-500">
                <motion.div
                  animate={{
                    rotate: [0, -4, 4, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                >
                  <BookOpen className="w-16 h-16 stroke-[1.3]" />
                </motion.div>

                <p className="mt-4 text-xs uppercase tracking-[0.4em] font-medium">
                  Empty Chapter
                </p>
              </div>
            </div>
          )}

          {/* Cinematic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

          {/* Dust/Particles */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-12 left-10 w-1 h-1 bg-white rounded-full animate-pulse" />
            <div className="absolute top-24 right-16 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-1000" />
            <div className="absolute bottom-20 left-20 w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
          </div>

          {/* Ribbon */}
          <motion.div
            whileHover={{ y: 2 }}
            className="absolute top-0 right-7 z-20"
          >
            <div className="relative bg-gradient-to-b from-rose-500 to-red-500 text-white px-4 py-4 rounded-b-2xl shadow-xl flex flex-col items-center">
              
              {/* Ribbon Cut */}
              <div className="absolute -bottom-3 left-0 right-0 flex justify-center">
                <div className="w-5 h-5 bg-red-700 rotate-45" />
              </div>

              <span className="text-[10px] uppercase tracking-[0.25em] opacity-70 font-semibold">
                Volume
              </span>

              <span className="text-lg font-bold font-serif leading-none mt-1">
                {year.year_number === 0 ? 'Prequel' : `Year ${year.year_number}`}
              </span>
            </div>
          </motion.div>

          {/* Floating Sparkle */}
          <motion.div
            animate={{
              y: [0, -6, 0],
              rotate: [0, 8, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="absolute top-5 left-5 text-white/80"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>

          {/* Title */}
          <div className="absolute bottom-7 left-7 right-7 z-10">
            <motion.h2
              initial={{ opacity: 0.9 }}
              whileHover={{ scale: 1.01 }}
              className="text-white text-3xl sm:text-4xl font-serif italic leading-tight drop-shadow-2xl line-clamp-2"
            >
              {year.description || (year.year_number === 0 ? 'Before We Were Official' : `Year ${year.year_number}`)}
            </motion.h2>

            <div className="mt-3 w-16 h-[2px] bg-white/70 rounded-full group-hover:w-24 transition-all duration-500" />
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-6 py-5 bg-gradient-to-b from-white/70 to-rose-50/70 backdrop-blur-lg">
          
          {/* Top Border Glow */}
          <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent" />

          <div className="flex items-center justify-between">
            
            {/* Memories */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="flex items-center gap-2.5 bg-white/70 border border-rose-200/60 px-4 py-2 rounded-full shadow-sm"
            >
              <div className="relative">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />

                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 rounded-full border border-rose-400"
                />
              </div>

              <span className="text-sm font-medium text-stone-700 font-serif italic">
                {year.memory_count || 0}{' '}
                {year.memory_count === 1 ? 'memory' : 'memories'}
              </span>
            </motion.div>

            {/* Open Button */}
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-2 text-rose-500 text-xs uppercase tracking-[0.25em] font-semibold"
            >
              <span>Open Entry</span>

              <motion.span
                animate={{
                  x: [0, 4, 0],
                }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                }}
                className="text-base"
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default YearCard;