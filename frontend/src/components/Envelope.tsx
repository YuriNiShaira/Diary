import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

interface LoveLetter {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

const floatingHearts = [
  { id: 1, left: "18%", delay: 0 },
  { id: 2, left: "32%", delay: 0.08 },
  { id: 3, left: "50%", delay: 0.16 },
  { id: 4, left: "68%", delay: 0.24 },
  { id: 5, left: "82%", delay: 0.32 },
];

const Envelope: React.FC = () => {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const { data: loveLetters, isLoading, isError } = useQuery<LoveLetter[]>({
    queryKey: ["loveLetters"],
    queryFn: async () => {
      const response = await api.get("/love-letters/active/");
      return response.data;
    },
  });

  const currentLetter = useMemo(() => {
    if (!loveLetters || loveLetters.length === 0) return null;
    return loveLetters[0];
  }, [loveLetters]);

  const handleEnvelopeClick = () => {
    if (!currentLetter || isAnimating) return;

    setIsAnimating(true);
    setIsEnvelopeOpen(true);

    setTimeout(() => {
      setShowMagic(true);
    }, 100);

    setTimeout(() => {
      setShowLetterPreview(true);
    }, 220);

    setTimeout(() => {
      setShowModal(true);
    }, 980);

    setTimeout(() => {
      setShowMagic(false);
      setShowLetterPreview(false);
      setIsEnvelopeOpen(false);
      setIsAnimating(false);
    }, 1160);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-10">
        <motion.button
          type="button"
          onClick={handleEnvelopeClick}
          disabled={!currentLetter || isAnimating}
          whileHover={!isAnimating ? { scale: 1.03, y: -6 } : {}}
          whileTap={!isAnimating ? { scale: 0.985 } : {}}
          className="relative h-[230px] w-[340px] cursor-pointer border-0 bg-transparent p-0"
        >
          <motion.div
            animate={
              isEnvelopeOpen
                ? {
                    y: -10,
                    scale: 1.02,
                    rotate: -1,
                  }
                : {
                    y: [0, -4, 0],
                    scale: 1,
                    rotate: 0,
                  }
            }
            transition={
              isEnvelopeOpen
                ? { duration: 0.35, ease: "easeOut" }
                : {
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
            className="relative h-full w-full"
          >
            {/* Background glow */}
            <motion.div
              animate={
                isEnvelopeOpen
                  ? { opacity: 1, scale: 1.08 }
                  : { opacity: [0.5, 0.8, 0.5], scale: [1, 1.02, 1] }
              }
              transition={
                isEnvelopeOpen
                  ? { duration: 0.35 }
                  : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
              }
              className="absolute inset-0 rounded-[32px] bg-pink-400/20 blur-2xl"
            />

            {/* Floating hearts / sparkles */}
            <AnimatePresence>
              {showMagic && (
                <>
                  {floatingHearts.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10, scale: 0.6 }}
                      animate={{ opacity: [0, 1, 0], y: -85, scale: [0.6, 1, 0.8] }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.9,
                        delay: item.delay,
                        ease: "easeOut",
                      }}
                      className="absolute top-[78px] z-[60]"
                      style={{ left: item.left }}
                    >
                      <Heart className="h-4 w-4 fill-current text-pink-400/90" />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.7, 1.05, 0.85],
                      rotate: [-12, 6, 12],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, delay: 0.12 }}
                    className="absolute left-[28%] top-[82px] z-[60]"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, rotate: 12 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.7, 1.05, 0.85],
                      rotate: [12, -6, -12],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, delay: 0.22 }}
                    className="absolute right-[28%] top-[76px] z-[60]"
                  >
                    <Sparkles className="h-4 w-4 text-pink-200" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Letter preview */}
            <AnimatePresence>
              {showLetterPreview && currentLetter && (
                <motion.div
                  initial={{ y: 42, scale: 0.9, opacity: 0, rotate: 0 }}
                  animate={{
                    y: -102,
                    scale: 1,
                    opacity: 1,
                    rotate: -2,
                  }}
                  exit={{
                    y: -128,
                    scale: 1.02,
                    opacity: 0,
                    rotate: -1,
                  }}
                  transition={{
                    duration: 0.72,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute left-1/2 top-[52px] z-40 w-[82%] -translate-x-1/2"
                >
                  <motion.div
                    animate={{
                      rotate: [-2, -1, -2],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="rounded-[22px] border border-rose-100 bg-gradient-to-b from-white to-rose-50 px-5 py-6 shadow-[0_24px_50px_rgba(15,23,42,0.16)]"
                  >
                    <div className="mb-3 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 shadow-sm">
                        <Heart className="h-5 w-5 fill-current text-pink-500" />
                      </div>
                    </div>

                    <h3 className="line-clamp-1 text-center text-lg font-bold text-rose-950">
                      {currentLetter.title}
                    </h3>

                    <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-pink-300 to-transparent" />

                    <p className="mt-3 line-clamp-3 text-center text-sm leading-6 text-gray-500">
                      {currentLetter.content}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main envelope body */}
            <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.24)]" />

            {/* Inner highlight */}
            <div className="absolute inset-[2px] rounded-[28px] bg-gradient-to-b from-white/20 to-transparent" />

            {/* Top flap */}
            <motion.div
              initial={false}
              animate={
                isEnvelopeOpen
                  ? {
                      rotateX: -172,
                      y: -4,
                    }
                  : {
                      rotateX: 0,
                      y: 0,
                    }
              }
              transition={{
                duration: 0.72,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="absolute left-0 top-0 z-30 h-[118px] w-full origin-top"
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background:
                    "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #be185d 100%)",
                  borderTopLeftRadius: "30px",
                  borderTopRightRadius: "30px",
                  boxShadow: "0 14px 24px rgba(0,0,0,0.10)",
                }}
              />
            </motion.div>

            {/* Front pocket */}
            <div className="absolute bottom-0 left-0 z-20 h-[138px] w-full rounded-b-[30px] bg-gradient-to-br from-rose-100 via-pink-100 to-pink-200" />

            {/* Left fold */}
            <div
              className="absolute bottom-0 left-0 z-30 h-[138px] w-1/2"
              style={{
                clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.48), rgba(255,255,255,0.14))",
                borderBottomLeftRadius: "30px",
              }}
            />

            {/* Right fold */}
            <div
              className="absolute bottom-0 right-0 z-30 h-[138px] w-1/2"
              style={{
                clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.12))",
                borderBottomRightRadius: "30px",
              }}
            />

            {/* Bottom center fold */}
            <div
              className="absolute bottom-0 left-1/2 z-30 h-[92px] w-[190px] -translate-x-1/2"
              style={{
                clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                background: "rgba(255,255,255,0.24)",
              }}
            />

            {/* Shine */}
            <div className="absolute left-5 top-4 z-10 h-20 w-28 rounded-full bg-white/18 blur-xl" />

            {/* Text content */}
            <motion.div
              animate={
                isEnvelopeOpen
                  ? { opacity: 0, y: 10, scale: 0.98 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={{ duration: 0.22 }}
              className="absolute inset-0 z-40 flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <motion.div
                  animate={!isEnvelopeOpen ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-md"
                >
                  <Heart className="h-7 w-7 fill-current text-pink-500" />
                </motion.div>

                <div>
                  <p className="text-xl font-semibold text-rose-950">
                    {isLoading
                      ? "Loading letter..."
                      : isError
                      ? "Failed to load"
                      : currentLetter
                      ? "Open my letter 💌"
                      : "No letter yet"}
                  </p>

                  <p className="mt-1 text-sm text-rose-900/70">
                    {currentLetter
                      ? "Tap to read something sweet"
                      : "Create a love letter first! ✨"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {showModal && currentLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 42, scale: 0.92, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl rounded-[30px] border border-white/40 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-24 rounded-t-[30px] bg-gradient-to-r from-rose-100 via-pink-50 to-rose-100" />

              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 transition hover:bg-pink-50 hover:text-pink-500"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative mb-5 flex flex-col items-center text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 shadow-sm">
                  <Heart className="h-8 w-8 fill-current text-pink-500" />
                </div>

                <h2 className="text-3xl font-bold text-rose-950">
                  {currentLetter.title}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {new Date(currentLetter.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-rose-100 bg-rose-50/80 p-6 shadow-inner">
                <p className="whitespace-pre-line text-[15px] leading-8 text-gray-700">
                  {currentLetter.content}
                </p>
              </div>

              <div className="mt-5 text-center">
                <p className="text-sm font-medium text-pink-500">
                  With love, always ♡
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Envelope;