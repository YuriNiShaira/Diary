import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

const SupportButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-6 left-6 z-50 group">
      
      {/* Translucent Washi Tape */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 bg-pink-300/40 dark:bg-rose-900/50 backdrop-blur-sm -rotate-3 z-10 shadow-sm"></div>
      
      <motion.button 
        onClick={() => navigate('/contact')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05, rotate: -2 }}
        whileTap={{ scale: 0.95 }}
        /* Sticky Note Styling */
        className="relative bg-[#fff9e6] dark:bg-[#3b3323] p-3 shadow-[2px_4px_10px_rgba(0,0,0,0.1)] dark:shadow-[2px_4px_10px_rgba(0,0,0,0.5)] rotate-3 flex items-center justify-center border border-yellow-200/50 dark:border-black/20"
        style={{ 
          borderRadius: '2px 8px 3px 10px', // Imperfect, organic paper cut shape
        }}
        aria-label="Contact Support"
      >
        <MessageCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 opacity-80" />
        
        {/* Tooltip styled as a torn piece of ruled paper */}
        <span 
          className="absolute left-16 top-1/2 -translate-y-1/2 bg-white dark:bg-[#2a2c3b] text-gray-700 dark:text-gray-200 text-2xl font-handwriting px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0 whitespace-nowrap pointer-events-none shadow-md border border-gray-100 dark:border-gray-800 -rotate-2"
          style={{ 
            borderRadius: '1px 4px 2px 3px',
            backgroundImage: 'linear-gradient(transparent 85%, rgba(251, 113, 133, 0.2) 85%)', 
            backgroundSize: '100% 1.8rem' 
          }}
        >
          Need some help? ✍️
        </span>
      </motion.button>

    </div>
  );
};

export default SupportButton;