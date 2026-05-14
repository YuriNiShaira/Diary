// frontend/src/components/TimeCounter.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  addYears,
  addMonths,
  addDays,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isValid,
} from 'date-fns';
import { Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TimeCounterProps {
  anniversaryDate: string;
}

interface TimeTogether {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// --- SVG COMPONENTS ---

const BoySVG = ({ color }: { color: string }) => (
  <motion.svg
    width="45"
    height="65"
    viewBox="0 0 32 50"
    className="overflow-visible"
    style={{ color }}
    animate={{ y: [0, -2, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  >
    <circle cx="16" cy="10" r="7" fill="currentColor" />
    <path d="M16 18 V36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M16 35 L8 48 M16 35 L24 48" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M16 23 L32 21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M16 23 L8 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </motion.svg>
);

const GirlSVG = ({ color }: { color: string }) => (
  <motion.svg
    width="45"
    height="65"
    viewBox="0 0 32 50"
    className="overflow-visible"
    style={{ color }}
    animate={{ y: [0, -2, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
  >
    <circle cx="16" cy="10" r="7" fill="currentColor" />
    <path d="M16 17 L7 37 H25 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    <path d="M13 37 L13 48 M19 37 L19 48" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M16 23 L0 21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M16 23 L24 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
  </motion.svg>
);

// --- MAIN COMPONENT ---

const TimeCounter: React.FC<TimeCounterProps> = ({ anniversaryDate }) => {
  const { theme } = useTheme();
  const [timeTogether, setTimeTogether] = useState<TimeTogether>({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
  });
  const [isDateValid, setIsDateValid] = useState(true);

  const brandColor = theme === 'dark' ? '#f472b6' : '#e11d48';

  useEffect(() => {
    const start = new Date(anniversaryDate);
    if (!isValid(start)) {
      setIsDateValid(false);
      return;
    }
    setIsDateValid(true);

    const calculateTime = () => {
      const now = new Date();
      if (now < start) {
        setTimeTogether({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const years = differenceInYears(now, start);
      const afterYears = addYears(start, years);
      const months = differenceInMonths(now, afterYears);
      const afterMonths = addMonths(afterYears, months);
      const days = differenceInDays(now, afterMonths);
      const afterDays = addDays(afterMonths, days);
      const remainingMs = now.getTime() - afterDays.getTime();

      setTimeTogether({
        years, months, days,
        hours: Math.floor(remainingMs / 3600000),
        minutes: Math.floor((remainingMs % 3600000) / 60000),
        seconds: Math.floor((remainingMs % 60000) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDate]);

  const formatNumber = (value: number) => value.toString().padStart(2, '0');

  const timeItems = [
    { label: 'Years', value: timeTogether.years },
    { label: 'Months', value: timeTogether.months },
    { label: 'Days', value: timeTogether.days },
    { label: 'Hours', value: timeTogether.hours },
    { label: 'Minutes', value: timeTogether.minutes },
    { label: 'Seconds', value: timeTogether.seconds },
  ];

  if (!isDateValid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`rounded-[2rem] border p-8 text-center shadow-xl backdrop-blur-sm ${
          theme === 'dark'
            ? 'bg-purple-900/40 border-purple-700/40'
            : 'bg-white/85 border-rose-200/80'
        }`}
      >
        <h3 className={`text-2xl font-serif mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
          Our Beautiful Journey Together 💕
        </h3>
        <p className={theme === 'dark' ? 'text-purple-300' : 'text-rose-500'}>
          Invalid anniversary date. Check the date value first.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`relative overflow-visible rounded-[2.5rem] border p-6 shadow-2xl backdrop-blur-md md:p-10 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 border-purple-700/40 shadow-[0_20px_70px_rgba(80,40,100,0.3)]'
          : 'bg-gradient-to-br from-white/80 via-rose-50/70 to-pink-100/60 border-rose-200/70 shadow-[0_20px_70px_rgba(244,114,182,0.18)]'
      }`}
    >
      {/* Background Decor Layers */}
      <div className={`absolute -left-16 top-10 h-40 w-40 rounded-full blur-3xl ${
        theme === 'dark' ? 'bg-purple-500/20' : 'bg-pink-200/30'
      }`} />
      <div className={`absolute -right-16 bottom-8 h-40 w-40 rounded-full blur-3xl ${
        theme === 'dark' ? 'bg-rose-500/20' : 'bg-rose-200/30'
      }`} />

      {/* Floating Accent Hearts */}
      <Heart className={`absolute left-8 top-8 h-5 w-5 fill-current ${
        theme === 'dark' ? 'text-purple-500/50' : 'text-rose-200/70'
      }`} />
      <Heart className={`absolute right-10 top-10 h-4 w-4 fill-current ${
        theme === 'dark' ? 'text-purple-500/40' : 'text-pink-200/70'
      }`} />

      <div className="relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl font-serif md:text-5xl ${
              theme === 'dark' ? 'text-purple-50' : 'text-gray-800'
            }`}
          >
            Our Beautiful Journey Together
          </motion.h3>
          <p className={`mt-3 text-sm md:text-lg font-medium ${
            theme === 'dark' ? 'text-purple-300' : 'text-gray-500'
          }`}>
            Every second with you is part of our story
          </p>
        </div>

        {/* Inner Timer Panel */}
        <div className={`relative mt-12 rounded-[2rem] border px-4 py-8 md:px-8 md:py-12 ${
          theme === 'dark'
            ? 'border-purple-500/30 bg-purple-950/40 shadow-[inset_0_1px_0_rgba(150,120,170,0.2)]'
            : 'border-white/60 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}>
          
          {/* Boy - Top Left */}
          <div className="absolute -top-[63px] left-4 md:left-12 z-30">
            <BoySVG color={brandColor} />
          </div>

          {/* Girl - Top Right */}
          <div className="absolute -top-[63px] right-4 md:right-12 z-30">
            <GirlSVG color={brandColor} />
          </div>

          {/* Connecting String & Heart */}
          <div className="absolute -top-[45px] left-[55px] right-[55px] md:left-[85px] md:right-[85px] h-[60px] pointer-events-none z-20">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
              <path
                d="M0,5 Q50,35 100,5"
                fill="none"
                stroke={brandColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                className="opacity-60"
              />
            </svg>
            <div className="absolute left-1/2 top-[28px] -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-7 h-7 fill-current drop-shadow-md" style={{ color: brandColor }} />
              </motion.div>
            </div>
          </div>

          {/* Timer Grid */}
          <div className="grid grid-cols-2 gap-y-12 md:grid-cols-3 xl:grid-cols-6 relative z-10">
            {timeItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative flex flex-col items-center justify-center text-center"
              >
                <div className={`text-5xl font-bold leading-none tracking-tighter sm:text-6xl md:text-7xl ${
                  theme === 'dark' ? 'text-purple-300' : 'text-rose-500'
                }`}>
                  {formatNumber(item.value)}
                </div>

                <div className={`mt-3 text-xs font-bold uppercase tracking-[0.2em] md:text-sm ${
                  theme === 'dark' ? 'text-purple-300/80' : 'text-gray-500'
                }`}>
                  {item.label}
                </div>

                <div className={`mt-4 h-1 w-10 rounded-full ${
                  theme === 'dark' ? 'bg-purple-500/40' : 'bg-rose-300/50'
                }`} />

                {index !== timeItems.length - 1 && (
                  <div className={`absolute right-0 top-1/2 hidden h-16 w-px -translate-y-1/2 xl:block ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-gray-200/60'
                  }`} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeCounter;