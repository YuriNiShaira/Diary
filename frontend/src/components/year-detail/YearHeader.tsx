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
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-rose-500 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Delete Year Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDeleteYear}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Delete Year"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="text-center mb-6">
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
        
        <h1 className="text-5xl md:text-6xl font-serif text-gray-800 mb-2">
          <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {year}
          </span>
        </h1>
        {description && (
          <p className="text-gray-600 text-lg italic">"{description}"</p>
        )}
      </div>
    </motion.div>
  );
};

export default YearHeader;