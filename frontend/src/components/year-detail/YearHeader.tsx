import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface YearHeaderProps {
  year: number;
  description?: string;
  onDeleteYear: () => void;
}

const YearHeader: React.FC<YearHeaderProps> = ({ year, description, onDeleteYear }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Action buttons row */}
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.03, x: -4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onDeleteYear}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/90 hover:bg-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
          title="Delete this year and all its memories"
        >
          <Trash2 className="w-5 h-5" />
          <span className="hidden sm:inline">Delete Year</span>
        </motion.button>
      </div>

      {/* Year title and description */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="inline-block mb-4"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center shadow-lg">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-serif text-gray-800 dark:text-gray-100 mb-2">
          <span className="bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
            {year}
          </span>
        </h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-lg italic">"{description}"</p>
        )}
      </div>
    </motion.div>
  );
};

export default YearHeader;