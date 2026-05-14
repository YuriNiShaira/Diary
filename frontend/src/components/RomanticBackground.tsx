// frontend/src/components/RomanticBackground.tsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

// Cherry blossom petal SVG component
const CherryBlossomPetal = ({ size, rotation, opacity, color }: { size: number; rotation: number; opacity: number; color?: string }) => {
  const petalColor = color || `rgba(255, 182, 193, ${0.6 + opacity * 0.3})`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity: opacity,
      }}
    >
      <path
        d="M50 15 C35 15 20 30 20 50 C20 70 35 85 50 95 C65 85 80 70 80 50 C80 30 65 15 50 15Z"
        fill={petalColor}
        stroke="rgba(255, 140, 170, 0.4)"
        strokeWidth="1.5"
      />
      <path
        d="M50 25 C42 30 38 40 38 50 C38 60 42 68 50 75 C58 68 62 60 62 50 C62 40 58 30 50 25Z"
        fill="rgba(255, 200, 210, 0.6)"
      />
      <line x1="50" y1="25" x2="50" y2="70" stroke="rgba(255, 100, 130, 0.3)" strokeWidth="1" />
      <line x1="40" y1="35" x2="60" y2="55" stroke="rgba(255, 100, 130, 0.2)" strokeWidth="0.8" />
      <line x1="60" y1="35" x2="40" y2="55" stroke="rgba(255, 100, 130, 0.2)" strokeWidth="0.8" />
    </svg>
  );
};

// Small simplified petal for distant ones
const SmallPetal = ({ size, rotation, opacity }: { size: number; rotation: number; opacity: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity: opacity,
      }}
    >
      <ellipse
        cx="30"
        cy="20"
        rx="12"
        ry="18"
        fill={`rgba(255, 182, 193, ${0.4 + opacity * 0.3})`}
        stroke="rgba(255, 140, 170, 0.3)"
        strokeWidth="1"
      />
      <ellipse
        cx="30"
        cy="20"
        rx="6"
        ry="12"
        fill="rgba(255, 220, 230, 0.5)"
      />
    </svg>
  );
};

