import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, RotateCcw, User, Timer, Sparkles, Camera,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import DeleteConfirmModal from './DeleteConfirmModal'; // ✅ import modal

interface Memory {
  id: number;
  title: string;
  image: string;
  year: number;
}

interface Card {
  id: number;
  memoryId: number;
  image: string;
  title: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameScore {
  id: number;
  game_name: string;
  my_score: number;
  shaira_score: number;
}

interface MemoryMatchGameProps {
  yearId: number;
  yearNumber: number;
  onBack: () => void;
  currentScore?: GameScore;
  onWin: (winner: string) => void;
  onReset: () => void;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  yearId, onBack, currentScore, onWin, onReset,
}) => {
  const { user } = useAuth();
  const displayName = user?.display_name || 'You';
  const partnerName = user?.partner_name || 'Partner';

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<'me' | 'shaira'>('me');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [myPairs, setMyPairs] = useState<number>(0);
  const [shairaPairs, setShairaPairs] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false); // ✅ modal state

  const { data: memories, isLoading } = useQuery<Memory[]>({
    queryKey: ['memoriesWithImages', yearId],
    queryFn: async () => {
      const response = await api.get(`/memories/?year=${yearId}`);
      const allMemories = Array.isArray(response.data) ? response.data : response.data.results || [];
      return allMemories.filter((m: Memory) => m.image);
    },
  });

  const completeGame = (finalMyPairs: number, finalShairaPairs: number) => {
    setIsTimerRunning(false);
    setGameCompleted(true);

    let winner: string;
    if (finalMyPairs > finalShairaPairs) {
      winner = 'me';
      setGameWinner(displayName);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    } else if (finalShairaPairs > finalMyPairs) {
      winner = 'shaira';
      setGameWinner(partnerName);
      toast.success(`${partnerName} wins! 💕`, { icon: '👑' });
    } else {
      winner = 'tie';
      setGameWinner('tie');
      toast("It's a tie! 🤝");
    }

    if (winner !== 'tie') onWin(winner);
  };

  const initializeGame = () => {
    if (!memories || memories.length < 2) return;
    const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    const shuffled = [...memories].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, pairCount);
    const gameCards: Card[] = [];

    selected.forEach((memory, index) => {
      gameCards.push({ id: index * 2 + 1, memoryId: memory.id, image: memory.image, title: memory.title, isFlipped: false, isMatched: false });
      gameCards.push({ id: index * 2 + 2, memoryId: memory.id, image: memory.image, title: memory.title, isFlipped: false, isMatched: false });
    });

    setCards([...gameCards].sort(() => Math.random() - 0.5));
    setFlippedIndexes([]);
    setMatchedPairs(0);
    setMyPairs(0);
    setShairaPairs(0);
    setCurrentPlayer('me');
    setGameStarted(true);
    setGameCompleted(false);
    setGameWinner(null);
    setTimer(0);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && !gameCompleted) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, gameCompleted]);

  useEffect(() => {
    if (flippedIndexes.length !== 2) return;
    const [firstIndex, secondIndex] = flippedIndexes;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];
    if (!firstCard || !secondCard) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (firstCard.memoryId === secondCard.memoryId) {
      timeout = setTimeout(() => {
        const updatedCards = [...cards];
        updatedCards[firstIndex] = { ...updatedCards[firstIndex], isMatched: true };
        updatedCards[secondIndex] = { ...updatedCards[secondIndex], isMatched: true };

        const newMatchedPairs = matchedPairs + 1;
        const newMyPairs = currentPlayer === 'me' ? myPairs + 1 : myPairs;
        const newShairaPairs = currentPlayer === 'shaira' ? shairaPairs + 1 : shairaPairs;
        const totalPairs = updatedCards.length / 2;

        setCards(updatedCards);
        setMatchedPairs(newMatchedPairs);
        setMyPairs(newMyPairs);
        setShairaPairs(newShairaPairs);
        setFlippedIndexes([]);

        if (newMatchedPairs === totalPairs) completeGame(newMyPairs, newShairaPairs);
      }, 500);
    } else {
      timeout = setTimeout(() => {
        const updatedCards = [...cards];
        updatedCards[firstIndex] = { ...updatedCards[firstIndex], isFlipped: false };
        updatedCards[secondIndex] = { ...updatedCards[secondIndex], isFlipped: false };
        setCards(updatedCards);
        setFlippedIndexes([]);
        setCurrentPlayer((prev) => (prev === 'me' ? 'shaira' : 'me'));
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [flippedIndexes]);

  const handleCardClick = (index: number) => {
    if (!gameStarted || gameCompleted) return;
    if (flippedIndexes.length === 2) return;
    if (!cards[index]) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndexes.includes(index)) return;

    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], isFlipped: true };
    setCards(updatedCards);
    setFlippedIndexes((prev) => [...prev, index]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetScore = () => {
    setShowResetModal(true);  // open modal instead of window.confirm
  };

  const confirmReset = () => {
    onReset();
    setShowResetModal(false);
  };

  const getGridCols = () => {
    // simplified; always 4 columns
    return 'grid-cols-4';
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-love-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading memories...</p>
        </div>
      </div>
    );
  }

  const memoriesWithImages = memories?.filter((m) => m.image) || [];
  const hasEnoughMemories = memoriesWithImages.length >= 2;

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
          <button onClick={handleResetScore} className="p-2 text-gray-400 hover:text-gray-600" title="Reset Score">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">{partnerName}</p>
            <p className="text-xl font-bold text-purple-500">{currentScore?.shaira_score || 0}</p>
          </div>
        </div>
      </div>

      {/* Game Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif text-gray-800 mb-2">Memory Match 🃏</h3>
        {gameStarted && !gameCompleted && (
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{formatTime(timer)}</span>
            </div>
            <div className={`flex items-center gap-2 ${currentPlayer === 'me' ? 'text-love-red' : 'text-purple-500'}`}>
              <User className="w-4 h-4" />
              <span className="font-medium">
                {currentPlayer === 'me' ? displayName : partnerName}'s Turn
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Not enough photos */}
      {!hasEnoughMemories ? (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Not enough photos!</h4>
          <p className="text-gray-500 mb-4">You need at least 2 memories with photos to play.</p>
          <p className="text-sm text-gray-400">Current photos: {memoriesWithImages.length}</p>
        </div>
      ) : !gameStarted ? (
        /* Start Screen */
        <div className="text-center py-8">
          <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Ready to test your memory?</h4>
          <div className="flex gap-3 justify-center mb-6">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-xl capitalize transition-all ${
                  difficulty === d ? 'bg-gradient-to-r from-love-red to-romantic-red text-white shadow-md' : 'bg-white/60 text-gray-600 hover:bg-white/80'
                }`}>
                {d} ({d === 'easy' ? '4' : d === 'medium' ? '6' : '8'} pairs)
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={initializeGame} className="btn-romantic">
            Start Game 🎮
          </motion.button>
        </div>
      ) : gameCompleted ? (
        /* Game Over */
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            {gameWinner === displayName ? '🏆' : gameWinner === partnerName ? '👑' : '🤝'}
          </motion.div>
          <h4 className="text-2xl font-serif text-gray-800 mb-2">
            {gameWinner === 'tie' ? "It's a Tie!" : `${gameWinner} Wins!`}
          </h4>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <p className="text-sm text-gray-500">{displayName}'s Pairs</p>
              <p className="text-3xl font-bold text-love-red">{myPairs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{partnerName}'s Pairs</p>
              <p className="text-3xl font-bold text-purple-500">{shairaPairs}</p>
            </div>
          </div>
          <p className="text-gray-500 mb-6">Time: {formatTime(timer)}</p>
          <div className="flex gap-3 justify-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={initializeGame} className="btn-romantic">Play Again 🔄</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setGameStarted(false)} className="btn-soft">Change Difficulty</motion.button>
          </div>
        </div>
      ) : (
        /* Game Board */
        <>
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">{displayName} ❤️</p>
              <p className="text-2xl font-bold text-love-red">{myPairs}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">{partnerName} ⭐</p>
              <p className="text-2xl font-bold text-purple-500">{shairaPairs}</p>
            </div>
          </div>
          <div className={`grid ${getGridCols()} gap-3 max-w-2xl mx-auto`}>
            {cards.map((card, index) => (
              <motion.button key={card.id}
                whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
                whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                onClick={() => handleCardClick(index)}
                className={`aspect-square rounded-xl transition-all duration-300 ${
                  card.isMatched ? 'opacity-60 cursor-default' : 'cursor-pointer shadow-md hover:shadow-lg'
                }`}
                disabled={card.isFlipped || card.isMatched || flippedIndexes.length === 2}
              >
                <AnimatePresence mode="wait">
                  {card.isFlipped || card.isMatched ? (
                    <motion.div key="front" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} exit={{ rotateY: 90 }} transition={{ duration: 0.3 }}
                      className="w-full h-full rounded-xl overflow-hidden">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                    </motion.div>
                  ) : (
                    <motion.div key="back" initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} exit={{ rotateY: -90 }} transition={{ duration: 0.3 }}
                      className="w-full h-full bg-gradient-to-br from-love-red to-romantic-red rounded-xl flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white fill-current" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { if (window.confirm('Quit current game?')) { setGameStarted(false); setIsTimerRunning(false); } }}
              className="btn-soft text-sm">Quit Game</motion.button>
          </div>
        </>
      )}

      {/* Reset Score Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="Reset Score"
        message="This will reset the score to 0-0. This action cannot be undone."
        loading={false}
      />
    </motion.div>
  );
};

export default MemoryMatchGame;