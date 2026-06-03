// frontend/src/components/StatsCard.tsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string; // Kept for compatibility, but we will use custom pastels
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Slight random rotation for a hand-pinned note look
  const randomRotation = useMemo(() => (Math.random() * 4) - 2, []);

  // Map the specific labels to the 4 pastel colors
  const cardTheme = useMemo(() => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('days') || lowerLabel.includes('photo')) {
      return isDark ? 'bg-[#3b1a20]' : 'bg-[#fdf0f2]'; // Soft Pink
    }
    if (lowerLabel.includes('years') || lowerLabel.includes('core')) {
      return isDark ? 'bg-[#3a3220]' : 'bg-[#fdfce8]'; // Soft Yellow
    }
    if (lowerLabel.includes('precious') || lowerLabel.includes('place')) {
      return isDark ? 'bg-[#1a332d]' : 'bg-[#ebfbf7]'; // Soft Mint
    }
    // Default to Soft Blue
    return isDark ? 'bg-[#1e233b]' : 'bg-[#eff3fe]';
  }, [label, isDark]);

  return (
    <motion.div
      initial={{ rotate: randomRotation, opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.03,
        rotate: randomRotation > 0 ? randomRotation + 1 : randomRotation - 1,
        y: -5,
        zIndex: 10,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative flex flex-col items-center justify-center p-6 pt-10 sm:p-8 sm:pt-12 w-full shadow-[0_5px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_15px_25px_rgba(0,0,0,0.12)] transition-all duration-300 ${cardTheme}`}
      style={{
        borderRadius: '2px', // Slight rounding so it looks like cut paper
      }}
    >
      {/* ------ Red Pushpin ------ */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)]">
        <svg width="24" height="28" viewBox="0 0 24 28" className="overflow-visible">
          {/* Pin shadow on the paper */}
          <ellipse cx="12" cy="22" rx="4" ry="1.5" fill="rgba(0,0,0,0.15)" />
          {/* Needle */}
          <line x1="12" y1="12" x2="12" y2="22" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" />
          {/* Pin Head (Red) */}
          <circle cx="12" cy="8" r="6" fill="#e11d48" />
          {/* Pin Highlight */}
          <circle cx="10" cy="5.5" r="2" fill="rgba(255,255,255,0.5)" />
        </svg>
      </div>

      {/* ------ Content ------ */}
      
      {/* Icon */}
      <div className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'} scale-110`}>
        {icon}
      </div>

      {/* Value */}
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-4xl sm:text-5xl font-bold font-serif tracking-tighter mb-4 ${
          isDark ? 'text-gray-100' : 'text-gray-900'
        }`}
      >
        {value.toLocaleString()}
      </motion.p>

      {/* Handwritten Label */}
      <p className={`font-handwriting text-xl sm:text-2xl ${
        isDark ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
      </p>
      
    </motion.div>
  );
};

export default StatsCard;