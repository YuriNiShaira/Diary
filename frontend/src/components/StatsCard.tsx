// frontend/src/components/StatsCard.tsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string; // kept for compatibility, unused
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => {
  // Slight random rotation for a hand‑placed look
  const randomRotation = useMemo(() => Math.random() * 4 - 2, []);

  // Sticky note colors – always yellow
  const noteBg = 'bg-[#fff9b0]';
  const textColor = 'text-[#78716c]';
  const valueColor = 'text-[#292524]';
  const foldColor = '#e5e5a0';
  const pinColor = '#e11d48'; // red pushpin

  return (
    <motion.div
      initial={{ rotate: randomRotation, opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.05,
        rotate: randomRotation > 0 ? randomRotation + 2 : randomRotation - 2,
        y: -5,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative p-6 w-full ${noteBg} transition-shadow duration-300 mt-4`}
      style={{
        boxShadow:
          '2px 4px 8px rgba(0,0,0,0.08), inset 0 -3px 10px rgba(0,0,0,0.04)',
        borderRadius: '2px 18px 3px 15px',
      }}
    >
      {/* ------ Red Pushpin ------ */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="5" fill={pinColor} />
          <circle cx="10" cy="6" r="2" fill="rgba(255,255,255,0.4)" />
          <line x1="12" y1="13" x2="12" y2="22" stroke="#999" strokeWidth="2" />
        </svg>
      </div>

      {/* ------ Folded bottom‑right corner ------ */}
      <div
        className="absolute bottom-0 right-0 w-10 h-10 overflow-hidden"
        style={{ borderRadius: '0 0 15px 0' }}
      >
        <div
          className="absolute bottom-0 right-0 w-0 h-0"
          style={{
            borderStyle: 'solid',
            borderWidth: '0 0 20px 20px',
            borderColor: `transparent transparent ${foldColor} transparent`,
          }}
        />
      </div>

      {/* ------ Content ------ */}
      <div className="relative z-10 mt-1 flex flex-col items-center text-center">
        <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-[#d6d3d1]">
          <div className="text-xl text-[#78716c]">{icon}</div>
        </div>

        <p className={`font-serif text-sm italic mb-1 ${textColor}`}>{label}</p>

        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-4xl font-bold font-serif tracking-tighter ${valueColor}`}
        >
          {value.toLocaleString()}
        </motion.p>

        <div
          className="h-px w-12 mt-4 rounded-full bg-[#d6d3d1]"
          style={{ transform: 'rotate(-1deg)' }}
        />
      </div>
    </motion.div>
  );
};

export default StatsCard;