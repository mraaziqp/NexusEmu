import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileQuestion, CheckCircle2, Sparkles, AlertCircle, ArrowRight, Gamepad2, Info, RefreshCw } from 'lucide-react';

interface AIGuess {
  title: string;
  platform: string;
  confidence: number;
  year?: string;
  genre?: string;
}

export const ScannerInbox: React.FC = () => {
  const [filename, setFilename] = useState('smb3_u_revA_badheader.nes');
  const [isScanning, setIsScanning] = useState(false);
  const [guess, setGuess] = useState<AIGuess | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!filename.trim()) return;
    setIsScanning(true);
    setGuess(null);
    setConfirmed(false);
    setError(null);
    try {
      const res = await fetch('/api/ai/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: filename.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setGuess(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 flex items-center gap-2">
          <AlertCircle className="w-3 h-3" /> Gemini_Pipeline_Scraper
        </h3>
        <h2 className="text-2xl font-black italic tracking-tight">Scanner Inbox</h2>
      </div>

      <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
        {/* Master File Header */}
        <div className="p-8 bg-white/5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-nexus-muted uppercase tracking-widest">ROM Filename to Identify</span>
              <div className="flex items-center gap-3">
                <FileQuestion className="w-6 h-6 text-yellow-500 shrink-0" />
                <input
                  value={filename}
                  onChange={e => setFilename(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScrape()}
                  className="flex-1 text-lg font-mono bg-transparent text-white/90 tracking-tighter focus:outline-none border-b border-white/10 focus:border-nexus-accent pb-1"
                />
              </div>
            </div>
            <p className="text-xs text-nexus-muted max-w-lg">
              The Nexus AI Metadata Engine (Gemini 2.0) will extract structured metadata from any messy ROM filename.
            </p>
          </div>

          <button
            onClick={handleScrape}
            disabled={isScanning || !filename.trim()}
            className="px-8 py-4 bg-nexus-accent text-white font-black rounded-2xl flex items-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50 shrink-0"
          >
            {isScanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isScanning ? 'SCANNING...' : 'IDENTIFY ROM'}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 flex items-center gap-3 bg-red-500/10 border-b border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">{error}</span>
            </motion.div>
          )}

          {guess && !confirmed && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-yellow-500" /> AI Identification Result
                </h4>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full border border-nexus-accent/30 text-nexus-accent bg-nexus-accent/10">
                  {Math.round((guess.confidence ?? 0) * 100)}% confidence
                </span>
              </div>

              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-nexus-accent/20 border border-nexus-accent/30 rounded-2xl flex items-center justify-center">
                    <Gamepad2 className="w-7 h-7 text-nexus-accent" />
                  </div>
                  <div>
                    <p className="text-xl font-black tracking-tight">{guess.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono text-nexus-muted uppercase">{guess.platform}</span>
                      {guess.year && <span className="text-[10px] font-mono text-nexus-muted">· {guess.year}</span>}
                      {guess.genre && <span className="text-[10px] font-mono text-nexus-muted">· {guess.genre}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setConfirmed(true)}
                    className="flex-1 py-3 bg-nexus-accent text-white font-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> CONFIRM & ADD TO LIBRARY
                  </button>
                  <button
                    onClick={() => setGuess(null)}
                    className="py-3 px-6 bg-white/5 border border-white/10 text-nexus-muted font-black rounded-xl hover:bg-white/10 transition-all"
                  >
                    RETRY
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {confirmed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 flex flex-col items-center gap-4 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-xl font-black italic tracking-tight">"{guess?.title}" added to vault.</p>
              <p className="text-xs text-nexus-muted">Metadata saved. Run a vault scan to link the ROM file.</p>
              <button onClick={() => { setGuess(null); setConfirmed(false); setFilename(''); }}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-sm hover:bg-white/10 transition-all">
                SCAN ANOTHER
              </button>
            </motion.div>
          )}

          {!guess && !confirmed && !isScanning && !error && (
            <div className="p-12 flex flex-col items-center gap-4 text-nexus-muted opacity-40">
              <FileQuestion className="w-12 h-12" />
              <p className="text-xs uppercase tracking-widest font-black italic">Enter a ROM filename above to identify it</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
