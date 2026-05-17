import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this?',
  itemName,
  loading = false,
}) => {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`rounded-2xl p-6 max-w-sm w-full shadow-2xl ${
              theme === 'dark' 
                ? 'bg-gray-900 border border-gray-700' 
                : 'bg-white border border-gray-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className={`text-lg font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {title}
              </h3>
              {itemName && (
                <p className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg inline-block mb-2">
                  "{itemName}"
                </p>
              )}
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {message}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;