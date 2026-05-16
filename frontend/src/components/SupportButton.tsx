import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

const SupportButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <motion.button //
      onClick={() => navigate('/contact')}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 left-6 z-50 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-rose-500 p-3 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 group"
      title="Need help? or have a concern? Contact us"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Need help? or have a concern? Contact us
      </span>
    </motion.button>
  );
};

export default SupportButton;