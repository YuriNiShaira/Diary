import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Download, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already running as a standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // 2. Detect iOS
    const iosDetected = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDetected);

    // 3. Handle Android / Chrome install trigger
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show if the user hasn't dismissed it manually this session
      if (!sessionStorage.getItem('pwa-banner-dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 4. For iOS, show banner automatically since Safari doesn't support beforeinstallprompt
    if (iosDetected && !sessionStorage.getItem('pwa-banner-dismissed')) {
      // Small timeout so it doesn't snap instantly on page load
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native browser install choice
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const dismissBanner = () => {
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="pointer-events-auto relative p-6 bg-[#fffdfa] border-2 border-dashed border-rose-200 shadow-[0_15px_30px_rgba(0,0,0,0.12)] text-left group"
          style={{ 
            borderRadius: '12px 2px 12px 12px',
            backgroundImage: 'radial-gradient(#fecdd3 0.75px, transparent 0.75px), radial-gradient(#fecdd3 0.75px, #fffdfa 0.75px)',
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        >
          {/* Close button */}
          <button 
            onClick={dismissBanner}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-4 items-start pr-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0 shadow-xs">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-100" />
            </div>

            <div>
              <h3 className="font-handwriting text-2xl text-gray-800 mb-1">Keep LogOfUs on your home screen</h3>
              
              {isIOS ? (
                /* iOS Instructions */
                <div className="text-gray-600 font-serif text-sm space-y-2 mt-2">
                  <p>Access your shared diary instantly just like a regular mobile app:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-xs text-gray-700">
                    <li className="flex items-center gap-1.5 flex-wrap">
                      Tap the <Share className="w-3.5 h-3.5 inline text-blue-500" /> <strong>Share</strong> icon below.
                    </li>
                    <li className="flex items-center gap-1.5 flex-wrap">
                      Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-gray-700" /> <strong>Add to Home Screen</strong>.
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android / Chrome Button Route */
                <div className="text-gray-600 font-serif text-sm space-y-3 mt-1">
                  <p>Add LogOfUs to your device to write your love story together anytime, offline or online.</p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-2.5 px-4 rounded-sm bg-rose-500 text-white font-handwriting text-xl shadow-md hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Install App
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}