const RomanticBackground: React.FC = () => {
  const { theme } = useTheme();

  // Dark mode stars
  const stars = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: `star-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      size: 1 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.7,
      duration: 2 + Math.random() * 5,
    })), []
  );

  // Light mode petals
  const { largePetals, mediumPetals, smallPetals, extraPetals } = useMemo(() => {
    const petalColors = [
      'rgba(255, 182, 193, 0.7)',
      'rgba(255, 192, 203, 0.65)',
      'rgba(255, 200, 210, 0.7)',
      'rgba(255, 170, 190, 0.6)',
      'rgba(255, 160, 180, 0.55)',
      'rgba(255, 210, 220, 0.75)',
    ];

    const largePetals = Array.from({ length: 15 }, (_, i) => ({
      id: `large-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 12,
      duration: 14 + Math.random() * 10,
      size: 28 + Math.random() * 24,
      rotation: Math.random() * 360,
      opacity: 0.5 + Math.random() * 0.4,
      sway: 60 + Math.random() * 80,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    }));

    const mediumPetals = Array.from({ length: 25 }, (_, i) => ({
      id: `medium-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: 11 + Math.random() * 8,
      size: 16 + Math.random() * 14,
      rotation: Math.random() * 360,
      opacity: 0.4 + Math.random() * 0.4,
      sway: 35 + Math.random() * 55,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    }));

    const smallPetals = Array.from({ length: 35 }, (_, i) => ({
      id: `small-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 7,
      size: 8 + Math.random() * 10,
      rotation: Math.random() * 360,
      opacity: 0.3 + Math.random() * 0.35,
      sway: 20 + Math.random() * 40,
    }));

    const extraPetals = Array.from({ length: 40 }, (_, i) => ({
      id: `extra-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 15,
      duration: 6 + Math.random() * 8,
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      opacity: 0.2 + Math.random() * 0.3,
      sway: 15 + Math.random() * 30,
    }));

    return { largePetals, mediumPetals, smallPetals, extraPetals };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {theme === 'dark' ? (
        <>
          {/* Dark gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #0d0a1a 0%, #1a1030 30%, #2d1a30 60%, #1a1020 100%)',
            }}
          />

          {/* Glowing stars */}
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: '#f0d0ff',
                boxShadow: `0 0 ${4 + Math.random() * 8}px ${1 + Math.random() * 3}px rgba(200, 150, 255, 0.6)`,
              }}
              animate={{
                opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Larger twinkling stars */}
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={`big-star-${i}`}
              className="absolute rounded-full"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                width: '3px',
                height: '3px',
                backgroundColor: '#ffb7c5',
                boxShadow: '0 0 12px 4px rgba(255, 183, 197, 0.5), 0 0 25px 8px rgba(200, 150, 255, 0.3)',
              }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 2.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      ) : (
        <>
          {/* Light gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #FFF5F5 0%, #FFE8EB 30%, #FFD9E2 60%, #FFC8D3 100%)',
            }}
          />

          {/* Cherry blossom overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-100/20 to-pink-200/30" />

          {/* Gentle sunlight glow */}
          <motion.div
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-100/20 blur-3xl"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
          />

          {/* Atmospheric orbs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pink-200/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-200/10 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Large petals */}
          {largePetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute will-change-transform"
              style={{
                left: petal.left,
                opacity: petal.opacity,
                filter: `blur(${petal.size > 35 ? '0.5px' : '0px'})`,
                zIndex: 30,
              }}
              initial={{ top: '-10%', x: 0, rotate: petal.rotation }}
              animate={{
                top: '110%',
                x: [0, petal.sway * 0.6, -petal.sway * 0.4, petal.sway * 0.2, 0],
              }}
              transition={{
                top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                x: { duration: petal.duration * 0.7, repeat: Infinity, delay: petal.delay, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] },
              }}
            >
              <CherryBlossomPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} color={petal.color} />
            </motion.div>
          ))}

          {/* Medium petals */}
          {mediumPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute will-change-transform"
              style={{ left: petal.left, zIndex: 20 }}
              initial={{ top: '-5%', x: 0, rotate: petal.rotation }}
              animate={{
                top: '110%',
                x: [0, -petal.sway * 0.5, petal.sway * 0.3, -petal.sway * 0.2, 0],
              }}
              transition={{
                top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                x: { duration: petal.duration * 0.6, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' },
              }}
            >
              <CherryBlossomPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} color={petal.color} />
            </motion.div>
          ))}

          {/* Small petals */}
          {smallPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute will-change-transform"
              style={{ left: petal.left, zIndex: 15 }}
              initial={{ top: '-5%', x: 0 }}
              animate={{
                top: '110%',
                x: [0, petal.sway * 0.4, -petal.sway * 0.3, petal.sway * 0.1],
              }}
              transition={{
                top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                x: { duration: petal.duration * 0.5, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' },
              }}
            >
              <SmallPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} />
            </motion.div>
          ))}

          {/* Extra tiny petals */}
          {extraPetals.map((petal) => (
            <motion.div
              key={petal.id}
              className="absolute will-change-transform"
              style={{ left: petal.left, zIndex: 10 }}
              initial={{ top: '-5%', x: 0 }}
              animate={{
                top: '110%',
                x: [0, petal.sway * 0.3, -petal.sway * 0.2, petal.sway * 0.1],
              }}
              transition={{
                top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                x: { duration: petal.duration * 0.4, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' },
              }}
            >
              <SmallPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} />
            </motion.div>
          ))}

          {/* Wind-blown petals */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`wind-petal-${i}`}
              className="absolute will-change-transform"
              style={{ top: `${Math.random() * 100}%`, zIndex: 12 }}
              initial={{ left: '-10%', rotate: Math.random() * 360 }}
              animate={{
                left: '110%',
                y: [0, Math.random() * 30 - 15, Math.random() * 20 - 10, 0],
                rotate: [0, Math.random() * 180, Math.random() * 360],
              }}
              transition={{
                left: { duration: 12 + Math.random() * 8, repeat: Infinity, delay: i * 1.5, ease: 'linear' },
                y: { duration: 4 + Math.random() * 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut', repeatType: 'reverse' },
                rotate: { duration: 6 + Math.random() * 4, repeat: Infinity, ease: 'linear' },
              }}
            >
              <SmallPetal size={6 + Math.random() * 12} rotation={Math.random() * 360} opacity={0.4 + Math.random() * 0.4} />
            </motion.div>
          ))}

          {/* Floating petals */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`floating-${i}`}
              className="absolute"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, zIndex: 8 }}
              animate={{
                y: [-30, 30, -20, 25, -30],
                x: [-15, 20, -10, 15, -15],
                rotate: [0, 180, 360],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{ duration: 12 + Math.random() * 8, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
            >
              <SmallPetal size={5 + Math.random() * 10} rotation={Math.random() * 360} opacity={0.2 + Math.random() * 0.3} />
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

export default RomanticBackground;