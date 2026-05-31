import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, RotateCcw, User, Timer, Sparkles, Camera, ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useTheme } from '../contexts/ThemeContext'

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
  const { theme } = useTheme();
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
  const [showResetModal, setShowResetModal] = useState(false);

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
    setShowResetModal(true);
  };

  const confirmReset = () => {
    onReset();
    setShowResetModal(false);
  };

  const getGridCols = () => {
    return 'grid-cols-4';
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl p-10 shadow-sm border bg-[#fffaf6] border-gray-200 dark:bg-[#1e1a1b] dark:border-gray-800">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-handwriting text-2xl text-gray-500">Dusting off the photo album...</p>
        </div>
      </div>
    );
  }

  const memoriesWithImages = memories?.filter((m) => m.image) || [];
  const hasEnoughMemories = memoriesWithImages.length >= 2;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl p-6 sm:p-10 shadow-sm border bg-[#fffaf6] border-gray-200 dark:bg-[#1e1a1b] dark:border-gray-800"
    >
      {/* Score Header - Ledger Style */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        
        <div className="flex items-center gap-6 px-6 py-2 rounded-xl border border-dashed bg-[#faf8f5] border-gray-300 dark:bg-[#1a1a1a] dark:border-gray-700">
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400">{displayName}</p>
            <p className="text-3xl font-handwriting text-blue-500">{currentScore?.my_score || 0}</p>
          </div>
          
          <button onClick={handleResetScore} className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400" title="Erase Ledger">
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400">{partnerName}</p>
            <p className="text-3xl font-handwriting text-rose-500">{currentScore?.shaira_score || 0}</p>
          </div>
        </div>
      </div>

      {/* Game Title & Status */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-serif text-gray-900 dark:text-gray-100 mb-2">Memory Match</h3>
        
        <div className="h-6">
          {gameStarted && !gameCompleted && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-sm border border-yellow-200 dark:border-yellow-700/50 transform rotate-1">
                <Timer className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                <span className="font-handwriting text-xl text-yellow-700 dark:text-yellow-400">{formatTime(timer)}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-sm border transform -rotate-1 ${
                currentPlayer === 'me' 
                  ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400' 
                  : 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-400'
              }`}>
                <User className="w-4 h-4" />
                <span className="font-handwriting text-xl">
                  {currentPlayer === 'me' ? displayName : partnerName}'s Turn
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Not enough photos */}
      {!hasEnoughMemories ? (
        <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#1a1a1a]">
          <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h4 className="text-2xl font-serif text-gray-700 dark:text-gray-300 mb-2">Not enough photos!</h4>
          <p className="font-handwriting text-2xl text-gray-500 dark:text-gray-400 mb-4">You need at least 2 photo memories to play.</p>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Current photos: {memoriesWithImages.length}</p>
        </div>
      ) : !gameStarted ? (
        
        /* Start Screen */
        <div className="text-center py-12 max-w-lg mx-auto">
          <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
          <h4 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-8">Ready to test your memory?</h4>
          
          <div className="flex gap-4 justify-center mb-10 flex-wrap">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-5 py-2 rounded-sm font-handwriting text-2xl transition-all border-b-2 ${
                  difficulty === d 
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 transform -rotate-2' 
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300'
                }`}>
                {d} ({d === 'easy' ? '4' : d === 'medium' ? '6' : '8'} pairs)
              </button>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 1 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={initializeGame} 
            className="px-8 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-sm font-handwriting text-3xl shadow-md hover:shadow-lg transition-all"
          >
            Scatter the photos
          </motion.button>
        </div>
      ) : gameCompleted ? (
        
        /* Game Over */
        <div className="text-center py-10">
          <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="text-6xl mb-6">
            {gameWinner === displayName ? '🏆' : gameWinner === partnerName ? '👑' : '🤝'}
          </motion.div>
          <h4 className="text-4xl font-serif text-gray-900 dark:text-gray-100 mb-8">
            {gameWinner === 'tie' ? "It's a Tie!" : `${gameWinner} Claims Victory!`}
          </h4>
          
          <div className="flex justify-center gap-12 mb-8 bg-[#faf8f5] dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 p-6 rounded-sm max-w-sm mx-auto shadow-inner">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{displayName}</p>
              <p className="text-4xl font-handwriting text-blue-500">{myPairs}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{partnerName}</p>
              <p className="text-4xl font-handwriting text-rose-500">{shairaPairs}</p>
            </div>
          </div>
          
          <p className="font-handwriting text-2xl text-gray-500 dark:text-gray-400 mb-8">Completed in {formatTime(timer)}</p>
          
          <div className="flex gap-4 justify-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={initializeGame} 
              className="px-6 py-2 bg-rose-500 text-white rounded-sm font-handwriting text-2xl shadow-sm">
              Play Again
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setGameStarted(false)} 
              className="px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-sm font-handwriting text-2xl transition-colors hover:bg-gray-300 dark:hover:bg-gray-700">
              Settings
            </motion.button>
          </div>
        </div>
      ) : (
        
        /* Game Board (Journal Paper) */
        <>
          <div className="flex justify-center gap-12 mb-8 relative z-10">
            <div className="text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 px-4 py-2 rounded-sm transform -rotate-2 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">{displayName} ❤️</p>
              <p className="text-3xl font-handwriting text-blue-500">{myPairs}</p>
            </div>
            <div className="text-center bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 px-4 py-2 rounded-sm transform rotate-2 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-1">{partnerName} ⭐</p>
              <p className="text-3xl font-handwriting text-rose-500">{shairaPairs}</p>
            </div>
          </div>

          <div 
            className="p-6 md:p-8 rounded-sm bg-[#faf8f5] dark:bg-[#151515] border border-gray-200 dark:border-gray-800 shadow-inner mb-8"
            style={{
              backgroundImage: theme === 'dark' ? 'radial-gradient(#333 1px, transparent 1px)' : 'radial-gradient(#d1d5db 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            <div className={`grid ${getGridCols()} gap-3 sm:gap-4 max-w-2xl mx-auto`}>
              {cards.map((card, index) => (
                <motion.button key={card.id}
                  whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05, rotate: (index % 2 === 0 ? 2 : -2) } : {}}
                  whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square transition-all duration-300 ${
                    card.isMatched ? 'opacity-40 grayscale cursor-default scale-95' : 'cursor-pointer shadow-sm hover:shadow-md'
                  }`}
                  disabled={card.isFlipped || card.isMatched || flippedIndexes.length === 2}
                >
                  <AnimatePresence mode="wait">
                    {card.isFlipped || card.isMatched ? (
                      /* Card Front (Polaroid Style) */
                      <motion.div key="front" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} exit={{ rotateY: 90 }} transition={{ duration: 0.2 }}
                        className="w-full h-full bg-white dark:bg-gray-200 p-1 sm:p-2 pb-3 sm:pb-4 rounded-sm shadow-sm border border-gray-300 flex flex-col">
                        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img src={card.image} alt={card.title} className="w-full h-full object-cover filter contrast-105" />
                        </div>
                      </motion.div>
                    ) : (
                      /* Card Back (Textured Paper) */
                      <motion.div key="back" initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} exit={{ rotateY: -90 }} transition={{ duration: 0.2 }}
                        className="w-full h-full bg-rose-50 dark:bg-[#2a2425] border border-rose-200 dark:border-rose-900/50 rounded-sm flex items-center justify-center shadow-sm relative overflow-hidden">
                        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-300 dark:text-rose-800/80 fill-current opacity-50" />
                        {/* Subtle pattern for card back */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => { if (window.confirm('Pack up the cards and quit?')) { setGameStarted(false); setIsTimerRunning(false); } }}
              className="font-handwriting text-2xl text-gray-500 hover:text-red-500 transition-colors border-b border-transparent hover:border-red-300"
            >
              Quit Game
            </motion.button>
          </div>
        </>
      )}

      <DeleteConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="Erase Ledger"
        message="This will wipe the ledger clean and reset the score to 0-0. Are you sure?"
        loading={false}
      />
    </motion.div>
  );
};

export default MemoryMatchGame;