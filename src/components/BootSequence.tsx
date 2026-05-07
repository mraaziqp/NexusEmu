import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, CheckCircle2, Loader2, Gamepad, Zap, ShieldCheck, Database, Cpu } from 'lucide-react';
import { Game } from '../types';

interface BootSequenceProps {
  game: Game | null;
  onComplete: () => void;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ game, onComplete }) => {
  const [step, setStep] = useState(0);
  const checks = [
    { label: 'Verifying Delta Sync', status: 'OK' },
    { label: 'Applying Controller Profile (0x054C)', status: 'OK' },
    { label: 'Checking Kernel Memory Integrity', status: 'OK' },
    { label: 'Allocating Framebuffers', status: 'OK' },
    { label: 'Injecting BIOS patches', status: 'OK' }
  ];

  useEffect(() => {
    if (!game) {
      setStep(0);
      return;
    }

    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= checks.length) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [game]);

  if (!game) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-nexus-bg flex flex-col items-center justify-center p-8 overflow-hidden"
      >
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img src={game.heroImage} className="w-full h-full object-cover opacity-10 blur-2xl scale-150" />
          <div className="absolute inset-0 bg-gradient-to-t from-nexus-bg via-transparent to-nexus-bg" />
        </div>

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-12"
          >
            <span className="text-[10px] font-black text-nexus-accent tracking-[0.4em] uppercase mb-4 block">Initialization Sequence Active</span>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">{game.title}</h1>
            <div className="h-1 w-64 bg-white/5 rounded-full mx-auto relative overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(step / checks.length) * 100}%` }}
                 className="absolute inset-y-0 left-0 bg-nexus-accent shadow-[0_0_10px_rgba(59,130,246,0.8)]"
               />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 w-full max-w-3xl items-start">
            {/* Pre-flight Checklist */}
            <div className="space-y-4 text-left glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2 mb-4">
                 <Terminal className="w-3 h-3" /> System_PreFlight_Checklist
              </h3>
              <div className="space-y-3 font-mono text-[10px]">
                {checks.map((check, i) => (
                  <div key={i} className={`flex justify-between items-center transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-20'}`}>
                    <span className="text-white/70">{check.label}</span>
                    <div className="flex items-center gap-2">
                       {i < step ? (
                         <span className="text-green-500 font-bold">OK</span>
                       ) : i === step ? (
                         <Loader2 className="w-3 h-3 animate-spin text-nexus-accent" />
                       ) : (
                         <span className="text-white/20">PENDING</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controller Layout Preview */}
            <div className="space-y-4 text-left glass-panel p-6 rounded-2xl border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2 mb-4">
                 <Gamepad className="w-3 h-3" /> Controller_Mapping: {game.platform}
              </h3>
              <div className="relative aspect-video rounded-xl bg-black/40 border border-white/5 flex items-center justify-center p-4">
                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <Gamepad className="w-32 h-32" />
                 </div>
                 <div className="relative z-10 w-full h-full flex flex-col justify-between italic text-[10px] font-bold text-nexus-accent">
                    <div className="flex justify-between">
                       <span className="bg-nexus-accent/10 px-2 py-1 rounded">L1: ITEM</span>
                       <span className="bg-nexus-accent/10 px-2 py-1 rounded">R1: DASH</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <div className="flex gap-4">
                          <span className="w-8 h-8 rounded-full border border-nexus-accent/30 flex items-center justify-center">X</span>
                          <span className="w-8 h-8 rounded-full border border-nexus-accent/30 flex items-center justify-center">○</span>
                       </div>
                       <span className="text-[8px] tracking-widest whitespace-nowrap">PSX_STANDARD_V2</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Loading Ring */}
        <div className="absolute bottom-20 flex items-center gap-6">
           <div className="relative flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                className="w-16 h-16 border-2 border-dashed border-nexus-accent/30 rounded-full"
              />
              <div className="absolute w-12 h-12 border-2 border-nexus-accent rounded-full animate-pulse" />
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black tracking-widest uppercase">Kernel Initializing</p>
              <p className="text-[8px] font-mono text-nexus-muted">Nexus_HyperVisor_v1.0.84</p>
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
