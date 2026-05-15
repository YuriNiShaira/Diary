// frontend/src/components/QuizGame.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, RotateCcw, User, Plus, Edit, Trash2, X,
  Lightbulb, Brain, Star, Zap, Award, Shuffle, CheckCircle, XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
  difficulty_display: string;
  category: string;
  category_display: string;
  points: number;
  created_by: string;
  hint: string;
  is_used: boolean;
  year: number;
}

interface QuizGameProps {
  yearId: number;
  yearNumber: number;
  onBack: () => void;
  currentScore?: any;
  onReset: () => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ yearId, yearNumber, onBack, currentScore, onReset }) => {
  const { user } = useAuth();
  const displayName = user?.display_name || 'You';
  const partnerName = user?.partner_name || 'Partner';

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'me' | 'shaira'>('me');
  
  const [questionForm, setQuestionForm] = useState({
    question: '', answer: '', difficulty: 'easy', category: 'about_me',
    created_by: 'me', hint: '',
  });

  const queryClient = useQueryClient();

  const { data: questions } = useQuery<QuizQuestion[]>({
    queryKey: ['quizQuestions', yearId],
    queryFn: async () => {
      const response = await api.get(`/quiz-questions/?year=${yearId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const { data: unusedQuestions } = useQuery<QuizQuestion[]>({
    queryKey: ['unusedQuestions', yearId],
    queryFn: async () => {
      const response = await api.get(`/quiz-questions/?year=${yearId}&unused=true`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/quiz-questions/', { ...data, year: yearId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions', yearId] });
      queryClient.invalidateQueries({ queryKey: ['unusedQuestions', yearId] });
      toast.success('Question added! 🎯');
      setIsQuestionModalOpen(false);
      resetForm();
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/quiz-questions/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions', yearId] });
      queryClient.invalidateQueries({ queryKey: ['unusedQuestions', yearId] });
      toast.success('Question updated! ✏️');
      setIsQuestionModalOpen(false);
      resetForm();
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/quiz-questions/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizQuestions', yearId] });
      queryClient.invalidateQueries({ queryKey: ['unusedQuestions', yearId] });
      toast.success('Question deleted');
    },
  });

  const answerQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/quiz-scores/answer_question/', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', yearId] });
      setAnswerResult({ correct: data.correct, message: data.message });
      
      if (data.correct) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => {
          setCurrentPlayer(currentPlayer === 'me' ? 'shaira' : 'me');
          setCurrentQuestion(null);
          setAnswerResult(null);
          setUserAnswer('');
          setShowHint(false);
        }, 2000);
      }
    },
  });

  const getRandomQuestion = () => {
    let filtered = unusedQuestions || [];
    if (selectedDifficulty !== 'all') filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    if (selectedCategory !== 'all') filtered = filtered.filter(q => q.category === selectedCategory);
    
    if (filtered.length === 0) {
      toast.error('No questions available with these filters! 📝');
      return;
    }
    
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentQuestion(random);
    setAnswerResult(null);
    setUserAnswer('');
    setShowHint(false);
  };

  const handleAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    answerQuestionMutation.mutate({
      year_id: yearId, question_id: currentQuestion.id,
      player: currentPlayer, answer: userAnswer
    });
  };

  const handleEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question, answer: question.answer,
      difficulty: question.difficulty, category: question.category,
      created_by: question.created_by, hint: question.hint || '',
    });
    setIsQuestionModalOpen(true);
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setQuestionForm({ question: '', answer: '', difficulty: 'easy', category: 'about_me', created_by: 'me', hint: '' });
  };

  const handleResetScore = () => {
    if (confirm('Reset all quiz scores? This will also reset all questions to unused!')) onReset();
  };

  const categories = [
    { value: 'about_me', label: `About ${displayName}` },
    { value: 'about_shaira', label: `About ${partnerName}` },
    { value: 'our_relationship', label: 'Our Relationship' },
    { value: 'fun_facts', label: 'Fun Facts' },
    { value: 'memories', label: 'Memories' },
    { value: 'other', label: 'Other' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', points: 1, color: 'from-green-400 to-emerald-400' },
    { value: 'medium', label: 'Medium', points: 3, color: 'from-yellow-400 to-amber-400' },
    { value: 'hard', label: 'Hard', points: 5, color: 'from-red-400 to-pink-400' },
  ];

  const filteredQuestions = questions?.filter(q => {
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-8">
      {/* Score Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">← Back to Games</button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">{displayName}</p>
            <p className="text-xl font-bold text-love-red">{currentScore?.my_score || 0}</p>
          </div>
          <button onClick={handleResetScore} className="p-2 text-gray-400 hover:text-gray-600" title="Reset Scores">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">{partnerName}</p>
            <p className="text-xl font-bold text-purple-500">{currentScore?.shaira_score || 0}</p>
          </div>
        </div>
      </div>

      {/* Current Player Turn */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif text-gray-800 mb-2">
          {currentPlayer === 'me' ? displayName : partnerName}'s Turn!
          {currentPlayer === 'me' ? ' ❤️' : ' ⭐'}
        </h3>
        <p className="text-gray-600">Answer correctly to earn points!</p>
      </div>

      {/* Question Display */}
      {currentQuestion ? (
        <div className="mb-6">
          <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${difficulties.find(d => d.value === currentQuestion.difficulty)?.color}`}>
                {currentQuestion.difficulty_display} ({currentQuestion.points} pts)
              </span>
              <span className="text-sm text-gray-500">{currentQuestion.category_display}</span>
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-4">{currentQuestion.question}</h4>
            
            {showHint && currentQuestion.hint && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-yellow-50 rounded-xl mb-4">
                <p className="text-sm text-gray-700">
                  <Lightbulb className="w-4 h-4 inline mr-1 text-yellow-500" /> Hint: {currentQuestion.hint}
                </p>
              </motion.div>
            )}
            
            <div className="space-y-3">
              <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnswer()}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red"
                disabled={!!answerResult} />
              
              {answerResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`p-3 rounded-xl flex items-center gap-2 ${answerResult.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {answerResult.correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {answerResult.message}
                </motion.div>
              )}
              
              <div className="flex gap-3">
                {!answerResult && (
                  <>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAnswer} className="flex-1 btn-romantic">Submit Answer</motion.button>
                    {currentQuestion.hint && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowHint(!showHint)} className="btn-soft">
                        <Lightbulb className="w-4 h-4" />
                      </motion.button>
                    )}
                  </>
                )}
                {answerResult && !answerResult.correct && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setCurrentQuestion(null); setAnswerResult(null); setUserAnswer(''); setShowHint(false); }}
                    className="flex-1 btn-soft">Try Another Question</motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-700 mb-2">Ready to Play?</h4>
          <p className="text-gray-500 mb-6">Pick a random question or create your own!</p>
        </div>
      )}

      {/* Game Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={getRandomQuestion}
          className="flex-1 btn-romantic flex items-center justify-center gap-2">
          <Shuffle className="w-4 h-4" /> Random Question
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setIsQuestionModalOpen(true); }}
          className="flex-1 btn-soft flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 border border-pink-200 rounded-lg text-sm">
          <option value="all">All Difficulties</option>
          {difficulties.map(d => <option key={d.value} value={d.value}>{d.label} ({d.points} pts)</option>)}
        </select>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-pink-200 rounded-lg text-sm flex-1">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Question Bank */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        <h4 className="font-medium text-gray-700 mb-2">Question Bank ({filteredQuestions?.length || 0})</h4>
        {filteredQuestions?.map((question) => (
          <div key={question.id} className="p-3 bg-white/60 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">{question.question}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${difficulties.find(d => d.value === question.difficulty)?.color}`}>{question.points} pts</span>
                <span className="text-xs text-gray-500">{question.is_used ? '✓ Used' : '○ Unused'}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(question)} className="p-1 text-gray-400 hover:text-love-red"><Edit className="w-3 h-3" /></button>
              <button onClick={() => deleteQuestionMutation.mutate(question.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Question Modal */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsQuestionModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif text-gray-800">{editingQuestion ? 'Edit Question' : 'Add New Question'} 📝</h2>
                <button onClick={() => setIsQuestionModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                editingQuestion ? updateQuestionMutation.mutate({ id: editingQuestion.id, data: questionForm }) : createQuestionMutation.mutate(questionForm);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                  <textarea value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    rows={3} className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red resize-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer *</label>
                  <input type="text" value={questionForm.answer} onChange={(e) => setQuestionForm({ ...questionForm, answer: e.target.value })}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg">
                      {difficulties.map(d => <option key={d.value} value={d.value}>{d.label} ({d.points} pts)</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select value={questionForm.category} onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg">
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                  <select value={questionForm.created_by} onChange={(e) => setQuestionForm({ ...questionForm, created_by: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg">
                    <option value="me">{displayName}</option>
                    <option value="shaira">{partnerName}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hint (Optional)</label>
                  <input type="text" value={questionForm.hint} onChange={(e) => setQuestionForm({ ...questionForm, hint: e.target.value })}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-love-red" placeholder="e.g., Starts with 'N'..." />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full btn-romantic">
                  {editingQuestion ? 'Update Question' : 'Add Question'} 💕
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizGame;