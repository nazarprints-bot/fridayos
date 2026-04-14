import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface ArcReactorProps {
  isListening?: boolean;
  isProcessing?: boolean;
  isSpeaking?: boolean;
  isAnalyzingNLU?: boolean;
  isGeneratingResponse?: boolean;
  isAccessingMemory?: boolean;
  className?: string;
}

export function ArcReactor({ 
  isListening, 
  isProcessing, 
  isSpeaking,
  isAnalyzingNLU,
  isGeneratingResponse,
  isAccessingMemory,
  className 
}: ArcReactorProps) {
  const baseColor = isListening ? '#ef4444' : isAccessingMemory ? '#06b6d4' : isAnalyzingNLU ? '#a855f7' : '#FFC107';
  const glowColor = isListening 
    ? 'rgba(239, 68, 68, 0.4)' 
    : isAccessingMemory 
    ? 'rgba(6, 182, 212, 0.4)' 
    : isAnalyzingNLU 
    ? 'rgba(168, 85, 247, 0.4)' 
    : 'rgba(255, 193, 7, 0.4)';

  return (
    <div className={cn("relative flex items-center justify-center w-64 h-64", className)}>
      {/* Outer Glow Layer */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl opacity-20"
        animate={{
          backgroundColor: baseColor,
          scale: isSpeaking ? [1, 1.2, 1] : isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Outer Decorative Ring */}
      <motion.div
        className="absolute inset-0 border-2 border-dashed rounded-full opacity-20"
        style={{ borderColor: baseColor }}
        animate={{ 
          rotate: isGeneratingResponse ? [0, 360] : 360,
          scale: isGeneratingResponse ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          rotate: { duration: isGeneratingResponse ? 2 : 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.5, repeat: Infinity }
        }}
      />

      {/* Primary Rotating Segments */}
      <motion.div
        className="absolute inset-2 border-t-4 border-b-4 rounded-full opacity-60"
        style={{ borderColor: baseColor }}
        animate={{ 
          rotate: 360,
          scale: isProcessing || isAnalyzingNLU ? [1, 1.02, 1] : 1,
          opacity: isAccessingMemory ? [0.6, 1, 0.6] : 0.6
        }}
        transition={{ 
          rotate: { duration: isAnalyzingNLU ? 4 : 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.5, repeat: Infinity },
          opacity: { duration: 0.8, repeat: Infinity }
        }}
      />
      
      <motion.div
        className="absolute inset-8 border-l-4 border-r-4 rounded-full opacity-40"
        style={{ borderColor: isAccessingMemory ? '#06b6d4' : '#ef4444' }}
        animate={{ 
          rotate: -360,
          opacity: isListening || isAccessingMemory ? [0.4, 0.8, 0.4] : 0.4,
          scale: isAccessingMemory ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          rotate: { duration: isAccessingMemory ? 6 : 12, repeat: Infinity, ease: "linear" },
          opacity: { duration: 1, repeat: Infinity },
          scale: { duration: 1.5, repeat: Infinity }
        }}
      />

      {/* Core Housing */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Pulsing Core Background */}
        <motion.div
          className="absolute inset-0 rounded-full bg-black border-4 border-white/10 shadow-[inset_0_0_30px_rgba(255,255,255,0.05)]"
          animate={{
            borderColor: isSpeaking || isGeneratingResponse ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
          }}
        />

        {/* Inner Glow Core */}
        <motion.div
          className="absolute w-24 h-24 rounded-full"
          animate={{
            boxShadow: isSpeaking || isGeneratingResponse
              ? `0 0 40px ${glowColor}, inset 0 0 20px ${glowColor}`
              : `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}`,
            scale: isSpeaking || isGeneratingResponse ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: 0.5, repeat: (isSpeaking || isGeneratingResponse) ? Infinity : 0 }}
        />

        {/* Triangular Core Pattern */}
        <div className="z-10 relative w-20 h-20 flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
              style={{ rotate: i * 120 }}
              animate={{
                opacity: isProcessing || isAnalyzingNLU ? [0.2, 0.8, 0.2] : 0.5,
                scaleX: isSpeaking || isGeneratingResponse ? [1, 1.5, 1] : 1,
                backgroundColor: isAnalyzingNLU ? '#a855f7' : 'white'
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
          
          {/* Center Light Source */}
          <motion.div 
            className="absolute w-6 h-6 rounded-full bg-white shadow-[0_0_20px_white]"
            animate={{
              scale: isListening ? [1, 1.3, 1] : (isProcessing || isAnalyzingNLU) ? [0.8, 1.2, 0.8] : 1,
              opacity: isListening || isAccessingMemory ? [0.8, 1, 0.8] : 0.9,
              boxShadow: isSpeaking || isGeneratingResponse ? '0 0 30px white' : '0 0 15px white',
              backgroundColor: isAccessingMemory ? '#06b6d4' : isAnalyzingNLU ? '#a855f7' : 'white'
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        </div>
      </div>

      {/* HUD Compass Elements */}
      <div className="absolute inset-[-30px] pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute w-1 h-3 bg-gold-500/30"
            style={{ 
              left: '50%', 
              top: '50%', 
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-145px)` 
            }}
            animate={{
              opacity: isProcessing ? [0.1, 0.6, 0.1] : 0.3,
              height: isProcessing ? [3, 6, 3] : 3
            }}
            transition={{ duration: 1, delay: i * 0.05, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}
