// frontend/src/components/StatsCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`rounded-2xl p-6 relative overflow-hidden group backdrop-blur-sm transition-all ${
        theme === 'dark'
          ? 'bg-purple-900/30 border border-purple-800/50 shadow-[0_10px_30px_rgba(80,40,100,0.2)]'
          : 'bg-white/40 border border-white/30 shadow-lg'
      }`}
    >
      {/* Sparkle overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        theme === 'dark' ? 'from-purple-400/10 to-transparent' : 'from-white/20 to-transparent'
      }`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className={`font-medium ${
            theme === 'dark' ? 'text-purple-200' : 'text-gray-600'
          }`}>
            {label}
          </p>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-r ${color} p-3 rounded-xl text-white shadow-lg`}
          >
            {icon}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-4xl font-bold ${
            theme === 'dark' ? 'text-purple-100' : 'text-gray-800'
          }`}
        >
          {value.toLocaleString()}
        </motion.p>

        {/* Decorative line */}
        <div className={`h-1 w-12 bg-gradient-to-r ${color} rounded-full mt-3`} />
      </div>
    </motion.div>
  );
};

export default StatsCard;