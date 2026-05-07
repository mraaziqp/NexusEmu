import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileQuestion, CheckCircle2, Sparkles, AlertCircle, ArrowRight, Gamepad2, Info } from 'lucide-react';

interface AIGuess {
  id: string;
  title: string;
  platform: string;
  confidence: number;
  thumbnail: string;
}

const MOCK_GUESSES: AIGuess[] = [
  {
    id: 'g1',
    title: 'Super Mario Bros. 3',
    platform: 'NES',
    confidence: 0.92,
    thumbnail: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v9x.webp'
  },
  {
    id: 'g2',
    title: 'Super Mario World',
    platform: 'SNES',
    confidence: 0.45,
    thumbnail: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v9m.webp'
  },
  {
    id: 'g3',
    title: 'Mario Bros.',
    platform: 'NES',
    confidence: 0.31,
    thumbnail: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vcp.webp'
  }
];

export const ScannerInbox: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const originalFilename = 'smb3_u_revA_badheader.nes';

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Trigger "locking in" animation
    setTimeout(() => {
      setIsResolved(true);
    }, 800);
  };

  const selectedGuess = MOCK_GUESSES.find(g => g.id === selectedId);

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" /> Genkit_Pipeline_Ambiguity
        </h3>
        <h2 className="text-2xl font-black italic tracking-tight">Scanner Inbox</h2>
      </div>

      <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
        {/* Master File Header */}
        <div className="p-8 bg-white/5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-nexus-muted uppercase tracking-widest">Unresolved Resource</span>
              <div className="flex items-center gap-3">
                <FileQuestion className="w-6 h-6 text-yellow-500" />
                <code className="text-xl font-mono text-white/90 tracking-tighter">{originalFilename}</code>
              </div>
            </div>
            <p className="text-xs text-nexus-muted max-w-lg">
              The AI Metadata Engine identified multiple high-probability signatures. Manual mapping required to verify CRC32 consistency.
            </p>
          </div>

          <AnimatePresence>
            {isResolved && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-full"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black text-green-500 tracking-[0.2em] uppercase">Identity Verified</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Guesses Grid */}
        <div className="p-8 relative">
          <AnimatePresence mode="wait">
            {!isResolved ? (
              <motion.div 
                key="guesses"
                exit={{ y: 20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-accent flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> AI Best Guesses
                  </h4>
                  <span className="text-[10px] font-mono text-nexus-muted line-through opacity-30 italic">Refuting 1,420 candidates...</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {MOCK_GUESSES.map((guess, i) => (
                    <motion.button
                      key={guess.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(guess.id)}
                      className={`group relative flex flex-col text-left rounded-2xl overflow-hidden border transition-all duration-300 ${
                        selectedId === guess.id 
                          ? 'bg-nexus-accent/20 border-nexus-accent ring-2 ring-nexus-accent/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="aspect-[3/2] relative overflow-hidden">
                        <img 
                          src={guess.thumbnail} 
                          alt={guess.title} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 flex flex-col">
                          <span className="text-[8px] font-black text-nexus-accent uppercase tracking-widest mb-1">
                            {guess.platform}
                          </span>
                          <span className="text-xs font-bold leading-tight">{guess.title}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[8px] font-black text-nexus-muted uppercase tracking-widest">Confidence</p>
                          <p className={`font-mono text-sm font-bold ${
                            guess.confidence > 0.8 ? 'text-green-500' : 'text-yellow-500'
                          }`}>
                            {(guess.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className={`p-2 rounded-lg transition-colors ${
                          selectedId === guess.id ? 'bg-nexus-accent text-white' : 'bg-white/5 text-nexus-muted'
                        }`}>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="resolved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                   <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black italic tracking-tight">Identity Mapped</h3>
                  <p className="text-nexus-muted text-sm max-w-sm mx-auto">
                    The messy filename has been successfully purged. Metadata records updated in Nexus SQL (WAL-Mode).
                  </p>
                </div>
                
                <div className="flex items-center gap-12 pt-8 relative">
                   <div className="text-center space-y-2">
                      <p className="text-[8px] font-black text-nexus-muted uppercase tracking-[0.2em]">Source</p>
                      <code className="text-xs opacity-40 font-mono italic">{originalFilename}</code>
                   </div>
                   <motion.div 
                     animate={{ x: [0, 5, 0] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                   >
                    <ArrowRight className="w-6 h-6 text-nexus-accent" />
                   </motion.div>
                   <div className="text-center space-y-2 group">
                      <p className="text-[8px] font-black text-nexus-accent uppercase tracking-[0.2em]">Validated</p>
                      <div className="flex items-center gap-2">
                         <Gamepad2 className="w-4 h-4 text-nexus-accent" />
                         <span className="text-lg font-bold italic">{selectedGuess?.title}</span>
                      </div>
                   </div>
                </div>

                <div className="pt-8">
                   <button 
                     onClick={() => setIsResolved(false)}
                     className="px-6 py-2 text-[10px] font-black tracking-[0.3em] text-nexus-muted hover:text-white uppercase transition-colors"
                   >
                     Reset Cache Flow
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="p-6 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 flex items-start gap-4">
        <div className="mt-1">
          <Info className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-yellow-500/90 italic">Manual Intervention Required</p>
          <p className="text-[10px] text-nexus-muted leading-relaxed">
            Automatic CRC32 verification failed due to "Bad_Header" exception. The Genkit Pipeline has suggested the most likely matches based on filename fuzzy-matching and Gemini analysis.
          </p>
        </div>
      </div>
    </div>
  );
};
