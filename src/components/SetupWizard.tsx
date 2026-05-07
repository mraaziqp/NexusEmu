import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  User, 
  FolderOpen, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Cpu, 
  Database,
  Cloud
} from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);
  const [foundCount, setFoundCount] = useState(0);

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(4), 1000);
            return 100;
          }
          return prev + 2;
        });
        setFoundCount(prev => prev + Math.floor(Math.random() * 5));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  return (
    <div className="fixed inset-0 z-[300] bg-nexus-bg flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#050505_100%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nexus-accent blur-[120px] rounded-full animate-pulse" />
      </div>

      <motion.div 
        layout
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10"
      >
        {/* Progress Header */}
        <div className="flex gap-2 p-6 pb-0">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= i ? 'bg-nexus-accent' : 'bg-white/5'
              }`} 
            />
          ))}
        </div>

        <div className="p-12 min-h-[450px] flex flex-col">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="space-y-8 text-center"
              >
                <div className="w-20 h-20 bg-nexus-accent/20 rounded-3xl mx-auto flex items-center justify-center border border-nexus-accent/30 relative">
                  <div className="absolute inset-0 bg-nexus-accent blur-xl opacity-20 animate-pulse" />
                  <Gamepad2 className="w-10 h-10 text-nexus-accent" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase">Welcome to Nexus</h1>
                  <p className="text-nexus-muted text-sm max-w-sm mx-auto">
                    The next generation of emulation management. Let's get your library configured and synced.
                  </p>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-nexus-accent hover:text-white transition-all group"
                >
                  CONNECT PROFILE <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-widest">v2.0.4 - System Ready</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">Core Path Mapping</h2>
                  <p className="text-nexus-muted text-xs">Specify your library archives. Nexus handles metadata scraping automatically.</p>
                </div>

                <div className="space-y-4">
                  <div className="group p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-nexus-accent/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-nexus-accent/10 rounded-xl">
                        <FolderOpen className="w-6 h-6 text-nexus-accent" />
                      </div>
                      <div>
                        <p className="font-bold">ROMs Directory</p>
                        <p className="text-[10px] text-nexus-muted font-mono">UNC: \\NEXUS-MAIN\GAMES</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-nexus-accent" />
                  </div>

                  <div className="group p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-nexus-accent/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Cpu className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-bold">BIOS / Firmware Repository</p>
                        <p className="text-[10px] text-nexus-muted font-mono">Status: Awaiting selection...</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-nexus-muted">SELECT</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-sm text-nexus-muted hover:text-white transition-all">BACK</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-4 bg-nexus-accent rounded-2xl font-bold text-sm hover:bg-nexus-accent/90 transition-all">START INITIAL SCAN</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-32 h-32 border-2 border-dashed border-nexus-accent/30 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="w-10 h-10 text-nexus-accent animate-pulse" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-nexus-accent/10 blur-3xl rounded-full" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">Indexing Archives</h2>
                  <div className="flex items-center justify-center gap-4 font-mono">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-nexus-accent">{foundCount}</p>
                      <p className="text-[8px] text-nexus-muted uppercase">Titles Found</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{(foundCount * 0.8).toFixed(0)}</p>
                      <p className="text-[8px] text-nexus-muted uppercase">Metadata Linked</p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-nexus-accent" 
                      animate={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-nexus-muted uppercase tracking-widest">Scanning: /emu/roms/n64/zelda_mm.z64</p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-8 text-center"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center relative border border-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                  <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">System Optimized</h2>
                  <p className="text-nexus-muted text-xs mx-auto max-w-sm">
                    Nexus found {foundCount} games and successfully auto-mapped your connected DualSense controller.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-left">
                    <Database className="w-5 h-5 text-nexus-accent" />
                    <div>
                      <p className="text-[10px] font-black text-nexus-muted uppercase">Database</p>
                      <p className="text-xs font-bold">SQL_READY</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-left">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-[10px] font-black text-nexus-muted uppercase">Sync Engine</p>
                      <p className="text-xs font-bold">AWS_ENABLED</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onComplete}
                  className="w-full py-5 bg-nexus-accent font-black rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest italic"
                >
                  Enter Nexus
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
