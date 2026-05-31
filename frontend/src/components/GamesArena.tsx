import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  RotateCcw,
  Crown,
  Grid3x3,
  Image as ImageIcon,
  ArrowLeft,
  Trophy
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import MemoryMatchGame from './MemoryMatchGame';
import DeleteConfirmModal from './DeleteConfirmModal';

interface GameScore {
  id: number;
  game_name: string;
  my_score: number;
  shaira_score: number;
  year: number;
}

interface LeaderboardData {
  my_total: number;
  shaira_total: number;
  leader: string;
  games: GameScore[];
}

interface GamesArenaProps {
  yearId: number;
  yearNumber: number;
}

type GameType = 'tictactoe' | 'memorymatch' | 'menu';

const GamesArena: React.FC<GamesArenaProps> = ({ yearId, yearNumber }) => {
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme } = useTheme();

  const displayName = user?.display_name || 'You';
  const partnerName = user?.partner_name || 'Partner';

  const { data: leaderboard } = useQuery<LeaderboardData>({
    queryKey: ['leaderboard', yearId],
    queryFn: async () => {
      const response = await api.get(`/game-scores/leaderboard/?year_id=${yearId}`);
      return response.data;
    },
  });

  const recordWinMutation = useMutation({
    mutationFn: async ({ gameName, winner }: { gameName: string; winner: string }) => {
      const response = await api.post('/game-scores/record_win/', {
        year_id: yearId,
        game_name: gameName,
        winner,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', yearId] });

      if (variables.winner === 'me') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success(`${displayName} won! 🎉`, { icon: '🏆' });
      } else {
        toast.success(`${partnerName} won! 💕`, { icon: '👑' });
      }
    },
  });

  const resetGameMutation = useMutation({
    mutationFn: async (gameName: string) => {
      const existingScore = leaderboard?.games?.find((g) => g.game_name === gameName);
      if (existingScore) {
        const response = await api.put(`/game-scores/${existingScore.id}/`, {
          year: yearId, game_name: gameName, my_score: 0, shaira_score: 0,
        });
        return response.data;
      } else {
        const response = await api.post('/game-scores/', {
          year: yearId, game_name: gameName, my_score: 0, shaira_score: 0,
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', yearId] });
      toast.success('Scoreboard erased! 🔄');
      setResetTarget(null);
    },
  });

  const handleResetScore = (gameName: string) => {
    setResetTarget(gameName);
  };

  const games = [
    {
      id: 'tictactoe' as GameType,
      name: 'Tic Tac Toe',
      icon: Grid3x3,
      color: 'text-rose-500',
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      border: 'border-rose-200 dark:border-rose-800',
      description: "The classic game of X's and O's... but make it romantic! 💕",
    },
    {
      id: 'memorymatch' as GameType,
      name: 'Memory Match',
      icon: ImageIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      description: 'Test your memory using your favorite moments together! 📸',
    },
  ];

  const bgMain = theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#fdfbf7]';
  const textMain = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSub = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const cardBg = theme === 'dark' ? 'bg-[#222] border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`space-y-8 max-w-5xl mx-auto p-4 sm:p-8 ${bgMain} rounded-sm min-h-screen transition-colors duration-300 shadow-sm border border-gray-200/50 relative overflow-hidden`}>
      
      {/* Soft glowing ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-96 bg-gradient-to-b from-rose-100/40 via-amber-100/20 to-transparent dark:from-rose-900/10 dark:via-amber-900/5 dark:to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Header & Overall Scoreboard */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-gray-300 dark:border-gray-800">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest ${textSub} mb-1`}>Playful Moments</p>
          <h2 className={`text-4xl sm:text-5xl font-serif tracking-tight ${textMain}`}>
            Games & Wagers <span className="text-rose-500/80 font-light italic">{yearNumber}</span>
          </h2>
        </div>

        {/* Journal Ledger Scoreboard */}
        <div className={`flex items-center gap-6 px-8 py-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${cardBg}`}>
          <div className="text-center relative">
            {leaderboard?.leader === 'me' && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-500" />}
            <p className={`text-[10px] font-bold uppercase tracking-widest ${textSub} mb-1`}>{displayName}</p>
            <p className="text-4xl font-handwriting text-blue-500">{leaderboard?.my_total || 0}</p>
          </div>
          
          <div className="flex flex-col items-center px-4 border-x border-dashed border-gray-300 dark:border-gray-700">
            <Trophy className={`w-5 h-5 mb-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
            <span className={`text-xs font-serif italic ${textSub}`}>Total Score</span>
          </div>
          
          <div className="text-center relative">
            {leaderboard?.leader === 'shaira' && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-500" />}
            <p className={`text-[10px] font-bold uppercase tracking-widest ${textSub} mb-1`}>{partnerName}</p>
            <p className="text-4xl font-handwriting text-rose-500">{leaderboard?.shaira_total || 0}</p>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <AnimatePresence mode="wait">
        {activeGame === 'menu' ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
          >
            {games.map((game) => {
              const Icon = game.icon;
              const score = leaderboard?.games?.find((g) => g.game_name === game.id);
              
              return (
                <motion.div 
                  key={game.id} 
                  whileHover={{ scale: 1.02, y: -4 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveGame(game.id)}
                  className={`p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all border group ${cardBg}`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${game.bg} ${game.border} border shadow-inner transform group-hover:rotate-6 transition-transform`}>
                      <Icon className={`w-8 h-8 ${game.color}`} />
                    </div>
                    
                    {score && (
                      <div className={`px-4 py-2 rounded-xl text-right border border-dashed ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-[#faf8f5] border-gray-300'}`}>
                        <p className={`text-[9px] uppercase font-bold tracking-widest ${textSub} mb-1`}>Ledger</p>
                        <p className="text-2xl font-handwriting">
                          <span className="text-blue-500">{score.my_score}</span>
                          <span className={textSub}> - </span>
                          <span className="text-rose-500">{score.shaira_score}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-serif mb-2 ${textMain}`}>{game.name}</h3>
                  <p className={`text-sm leading-relaxed mb-6 ${textSub}`}>{game.description}</p>
                  
                  <div className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${game.color}`}>
                    Play Now <span className="text-lg leading-none">→</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : activeGame === 'tictactoe' ? (
          <TicTacToeGame
            key="tictactoe"
            onBack={() => setActiveGame('menu')}
            onWin={(winner) => recordWinMutation.mutate({ gameName: 'tictactoe', winner })}
            currentScore={leaderboard?.games?.find((g) => g.game_name === 'tictactoe')}
            onReset={() => handleResetScore('tictactoe')}
            theme={theme}
            displayName={displayName}
            partnerName={partnerName}
          />
        ) : activeGame === 'memorymatch' ? (
          <motion.div key="memorymatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MemoryMatchGame
              yearId={yearId}
              yearNumber={yearNumber}
              onBack={() => setActiveGame('menu')}
              onWin={(winner) => recordWinMutation.mutate({ gameName: 'memorymatch', winner })}
              currentScore={leaderboard?.games?.find((g) => g.game_name === 'memorymatch')}
              onReset={() => handleResetScore('memorymatch')}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={() => {
          if (resetTarget) resetGameMutation.mutate(resetTarget);
        }}
        title="Erase Scoreboard"
        message="This will wipe the ledger clean and reset the score to 0-0. Are you sure?"
        loading={resetGameMutation.isPending}
      />
    </div>
  );
};

// --- Tic Tac Toe Component ---
interface TicTacToeProps {
  onBack: () => void;
  onWin: (winner: string) => void;
  currentScore?: GameScore;
  onReset: () => void;
  theme: string;
  displayName: string;
  partnerName: string;
}

const TicTacToeGame: React.FC<TicTacToeProps> = ({ onBack, onWin, currentScore, onReset, theme, displayName, partnerName }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [hasRecordedWin, setHasRecordedWin] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningLine(lines[i]);
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? '❤️' : '⭐';
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner && !hasRecordedWin) {
      setWinner(gameWinner);
      setHasRecordedWin(true);
      onWin(gameWinner === '❤️' ? 'me' : 'shaira');
    } else if (!newBoard.includes(null) && !gameWinner) {
      toast("It's a tie! 🤝");
    }
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setHasRecordedWin(false);
  };

  const textMain = theme === 'dark' ? 'text-gray-100' : 'text-gray-800';
  const textSub = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const paperBg = theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-[#faf8f5]';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl p-6 sm:p-10 shadow-sm border ${theme === 'dark' ? 'bg-[#222] border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <button onClick={onBack} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${textSub} hover:${textMain}`}>
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        
        <div className={`flex items-center gap-6 px-6 py-2 rounded-xl border border-dashed ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-700' : 'bg-[#faf8f5] border-gray-300'}`}>
          <div className="text-center">
            <p className={`text-[10px] uppercase font-bold tracking-widest ${textSub}`}>{displayName}</p>
            <p className="text-3xl font-handwriting text-blue-500">{currentScore?.my_score || 0}</p>
          </div>
          
          <button onClick={() => setShowResetModal(true)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-200 text-gray-400'}`} title="Erase Ledger">
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <p className={`text-[10px] uppercase font-bold tracking-widest ${textSub}`}>{partnerName}</p>
            <p className="text-3xl font-handwriting text-rose-500">{currentScore?.shaira_score || 0}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className={`text-3xl font-serif ${textMain}`}>
          {winner
            ? `${winner === '❤️' ? displayName : partnerName} claims victory! 🎉`
            : `It's ${isXNext ? displayName : partnerName}'s turn ${isXNext ? '❤️' : '⭐'}`}
        </h3>
      </div>

      {/* Journal Paper Dotted Background for the Board */}
      <div className={`max-w-md mx-auto p-8 rounded-sm ${paperBg} border border-gray-200 dark:border-gray-800 shadow-inner`}
        style={{
          backgroundImage: theme === 'dark' ? 'radial-gradient(#444 1px, transparent 1px)' : 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* The Grid lines are created by the gap and the background color of the container */}
        <div className={`grid grid-cols-3 gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
          {board.map((cell, index) => (
            <motion.button 
              key={index}
              whileHover={!cell && !winner ? { scale: 1.05 } : {}}
              whileTap={!cell && !winner ? { scale: 0.95 } : {}}
              onClick={() => handleClick(index)}
              className={`w-full aspect-square text-5xl sm:text-6xl flex items-center justify-center transition-colors
                ${winningLine?.includes(index) 
                  ? 'bg-yellow-100 dark:bg-yellow-900/40' 
                  : theme === 'dark' ? 'bg-[#222] hover:bg-[#2a2a2a]' : 'bg-white hover:bg-gray-50'
                } 
                ${!cell && !winner ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {cell && (
                <motion.span 
                  initial={{ scale: 0, rotate: -45 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  transition={{ type: "spring" }}
                >
                  {cell}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={resetGame} 
          className="px-8 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-semibold shadow-md hover:opacity-90 transition-opacity"
        >
          Draw a new grid
        </motion.button>
      </div>

      <DeleteConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => { onReset(); setShowResetModal(false); }}
        title="Erase Tic Tac Toe Ledger"
        message="This will reset the Tic Tac Toe score to 0-0. Continue?"
      />
    </motion.div>
  );
};

export default GamesArena;