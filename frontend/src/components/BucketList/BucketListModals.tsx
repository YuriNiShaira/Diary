import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { BucketListItem, BucketListFormData } from './bucketlistTypes';
import { categories } from './bucketlistConstants';

// I-export ang mga interfaces para hindi mag-error ang TypeScript
export interface CompleteModalProps {
  theme: string | null;
  selectedItem: BucketListItem | null;
  completionNotes: string;
  setCompletionNotes: (value: string) => void;
  onClose: () => void;
  onConfirm: (payload: { id: number; completed_by: string; notes: string }) => void;
}

export interface AddEditModalProps {
  theme: string | null;
  isOpen: boolean;
  onClose: () => void;
  editingItem: BucketListItem | null;
  formData: BucketListFormData;
  setFormData: React.Dispatch<React.SetStateAction<BucketListFormData>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

// Helper: Torn Washi Tape (Consistent sa scrapbook aesthetic)
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-rose-100/70', className = '' }) => (
  <div className={`absolute -top-3 w-24 h-6 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20 ${className}`} 
       style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 100%, 0% 96%)' }} 
  />
);

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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10, rotate: 1 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.95, y: 10, rotate: -1 }}
          className={`relative w-full max-w-sm p-8 rounded-sm shadow-2xl border ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-[#fffaf6] border-gray-200 text-gray-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <WashiTape rotate="rotate-2" className="left-1/2 -translate-x-1/2" />
          
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">✨</div>
            <h3 className={`font-serif text-3xl mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>Dream Achieved</h3>
            <p className={`font-handwriting text-xl italic ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>"{selectedItem.title}"</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Who completed this?</label>
              <div className="grid grid-cols-3 gap-2">
                {['me', 'shaira', 'both'].map((who) => (
                  <button
                    key={who}
                    onClick={() => onConfirm({ id: selectedItem.id, completed_by: who, notes: completionNotes })}
                    className="py-2 text-sm font-serif border border-gray-300 hover:border-rose-400 hover:bg-rose-50 transition-colors"
                  >
                    {who === 'me' ? 'Me' : who === 'shaira' ? 'Shaira' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Journal Entry</label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
                className={`w-full bg-transparent border-b-2 border-dashed outline-none font-handwriting text-2xl focus:border-rose-400 resize-none ${theme === 'dark' ? 'border-slate-700 text-slate-200' : 'border-gray-300 text-gray-800'}`}
                placeholder="How was the experience?..."
              />
            </div>

            <button onClick={onClose} className="w-full font-handwriting text-2xl text-gray-400 hover:text-gray-800">
              Nevermind
            </button>
          </div>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, rotate: -1 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.95, rotate: 1 }}
            className={`relative w-full max-w-lg p-10 rounded-sm shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-[#fffaf6] border-gray-200 text-gray-800'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <WashiTape rotate="-rotate-2" className="left-1/2 -translate-x-1/2" />
            
            <div className={`flex justify-between items-center mb-8 border-b pb-4 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
              <h2 className={`${theme === 'dark' ? 'font-serif text-4xl text-purple-100' : 'font-serif text-4xl text-gray-800'}`}>
                {editingItem ? 'Edit Dream' : 'New Dream'}
              </h2>
              <button onClick={onClose} className={`${theme === 'dark' ? 'text-slate-400 hover:text-purple-200' : 'text-gray-400 hover:text-rose-500'}`}><X /></button>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-transparent border-b-2 border-dashed outline-none font-handwriting text-3xl focus:border-rose-400 pb-1 ${theme === 'dark' ? 'border-slate-700 text-slate-200' : 'border-gray-300 text-gray-800'}`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full bg-transparent border-b-2 font-serif text-lg outline-none ${theme === 'dark' ? 'border-slate-700 text-slate-200' : 'border-gray-300 text-gray-800'}`}
                  >
                    {categories.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                    className={`w-full bg-transparent border-b-2 font-serif text-lg outline-none ${theme === 'dark' ? 'border-slate-700 text-slate-200' : 'border-gray-300 text-gray-800'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-rose-500 text-white font-handwriting text-3xl shadow-md hover:bg-rose-600 transition-all"
              >
                {editingItem ? 'Update' : 'Commit to Diary'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};