import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ArcReactorProps {
  isListening?: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export function ArcReactor({ 
  isListening, 
  isProcessing, 
  isSpeaking,
  className 
}: ArcReactorProps) {
  return (
    <div className={cn("relative flex items-center justify-center w-64 h-64", className)}>
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-red-600/20 blur-3xl"
        animate={{
          scale: isListening ? [1, 1.2, 1] : 1,
          opacity: isListening ? [0.2, 0.4, 0.2] : 0.2,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Outer Ring */}
      <div className="absolute inset-0 border-4 border-red-900/30 rounded-full" />
      
      {/* Rotating Segments */}
      <motion.div
        className="absolute inset-2 border-t-4 border-b-4 border-gold-500 rounded-full"
        style={{ borderColor: '#FFC107' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div
        className="absolute inset-6 border-l-4 border-r-4 border-red-600 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner Core */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Pulsing Core */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-gold-500 shadow-[0_0_50px_rgba(211,47,47,0.8)]"
          animate={{
            scale: isProcessing ? [1, 1.1, 1] : (isSpeaking ? [1, 1.05, 1] : 1),
            boxShadow: isProcessing 
              ? ["0 0 20px rgba(211,47,47,0.5)", "0 0 60px rgba(255,193,7,0.8)", "0 0 20px rgba(211,47,47,0.5)"]
              : "0 0 30px rgba(211,47,47,0.6)"
          }}
          transition={{ duration: isProcessing ? 0.5 : 2, repeat: Infinity }}
        />

        {/* Core Detail */}
        <div className="z-10 w-24 h-24 rounded-full border-2 border-red-900/50 flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm">
          <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-4 opacity-40">
            {[...Array(9)].map((_, i) => (
              <motion.div 
                key={i} 
                className="bg-gold-500/50 rounded-sm"
                style={{ backgroundColor: '#FFC10780' }}
                animate={{
                  opacity: isListening ? [0.3, 1, 0.3] : 0.3
                }}
                transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
              />
            ))}
          </div>
          
          {/* Center Light */}
          <motion.div 
            className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_15px_white]"
            animate={{
              scale: isSpeaking ? [1, 1.5, 1] : 1,
              opacity: isSpeaking ? [0.5, 1, 0.5] : 0.8
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />
        </div>
      </div>

      {/* HUD Elements */}
      <div className="absolute inset-[-20px] pointer-events-none">
        {[0, 90, 180, 270].map((angle) => (
          <div 
            key={angle}
            className="absolute w-1 h-8 bg-gold-500/40"
            style={{ 
              backgroundColor: '#FFC10766',
              left: '50%', 
              top: '50%', 
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-140px)` 
            }}
          />
        ))}
      </div>
    </div>
  );
}
