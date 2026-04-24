// frontend/src/components/GamesArena.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  RotateCcw,
  Crown,
  Grid3x3,
  Brain,
  User,
  Image, // ✅ Use this for Memory Match instead of duplicate Grid3x3
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import QuizGame from './QuizGame';
import MemoryMatchGame from './MemoryMatchGame';
// ✅ Remove: import WouldYouRatherGame from './WouldYouRatherGame';

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

// ✅ Remove 'wouldyourather' from type
type GameType = 'tictactoe' | 'quiz' | 'memorymatch' | 'menu';

const GamesArena: React.FC<GamesArenaProps> = ({ yearId, yearNumber }) => {
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const queryClient = useQueryClient();

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
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success('You won! 🎉', { icon: '🏆' });
      } else {
        toast.success('Shaira won! 💕', { icon: '👑' });
      }
    },
  });

  const resetGameMutation = useMutation({
    mutationFn: async (gameName: string) => {
      const existingScore = leaderboard?.games?.find((g) => g.game_name === gameName);

      if (existingScore) {
        const response = await api.put(`/game-scores/${existingScore.id}/`, {
          year: yearId,
          game_name: gameName,
          my_score: 0,
          shaira_score: 0,
        });
        return response.data;
      } else {
        const response = await api.post('/game-scores/', {
          year: yearId,
          game_name: gameName,
          my_score: 0,
          shaira_score: 0,
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', yearId] });
      toast.success('Score reset! 🔄');
    },
  });

  const games = [
    {
      id: 'tictactoe' as GameType,
      name: 'Tic Tac Toe',
      icon: Grid3x3,
      color: 'from-pink-400 to-rose-400',
      description: "Classic game of X's and O's... but make it romantic! 💕",
    },
    {
      id: 'quiz' as GameType,
      name: "Couple's Quiz",
      icon: Brain,
      color: 'from-purple-400 to-indigo-400',
      description: 'Test how well you know each other! Answer questions to earn points! 💑',
    },
    {
      id: 'memorymatch' as GameType,
      name: 'Memory Match',
      icon: Image, // ✅ Different icon now
      color: 'from-blue-400 to-cyan-400',
      description: 'Match your favorite photos! Test your memory with your special moments! 📸',
    },
    // ✅ Removed wouldyourather game
  ];

  return (
    <div className="space-y-6">
      {/* Header with Scoreboard */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-serif text-gray-800">
            Games Arena {yearNumber} 🎮
          </h2>
          <p className="text-gray-500 mt-1">Who's winning this year?</p>
        </div>

        {/* Overall Scoreboard */}
        <div className="glass-card rounded-2xl px-6 py-3 flex items-center gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <User className="w-3 h-3" /> Yuri
            </p>
            <p className="text-2xl font-bold text-love-red">{leaderboard?.my_total || 0}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">VS</p>
            {leaderboard?.leader === 'me' && (
              <Crown className="w-4 h-4 text-yellow-500 mx-auto" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Heart className="w-3 h-3" /> Shaira
            </p>
            <p className="text-2xl font-bold text-purple-500">
              {leaderboard?.shaira_total || 0}
            </p>
          </div>

          {leaderboard?.leader === 'shaira' && (
            <Crown className="w-5 h-5 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Game Menu or Active Game */}
      {activeGame === 'menu' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {games.map((game) => {
            const Icon = game.icon;
            const score = leaderboard?.games?.find((g) => g.game_name === game.id);

            return (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.02 }}
                className="glass-card rounded-2xl p-8 cursor-pointer"
                onClick={() => setActiveGame(game.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${game.color}`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {score && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Current Score</p>
                      <p className="text-lg font-bold">
                        <span className="text-love-red">{score.my_score}</span>
                        <span className="text-gray-400 mx-2">-</span>
                        <span className="text-purple-500">{score.shaira_score}</span>
                      </p>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">{game.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{game.description}</p>

                <div className="flex items-center text-love-red text-sm font-medium">
                  Play Now →
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : activeGame === 'tictactoe' ? (
        <TicTacToeGame
          onBack={() => setActiveGame('menu')}
          onWin={(winner) =>
            recordWinMutation.mutate({ gameName: 'tictactoe', winner })
          }
          currentScore={leaderboard?.games?.find((g) => g.game_name === 'tictactoe')}
          onReset={() => resetGameMutation.mutate('tictactoe')}
        />
      ) : activeGame === 'quiz' ? (
        <QuizGame
          yearId={yearId}
          yearNumber={yearNumber}
          onBack={() => setActiveGame('menu')}
          currentScore={leaderboard?.games?.find((g) => g.game_name === 'quiz')}
          onReset={() => resetGameMutation.mutate('quiz')}
        />
      ) : activeGame === 'memorymatch' ? (
        <MemoryMatchGame
          yearId={yearId}
          yearNumber={yearNumber}
          onBack={() => setActiveGame('menu')}
          onWin={(winner) =>
            recordWinMutation.mutate({ gameName: 'memorymatch', winner })
          }
          currentScore={leaderboard?.games?.find((g) => g.game_name === 'memorymatch')}
          onReset={() => resetGameMutation.mutate('memorymatch')}
        />
      ) : null}
    </div>
  );
};

// Tic Tac Toe Component
interface TicTacToeProps {
  onBack: () => void;
  onWin: (winner: string) => void;
  currentScore?: GameScore;
  onReset: () => void;
}

const TicTacToeGame: React.FC<TicTacToeProps> = ({
  onBack,
  onWin,
  currentScore,
  onReset,
}) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [hasRecordedWin, setHasRecordedWin] = useState(false);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

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
      const winnerName = gameWinner === '❤️' ? 'me' : 'shaira';
      onWin(winnerName);
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

  const handleResetScore = () => {
    if (window.confirm('Reset the score to 0-0?')) {
      onReset();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          ← Back to Games
        </button>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Yuri ❤️</p>
            <p className="text-xl font-bold text-love-red">{currentScore?.my_score || 0}</p>
          </div>

          <button
            onClick={handleResetScore}
            className="p-2 text-gray-400 hover:text-gray-600"
            title="Reset Score"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">Shaira ⭐</p>
            <p className="text-xl font-bold text-purple-500">
              {currentScore?.shaira_score || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif text-gray-800 mb-2">
          {winner
            ? `${winner === '❤️' ? 'Yuri' : 'Shaira'} Won! 🎉`
            : `Turn: ${isXNext ? 'Yuri' : "Shaira's"} turn ${isXNext ? '❤️' : '⭐'}`}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
        {board.map((cell, index) => (
          <motion.button
            key={index}
            whileHover={!cell && !winner ? { scale: 1.05 } : {}}
            whileTap={!cell && !winner ? { scale: 0.95 } : {}}
            onClick={() => handleClick(index)}
            className={`
              w-24 h-24 rounded-2xl text-4xl flex items-center justify-center
              transition-all duration-200
              ${
                winningLine?.includes(index)
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 shadow-lg'
                  : 'bg-white/60 backdrop-blur-sm hover:bg-white/80'
              }
              ${!cell && !winner ? 'cursor-pointer' : 'cursor-default'}
              border border-pink-100
            `}
          >
            {cell}
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="btn-soft"
        >
          New Game
        </motion.button>
      </div>
    </motion.div>
  );
};

export default GamesArena;