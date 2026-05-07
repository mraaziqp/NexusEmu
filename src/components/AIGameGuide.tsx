import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, Book, Sparkles, Zap, Brain, History, MessageSquare, AlertCircle } from 'lucide-react';

interface GuideProps {
  title: string;
  platform?: string;
}

export const AIGameGuide: React.FC<GuideProps> = ({ title, platform = 'Unknown' }) => {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsTyping(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch('/api/ai/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_title: title, platform, query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResponse(data.response);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="space-y-6 h-full flex flex-col p-2">
      <form onSubmit={handleAsk} className="relative group">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted group-focus-within:text-nexus-accent transition-colors" />
         <input 
           type="text"
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           placeholder="Ask Nexus AI about this game..."
           className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:ring-1 focus:ring-nexus-accent/50 focus:bg-white/10 transition-all font-medium text-sm"
         />
         <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <button type="submit" className="p-2 bg-nexus-accent/20 text-nexus-accent rounded-lg hover:bg-nexus-accent transition-all">
               <Zap className="w-4 h-4" />
            </button>
         </div>
      </form>

      <div className="flex-1 grid md:grid-cols-3 gap-6 min-h-0 overflow-y-auto no-scrollbar">
         {/* Main Terminal Response */}
         <div className="md:col-span-2 space-y-4">
            <div className="glass-panel rounded-3xl border-white/5 overflow-hidden flex flex-col h-full min-h-[300px]">
               <div className="p-4 border-b border-white/5 flex items-center justify-between bg-nexus-accent/5">
                  <div className="flex items-center gap-2">
                     <Terminal className="w-3 h-3 text-nexus-accent" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Gemini_Core_Output</span>
                  </div>
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent animate-pulse" />
                     <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                     <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  </div>
               </div>
               
               <div className="flex-1 p-6 font-mono text-sm relative">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
                  
                  <AnimatePresence mode="wait">
                     {isTyping ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-nexus-accent"
                        >
                           <Brain className="w-4 h-4 animate-bounce" />
                           <span className="animate-pulse">Synthesizing strategy from Gemini Core...</span>
                        </motion.div>
                     ) : error ? (
                        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 text-red-400">
                           <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                           <span className="text-xs leading-relaxed">{error}</span>
                        </motion.div>
                     ) : response ? (
                        <motion.div 
                          key="result"
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                           <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{response}</p>
                           <p className="text-[10px] text-nexus-muted uppercase tracking-widest border-t border-white/5 pt-4">Nexus AI — Powered by Gemini 2.0 Flash</p>
                        </motion.div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-nexus-muted space-y-4 opacity-40">
                           <MessageSquare className="w-12 h-12" />
                           <p className="text-xs uppercase tracking-widest font-black italic">Awaiting Direct Query</p>
                        </div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
         </div>

         {/* Sidebar: Lore & Controls */}
         <div className="space-y-6">
            <section className="glass-panel p-5 rounded-3xl border-white/5 space-y-4">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-accent flex items-center gap-2">
                  <Book className="w-3 h-3" /> Auto-Generated Manual
               </h4>
               <div className="space-y-3">
                  {[
                    { cmd: 'D-PAD / LS', action: 'Direct movement' },
                    { cmd: 'R2 (Pressure)', action: 'Variable acceleration' },
                    { cmd: 'L1 + R1', action: 'Environmental Scan' },
                    { cmd: 'SHARE + PS', action: 'Quick-Save State' }
                  ].map((ctrl, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5">
                       <span className="text-[9px] font-mono text-white/90">{ctrl.cmd}</span>
                       <span className="text-[9px] font-bold text-nexus-muted uppercase">{ctrl.action}</span>
                    </div>
                  ))}
               </div>
            </section>

            <section className="glass-panel p-5 rounded-3xl border-white/5 space-y-4 h-full">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-accent flex items-center gap-2">
                  <History className="w-3 h-3" /> Lore & Trivia
               </h4>
               <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded-2xl border-l-2 border-nexus-accent">
                     <p className="text-[10px] leading-relaxed text-nexus-muted italic font-medium">
                        "Development for this title was notoriously shifted mid-way to support a new proprietary engine..."
                     </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border-l-2 border-blue-400">
                     <p className="text-[10px] leading-relaxed text-nexus-muted italic font-medium">
                        "The main composer actually recorded over 40 hours of field audio which was later compressed down to 2MB."
                     </p>
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};
