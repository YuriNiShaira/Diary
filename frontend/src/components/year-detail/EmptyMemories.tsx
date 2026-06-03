import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

interface EmptyMemoriesProps {
  onCreate: () => void;
}

const EmptyMemories: React.FC<EmptyMemoriesProps> = ({ onCreate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-20"
  >
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="inline-block mb-8"
    >
      <div className="w-40 h-40 rounded-full bg-linear-to-br from-pink-200 to-rose-200 flex items-center justify-center mx-auto shadow-xl">
        <Camera className="w-20 h-20 text-pink-400/60" />
      </div>
    </motion.div>

    <h3 className="text-4xl font-serif text-gray-800 mb-4">No memories yet</h3>
    <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
      Start capturing your beautiful moments together. Add your first memory to begin your love story timeline.
    </p>

    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(236, 72, 153, 0.3)' }}
      whileTap={{ scale: 0.95 }}
      onClick={onCreate}
      className="px-8 py-4 bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
    >
      Create First Memory 💕
    </motion.button>
  </motion.div>
);

export default EmptyMemories;