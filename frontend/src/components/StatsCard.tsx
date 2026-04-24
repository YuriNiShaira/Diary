import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Sparkle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 font-medium">{label}</p>
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
          className="text-4xl font-bold text-gray-800"
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