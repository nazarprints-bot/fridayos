import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MessageSquare, Settings, Info, Terminal, Volume2, VolumeX, LogIn, LogOut, User, Download, Trash2, CheckCircle, XCircle, Brain, Search, Sparkles, ChevronRight, Save } from 'lucide-react';
import { ArcReactor } from '@/src/components/ArcReactor';
import { useVoice } from '@/src/hooks/useVoice';
import { getFridayResponse, extractMemories } from '@/src/services/gemini';
import { cn } from '@/src/lib/utils';
import { auth, db } from '@/src/lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  setDoc,
  getDocs,
  limit,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface MemoryEntry {
  id: string;
  content: string;
  confidence: number;
  category: 'Personal' | 'Preference' | 'Task' | 'Fact' | 'Other';
  context?: string;
  timestamp: any;
}

type VoiceStyle = 'Calm Professional' | 'Enthusiastic' | 'Neutral';

export default function App() {
  const { 
    isListening, 
    isSpeaking, 
    transcript, 
    startListening, 
    stopListening, 
    speak, 
    error: voiceError 
  } = useVoice();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemoryManager, setShowMemoryManager] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>('Calm Professional');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastMemoryReview, setLastMemoryReview] = useState<number>(Date.now());
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        // Initialize user profile and load preferences
        const userDocRef = doc(db, 'users', u.uid);
        onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.preferences?.voiceStyle) {
              setVoiceStyle(data.preferences.voiceStyle);
            }
          } else {
            setDoc(userDocRef, {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              preferences: { voiceStyle: 'Calm Professional' },
              createdAt: serverTimestamp()
            });
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Interactions and Memories
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setMemories([]);
      return;
    }

    // Interactions
    const interactionsQuery = query(
      collection(db, 'users', user.uid, 'interactions'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsubInteractions = onSnapshot(interactionsQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        role: doc.data().role as 'user' | 'model',
        text: doc.data().text,
        timestamp: doc.data().timestamp?.toMillis() || Date.now()
      }));
      setMessages(msgs);
    });

    // Memories
    const memoriesQuery = query(
      collection(db, 'users', user.uid, 'memories'),
      orderBy('timestamp', 'desc')
    );
    const unsubMemories = onSnapshot(memoriesQuery, (snapshot) => {
      const mems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MemoryEntry[];
      setMemories(mems);
    });

    return () => {
      unsubInteractions();
      unsubMemories();
    };
  }, [user]);

  // Periodic Memory Review Prompt
  useEffect(() => {
    if (user && memories.length > 5 && Date.now() - lastMemoryReview > 1000 * 60 * 10) { // Every 10 mins for demo
      setSuggestions(prev => [...prev, "Boss, your memory banks are growing. Should we review them?"]);
    }
  }, [memories, user, lastMemoryReview]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle voice command completion
  useEffect(() => {
    if (!isListening && transcript.trim().length > 0) {
      handleCommand(transcript);
    }
  }, [isListening, transcript]);

  const handleCommand = async (command: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    if (user) {
      await addDoc(collection(db, 'users', user.uid, 'interactions'), {
        uid: user.uid,
        role: 'user',
        text: command,
        timestamp: serverTimestamp()
      });
    } else {
      const userMessage: Message = { role: 'user', text: command, timestamp: Date.now() };
      setMessages(prev => [...prev, userMessage]);
    }

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const memoryStrings = memories.map(m => `[${m.category}] ${m.content}`);
    const response = await getFridayResponse(command, history, memoryStrings);
    
    if (user) {
      await addDoc(collection(db, 'users', user.uid, 'interactions'), {
        uid: user.uid,
        role: 'model',
        text: response.text,
        timestamp: serverTimestamp()
      });

      setSuggestions(response.suggestions);

      extractMemories(command + " " + response.text).then(newMems => {
        newMems.forEach(mem => {
          const exists = memories.some(m => m.content.toLowerCase() === mem.content.toLowerCase());
          if (!exists) {
            addDoc(collection(db, 'users', user.uid, 'memories'), {
              uid: user.uid,
              content: mem.content,
              confidence: mem.confidence,
              category: mem.category,
              timestamp: serverTimestamp()
            });
          }
        });
      });
    } else {
      const fridayMessage: Message = { role: 'model', text: response.text, timestamp: Date.now() };
      setMessages(prev => [...prev, fridayMessage]);
      setSuggestions(response.suggestions);
    }

    setIsProcessing(false);

    if (!isMuted) {
      speak(response.text, voiceStyle);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const updatePreference = async (key: string, value: any) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      [`preferences.${key}`]: value
    });
  };

  const deleteMemory = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'memories', id));
  };

  const updateMemory = async (id: string, updates: Partial<MemoryEntry>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'memories', id), updates);
  };

  const exportData = () => {
    const data = {
      user: {
        email: user?.email,
        displayName: user?.displayName
      },
      interactions: messages,
      memories: memories
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friday_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-black text-[#FFC107] font-sans selection:bg-red-600/30 overflow-hidden flex flex-col items-center justify-center p-4 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'radial-gradient(#FFC107 0.5px, transparent 0.5px)', 
             backgroundSize: '30px 30px' 
           }} 
      />
      
      {/* Scanning Line */}
      <motion.div 
        className="absolute inset-x-0 h-px bg-red-600/20 z-0 pointer-events-none"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Top HUD */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase opacity-70">
              {user ? `Welcome, ${user.displayName?.split(' ')[0]}` : 'System Online'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-red-600">FRIDAY <span className="text-[#FFC107]">OS</span></h1>
          <span className="text-[10px] font-mono opacity-40 uppercase">v4.2.0 - Mark LXXXV</span>
        </div>

        <div className="flex gap-4 pointer-events-auto items-center">
          {isAuthReady && (
            user ? (
              <div className="flex items-center gap-3 bg-gold-500/10 border border-gold-500/20 rounded-full pl-1 pr-3 py-1">
                <img src={user.photoURL || ''} alt="User" className="w-6 h-6 rounded-full border border-gold-500/30" referrerPolicy="no-referrer" />
                <button onClick={handleLogout} className="text-[10px] font-mono uppercase hover:text-red-500 transition-colors cursor-pointer">Logout</button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/20 hover:bg-gold-500/10 transition-colors cursor-pointer text-[10px] font-mono uppercase"
              >
                <LogIn size={14} />
                Login for Memory
              </button>
            )
          )}
          <div className="h-6 w-px bg-gold-500/20 mx-2" />
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full border border-[#FFC107]/20 hover:bg-[#FFC107]/10 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button 
            onClick={() => setShowMemoryManager(!showMemoryManager)}
            className={cn(
              "p-2 rounded-full border border-[#FFC107]/20 hover:bg-[#FFC107]/10 transition-colors cursor-pointer",
              showMemoryManager && "bg-[#FFC107]/20 border-[#FFC107]"
            )}
          >
            <Brain size={18} />
          </button>
          <button 
            onClick={() => setShowLog(!showLog)}
            className={cn(
              "p-2 rounded-full border border-[#FFC107]/20 hover:bg-[#FFC107]/10 transition-colors cursor-pointer",
              showLog && "bg-[#FFC107]/20 border-[#FFC107]"
            )}
          >
            <MessageSquare size={18} />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-full border border-[#FFC107]/20 hover:bg-[#FFC107]/10 transition-colors cursor-pointer",
              showSettings && "bg-[#FFC107]/20 border-[#FFC107]"
            )}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Main Display */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        <ArcReactor 
          isListening={isListening} 
          isProcessing={isProcessing} 
          isSpeaking={isSpeaking}
        />

        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-sm font-mono uppercase tracking-[0.2em] text-red-500 animate-pulse">Listening...</div>
                <div className="text-lg font-medium italic opacity-80">"{transcript || 'Say something, Boss...'}"</div>
              </motion.div>
            ) : isProcessing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm font-mono uppercase tracking-[0.2em] text-[#FFC107]"
              >
                Processing Request...
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="text-sm font-mono uppercase tracking-[0.2em] opacity-40">
                  {user ? 'Memory Active' : 'Awaiting Command'}
                </div>
                <button
                  onClick={toggleListening}
                  className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-red-600 text-white shadow-[0_0_20px_rgba(211,47,47,0.5)] hover:scale-110 transition-transform active:scale-95 cursor-pointer"
                >
                  <Mic size={24} />
                  <div className="absolute inset-0 rounded-full border-2 border-red-600 animate-ping opacity-20" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Proactive Suggestions */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 w-full max-w-lg">
        <AnimatePresence>
          {suggestions.map((s, i) => (
            <motion.button
              key={s + i}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              onClick={() => handleCommand(s)}
              className="flex items-center gap-3 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full hover:bg-gold-500/20 transition-all group cursor-pointer"
            >
              <Sparkles size={14} className="text-red-500 group-hover:animate-spin" />
              <span className="text-xs font-medium text-gold-500/80">{s}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="w-full max-w-md bg-black border border-gold-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(255,193,7,0.1)]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-red-600 flex items-center gap-3">
                  <Settings size={20} />
                  SYSTEM SETTINGS
                </h2>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gold-500/10 rounded-full transition-colors cursor-pointer">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-mono uppercase tracking-widest opacity-60">Voice Output Style</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['Calm Professional', 'Enthusiastic', 'Neutral'] as VoiceStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setVoiceStyle(style);
                          updatePreference('voiceStyle', style);
                        }}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                          voiceStyle === style 
                            ? "bg-gold-500/20 border-gold-500 text-gold-100" 
                            : "bg-gold-500/5 border-gold-500/10 hover:border-gold-500/30"
                        )}
                      >
                        <span className="text-sm font-medium">{style}</span>
                        {voiceStyle === style && <CheckCircle size={16} className="text-gold-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-mono uppercase tracking-widest opacity-60">Data Management</label>
                  <button 
                    onClick={exportData}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-red-600/10 border border-red-600/30 rounded-xl hover:bg-red-600/20 transition-all text-red-500 font-medium cursor-pointer"
                  >
                    <Download size={18} />
                    Export All Data (JSON)
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Manager Modal */}
      <AnimatePresence>
        {showMemoryManager && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-4xl h-[80vh] bg-black border border-gold-500/30 rounded-3xl flex flex-col overflow-hidden shadow-[0_0_100px_rgba(211,47,47,0.1)]">
              <div className="p-8 border-b border-gold-500/20 flex justify-between items-center bg-gold-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-600/20 rounded-2xl">
                    <Brain size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gold-500">MEMORY CORE</h2>
                    <p className="text-xs font-mono opacity-40 uppercase tracking-widest">Review and organize long-term data</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowMemoryManager(false);
                    setLastMemoryReview(Date.now());
                    setSuggestions(prev => prev.filter(s => !s.includes("review")));
                  }} 
                  className="p-2 hover:bg-gold-500/10 rounded-full transition-colors cursor-pointer"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {memories.length === 0 && (
                  <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 text-center gap-6">
                    <Brain size={64} />
                    <p className="text-lg font-mono uppercase tracking-widest">Memory banks empty</p>
                  </div>
                )}
                {memories.map((mem) => (
                  <motion.div
                    key={mem.id}
                    layout
                    className="p-6 bg-gold-500/5 border border-gold-500/10 rounded-2xl space-y-4 hover:border-gold-500/30 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-mono uppercase",
                          mem.category === 'Personal' && "bg-blue-500/20 text-blue-400",
                          mem.category === 'Preference' && "bg-green-500/20 text-green-400",
                          mem.category === 'Task' && "bg-red-500/20 text-red-400",
                          mem.category === 'Fact' && "bg-purple-500/20 text-purple-400",
                          mem.category === 'Other' && "bg-gray-500/20 text-gray-400"
                        )}>
                          {mem.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1 bg-gold-500/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-500" style={{ width: `${mem.confidence * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-mono opacity-40">{(mem.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <button onClick={() => deleteMemory(mem.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed text-gold-100/90">{mem.content}</p>
                    
                    {mem.context && (
                      <div className="p-3 bg-black/40 rounded-lg border border-gold-500/5">
                        <p className="text-[11px] italic opacity-50">Context: {mem.context}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <select 
                        className="bg-black border border-gold-500/20 rounded px-2 py-1 text-[10px] font-mono uppercase focus:outline-none focus:border-gold-500/50"
                        value={mem.category}
                        onChange={(e) => updateMemory(mem.id, { category: e.target.value as any })}
                      >
                        {['Personal', 'Preference', 'Task', 'Fact', 'Other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => updateMemory(mem.id, { confidence: Math.min(1, mem.confidence + 0.1) })}
                        className="px-2 py-1 border border-gold-500/20 rounded text-[10px] font-mono uppercase hover:bg-gold-500/10 transition-colors cursor-pointer"
                      >
                        Reinforce
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Log Overlay */}
      <AnimatePresence>
        {showLog && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 bottom-0 w-full md:w-96 bg-black/80 backdrop-blur-xl border-l border-[#FFC107]/20 z-30 flex flex-col"
          >
            <div className="p-6 border-b border-[#FFC107]/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-red-600" />
                <span className="font-mono text-sm uppercase tracking-widest">Interaction Log</span>
              </div>
              <button onClick={() => setShowLog(false)} className="text-[#FFC107]/50 hover:text-[#FFC107] cursor-pointer">
                <Info size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#FFC107]/20">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center gap-4">
                  <MessageSquare size={48} />
                  <p className="text-sm font-mono uppercase">No data in current session</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.timestamp + i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col gap-1",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <span className="text-[10px] font-mono uppercase opacity-40">
                    {msg.role === 'user' ? 'User' : 'FRIDAY'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-lg text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-red-600/10 border border-red-600/30 text-red-100" 
                      : "bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107]/90"
                  )}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-6 border-t border-[#FFC107]/20 bg-black/40">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a command..."
                  className="flex-1 bg-[#FFC107]/5 border border-[#FFC107]/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FFC107]/50 transition-colors placeholder:opacity-30 text-[#FFC107]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleCommand(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom HUD / Status Bar */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none z-20">
        <div className="flex flex-col gap-2 opacity-40">
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-tighter">
            <span>CPU: 12%</span>
            <span>MEM: 2.4GB</span>
            <span>NET: 450MB/S</span>
          </div>
          <div className="w-48 h-1 bg-[#FFC107]/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-red-600"
              animate={{ width: ['20%', '80%', '40%', '90%', '20%'] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 opacity-40">
          <div className="text-[10px] font-mono uppercase tracking-tighter">Location: Malibu, CA</div>
          <div className="text-[10px] font-mono uppercase tracking-tighter">Weather: 72°F Clear</div>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {(voiceError || (messages.length > 0 && messages[messages.length-1].text.includes("trouble connecting"))) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 bg-red-900/80 border border-red-500 text-white px-6 py-3 rounded-full backdrop-blur-md z-50 flex items-center gap-3"
          >
            <Info size={18} />
            <span className="text-sm font-medium">System Alert: {voiceError || "Core Processor Error"}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
