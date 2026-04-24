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

const TimeCounter: React.FC<TimeCounterProps> = ({ anniversaryDate }) => {
  const [timeTogether, setTimeTogether] = useState<TimeTogether>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isDateValid, setIsDateValid] = useState(true);

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
        setTimeTogether({
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      const years = differenceInYears(now, start);
      const afterYears = addYears(start, years);

      const months = differenceInMonths(now, afterYears);
      const afterMonths = addMonths(afterYears, months);

      const days = differenceInDays(now, afterMonths);
      const afterDays = addDays(afterMonths, days);

      const remainingMs = now.getTime() - afterDays.getTime();

      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      setTimeTogether({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
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
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[2rem] border border-rose-200/80 bg-white/85 p-8 text-center shadow-[0_20px_60px_rgba(244,114,182,0.16)] backdrop-blur-sm"
      >
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-rose-100/70 via-pink-100/50 to-rose-100/70" />
        <div className="relative">
          <h3 className="mb-2 text-2xl font-serif text-gray-800">
            Our Beautiful Journey Together 💕
          </h3>
          <p className="text-sm text-rose-500">
            Invalid anniversary date. Check the date value first, bro.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2.25rem] border border-rose-200/70 bg-gradient-to-br from-white/80 via-rose-50/70 to-pink-100/60 p-6 shadow-[0_20px_70px_rgba(244,114,182,0.18)] backdrop-blur-md md:p-8"
    >
      {/* Decorative glow layers */}
      <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-pink-200/30 blur-3xl" />
      <div className="absolute -right-16 bottom-8 h-40 w-40 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-rose-100/70 via-pink-100/40 to-rose-100/70" />

      {/* Floating accents */}
      <Heart className="absolute left-8 top-8 h-5 w-5 text-rose-200/70 fill-current" />
      <Heart className="absolute right-10 top-10 h-4 w-4 text-pink-200/70 fill-current" />
      <Heart className="absolute bottom-8 left-10 h-4 w-4 text-rose-200/60 fill-current" />
      <Heart className="absolute bottom-10 right-8 h-5 w-5 text-pink-200/60 fill-current" />

      <div className="relative">
        {/* Header */}
        <div className="text-center">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-2xl font-serif text-gray-800 md:text-4xl"
          >
            Our Beautiful Journey Together 💕
          </motion.h3>

          <p className="mt-2 text-sm text-gray-500 md:text-base">
            Every second with you is part of our story
          </p>

          {/* Decorative line */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-14 bg-gradient-to-r from-transparent to-rose-300" />
            <Heart className="h-4 w-4 text-rose-400 fill-current" />
            <div className="h-px w-14 bg-gradient-to-l from-transparent to-rose-300" />
          </div>
        </div>

        {/* Inner timer panel */}
        <div className="mt-8 rounded-[1.75rem] border border-white/60 bg-white/55 px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_30px_rgba(244,114,182,0.08)] backdrop-blur-sm md:px-6 md:py-8">
          <div className="grid grid-cols-2 gap-y-8 md:grid-cols-3 xl:grid-cols-6">
            {timeItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.35 }}
                className="relative flex flex-col items-center justify-center text-center"
              >
                <div className="text-4xl font-bold leading-none tracking-tight text-rose-500 sm:text-5xl md:text-6xl">
                  {formatNumber(item.value)}
                </div>

                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 md:text-sm">
                  {item.label}
                </div>

                <div className="mt-3 h-1 w-10 rounded-full bg-gradient-to-r from-rose-300 via-pink-400 to-rose-300 opacity-90" />

                {index !== timeItems.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden h-14 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-rose-200/80 to-transparent xl:block" />
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