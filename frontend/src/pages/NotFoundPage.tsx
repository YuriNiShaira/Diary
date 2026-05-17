import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import RomanticBackground from '../components/RomanticBackground';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <RomanticBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          💔
        </motion.div>
        
        <h1 className="text-6xl font-serif text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-500 mb-2">Page not found</p>
        <p className="text-gray-400 mb-8 italic">"Even the best love stories have missing pages..."</p>
        
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="btn-soft flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="btn-romantic flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;