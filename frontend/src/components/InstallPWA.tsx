import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scissors } from 'lucide-react';

// Washi Tape to hold the coupon up!
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-rose-200/80', className = '' }) => (
  <div className={`absolute -top-4 w-28 h-8 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20 ${className}`} 
       style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 100%, 0% 96%)' }} 
  />
);

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Detect if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) return;

    // Show custom prompt for iOS slightly delayed
    if (isIosDevice) {
      setTimeout(() => setShowBanner(true), 1500);
    }

    // Handle Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 1500);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          // Slides down from the top just like the previous one
          initial={{ opacity: 0, y: -100, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 1 }}
          exit={{ opacity: 0, y: -100, rotate: 3 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none"
        >
          <div className="pointer-events-auto relative w-full max-w-md transform rotate-1 transition-transform hover:rotate-0">
            
            {/* The Washi Tape */}
            <WashiTape rotate="-rotate-3" color="bg-amber-100/90" className="left-1/2 -translate-x-1/2 -top-3 w-28" />

            {/* Outer Paper Shadow */}
            <div className="bg-[#fffdf8] p-1.5 shadow-[0_15px_30px_rgba(0,0,0,0.15)] rounded-sm border border-gray-200">
              
              {/* Dashed Coupon Border */}
              <div className="relative border-2 border-dashed border-gray-400 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 bg-[#fffaf5]">
                
                {/* Cute Scissors cutting the coupon line */}
                <div className="absolute -top-3.5 -left-3.5 bg-[#fffdf8] px-1 transform -rotate-45 text-gray-400">
                  <Scissors className="w-5 h-5" />
                </div>

                {/* Close Button overlapping the top right border */}
                <button 
                  onClick={handleClose} 
                  className="absolute -top-3 -right-3 w-7 h-7 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-colors z-30"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left Side: Coupon Details */}
                <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0">
                  <div className="inline-block px-2 py-0.5 border border-rose-200 bg-rose-50 text-rose-500 font-serif text-[10px] font-bold tracking-widest uppercase mb-1.5">
                    One-Time Voucher
                  </div>
                  <h3 className="font-handwriting text-3xl text-gray-800 leading-none mb-1">
                    Lifetime Pass
                  </h3>
                  <p className="font-serif text-xs text-gray-500 leading-relaxed">
                    {isIOS 
                      ? "Tap Share ➔ Add to Home Screen to redeem this voucher." 
                      : "Keep LogOfUs on your home screen. Valid for unlimited memories."}
                  </p>
                </div>

                {/* Right Side: Action Button */}
                {!isIOS ? (
                  <button
                    onClick={handleInstall}
                    className="w-full sm:w-auto mt-1 sm:mt-0 whitespace-nowrap px-6 py-2 bg-rose-500 text-white font-handwriting text-2xl rounded-sm hover:bg-rose-600 shadow-sm transform -rotate-2 hover:rotate-0 transition-all"
                  >
                    Redeem
                  </button>
                ) : (
                  // Decorative stamp for iOS users since they have to use the browser menu
                  <div className="hidden sm:flex w-16 h-16 border-2 border-rose-300/50 rounded-full items-center justify-center transform rotate-12">
                    <span className="font-handwriting text-rose-400/50 text-xl">Valid</span>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;