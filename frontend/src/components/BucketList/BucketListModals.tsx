import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { BucketListItem, BucketListFormData } from './bucketlistTypes';
import { categories } from './bucketlistConstants';

interface CompleteModalProps {
  theme: string | null;
  selectedItem: BucketListItem | null;
  completionNotes: string;
  setCompletionNotes: (value: string) => void;
  onClose: () => void;
  onConfirm: (payload: { id: number; completed_by: string; notes: string }) => void;
}

interface AddEditModalProps {
  theme: string | null;
  isOpen: boolean;
  onClose: () => void;
  editingItem: BucketListItem | null;
  formData: BucketListFormData;
  setFormData: React.Dispatch<React.SetStateAction<BucketListFormData>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const CompleteModal: React.FC<CompleteModalProps> = ({
  theme,
  selectedItem,
  completionNotes,
  setCompletionNotes,
  onClose,
  onConfirm,
}) => {
  if (!selectedItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`rounded-3xl p-6 max-w-md w-full shadow-2xl ${
            theme === 'dark'
              ? 'bg-purple-900/95 border border-purple-800/50'
              : 'bg-white/95 border border-white/30'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className={`text-2xl font-serif mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
              Dream Achieved!
            </h3>
            <p className={theme === 'dark' ? 'text-purple-200' : 'text-gray-600'}>
              "{selectedItem.title}"
            </p>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
              Who completed this?
            </label>
            <div className="flex gap-3">
              {['me', 'shaira', 'both'].map((who) => (
                <button
                  key={who}
                  onClick={() => onConfirm({ id: selectedItem.id, completed_by: who, notes: completionNotes })}
                  className={`flex-1 py-2 px-4 rounded-xl transition-colors ${
                    theme === 'dark'
                      ? 'bg-purple-800 hover:bg-purple-700 text-purple-200'
                      : 'bg-pink-50 hover:bg-pink-100 text-gray-700'
                  }`}
                >
                  {who === 'me' && '🙋 Me'}
                  {who === 'shaira' && '💕 Shaira'}
                  {who === 'both' && '👫 Both'}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
              Notes (Optional)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={2}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 resize-none ${
                theme === 'dark'
                  ? 'bg-purple-800 border-purple-700 text-purple-200 placeholder-purple-400'
                  : 'bg-white border-pink-200 text-gray-700'
              }`}
              placeholder="How was it? 💕"
            />
          </div>

          <button
            onClick={onClose}
            className={`w-full btn-soft ${theme === 'dark' && 'dark'}`}
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const AddEditBucketListModal: React.FC<AddEditModalProps> = ({
  theme,
  isOpen,
  onClose,
  editingItem,
  formData,
  setFormData,
  onSubmit,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
              theme === 'dark'
                ? 'bg-purple-900/95 border border-purple-800/50'
                : 'bg-white/95 border border-white/30'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
                {editingItem ? 'Edit Dream' : 'Add New Dream'} 🌟
              </h2>
              <button
                onClick={onClose}
                className={theme === 'dark' ? 'text-purple-400 hover:text-purple-200' : 'text-gray-400 hover:text-gray-600'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 ${
                    theme === 'dark'
                      ? 'bg-purple-800 border-purple-700 text-purple-200 placeholder-purple-400'
                      : 'bg-white border-pink-200 text-gray-700'
                  }`}
                  placeholder="Visit Japan together"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 resize-none ${
                    theme === 'dark'
                      ? 'bg-purple-800 border-purple-700 text-purple-200 placeholder-purple-400'
                      : 'bg-white border-pink-200 text-gray-700'
                  }`}
                  placeholder="Cherry blossom season, eat ramen, visit Tokyo..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-purple-800 border-purple-700 text-purple-200'
                        : 'bg-white border-pink-200 text-gray-700'
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) })}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark'
                        ? 'bg-purple-800 border-purple-700 text-purple-200'
                        : 'bg-white border-pink-200 text-gray-700'
                    }`}
                  >
                    <option value={1}>⭐ Low</option>
                    <option value={2}>⭐⭐ Medium</option>
                    <option value={3}>⭐⭐⭐ High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-rose-500 ${
                    theme === 'dark'
                      ? 'bg-purple-800 border-purple-700 text-purple-200'
                      : 'bg-white border-pink-200 text-gray-700'
                  }`}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-romantic"
              >
                {editingItem ? 'Update Dream' : 'Add to Bucket List'} 🌟
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
