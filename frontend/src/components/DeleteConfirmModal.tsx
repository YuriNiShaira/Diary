import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertOctagon } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  loading?: boolean;
}

// Helper: Torn red tape
const WarningTape = () => (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-7 bg-red-500/40 dark:bg-red-900/50 backdrop-blur-sm shadow-sm border border-red-500/20 -rotate-2 z-10" 
       style={{ clipPath: 'polygon(5% 0%, 95% 2%, 100% 100%, 0% 95%)' }} 
  />
);

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Tear out this page?',
  message = 'Are you sure you want to discard this memory? It will be gone forever.',
  itemName,
  loading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, rotate: -2 }}
            animate={{ scale: 1, y: 0, rotate: 1 }}
            exit={{ scale: 0.9, y: 20, rotate: 2 }}
            className="relative bg-[#fffaf6] dark:bg-[#1e1a1b] rounded-sm p-8 max-w-sm w-full shadow-2xl border border-red-200 dark:border-red-900/50"
            onClick={(e) => e.stopPropagation()}
          >
            <WarningTape />

            {/* Subtle Paper Texture Background */}
            <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }} />

            <div className="relative z-10 flex flex-col items-center">
              
              {/* Red Ink Stamp Icon */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-400 dark:border-red-600 flex items-center justify-center mb-6 bg-red-50 dark:bg-red-950/30 transform -rotate-6">
                <AlertOctagon className="w-8 h-8 text-red-500 dark:text-red-500" />
              </div>

              {/* Text Content */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-serif text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h3>
                
                {itemName && (
                  <div className="my-3 py-2 border-y border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 transform rotate-1">
                    <p className="text-2xl font-handwriting text-red-600 dark:text-red-400">
                      "{itemName}"
                    </p>
                  </div>
                )}
                
                <p className="text-sm font-serif italic text-gray-600 dark:text-gray-400 leading-relaxed px-2 mt-2">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="flex-1 py-2 font-handwriting text-2xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Keep it
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-sm font-handwriting text-3xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 transform rotate-1"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mb-1" />
                      Discard
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;