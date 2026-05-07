import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Smartphone, Monitor, Gamepad2, Maximize2, ShieldCheck, Box, Zap, Sparkles } from 'lucide-react';
import { useGames } from '../hooks/useGames';

export const SpatialView: React.FC = () => {
  const { games } = useGames();
  const [activeIndex, setActiveIndex] = useState(2);
  const [isCasting, setIsCasting] = useState(false);

  const handleCast = () => {
    setIsCasting(true);
    setTimeout(() => setIsCasting(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black bg-[radial-gradient(circle_at_50%_50%,#1a1a3a_0%,#000000_100%)] overflow-hidden flex flex-col">
      {/* VR Particles / Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              y: [0, -100], 
              x: [0, Math.sin(i) * 50] 
            }}
            transition={{ repeat: Infinity, duration: 5 + Math.random() * 5, delay: i * 0.2 }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full blur-sm"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-12 flex-1 flex flex-col">
        <header className="flex justify-between items-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Spatial_Engine_Ready
            </h3>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">Nexus VR Core</h2>
          </div>
          
          <button 
            onClick={handleCast}
            className={`px-8 py-4 rounded-2xl flex items-center gap-3 border transition-all duration-500 overflow-hidden relative ${
              isCasting 
                ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30'
            }`}
          >
            <AnimatePresence mode="wait">
              {isCasting ? (
                <motion.div 
                  key="casting" 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Smartphone className="w-5 h-5 animate-pulse" />
                  <span className="font-black italic tracking-widest text-[10px] uppercase">Handoff to Quest 3S...</span>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle" 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Box className="w-5 h-5" />
                  <span className="font-black italic tracking-widest text-[10px] uppercase">Hand off to Headset</span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </header>

        {/* 3D Carousel Simulation */}
        <div className="relative flex-1 flex items-center justify-center">
          <div className="relative w-full h-[500px] flex items-center justify-center">
            {games.map((game, i) => {
              const distance = i - activeIndex;
              const absDistance = Math.abs(distance);
              if (absDistance > 2) return null;

              return (
                <motion.div
                  key={game.id}
                  initial={false}
                  animate={{
                    x: distance * 400,
                    scale: 1 - (absDistance * 0.2),
                    rotateY: -distance * 25,
                    z: -absDistance * 200,
                    opacity: 1 - (absDistance * 0.3)
                  }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                  onClick={() => setActiveIndex(i)}
                  className={`absolute w-[300px] aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl group ${
                    i === activeIndex ? 'ring-4 ring-blue-400 ring-offset-8 ring-offset-black' : ''
                  }`}
                  style={{ perspective: '1000px' }}
                >
                  <img src={game.boxArt} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt={game.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 border border-white/10 rounded-[2rem]">
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{game.platform}</span>
                     <h4 className="text-xl font-bold tracking-tight mb-2 drop-shadow-lg">{game.title}</h4>
                     {i === activeIndex && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 pt-4 border-t border-white/20"
                        >
                           <div className="p-2 bg-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                              <Gamepad2 className="w-4 h-4 text-white" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Select Sequence</span>
                        </motion.div>
                     )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Floating Holographic Info */}
        <div className="mt-auto grid grid-cols-3 gap-8">
           {[
             { icon: Zap, label: 'Neural Latency', val: '2ms' },
             { icon: ShieldCheck, label: 'Identity Auth', val: 'SECURE' },
             { icon: Maximize2, label: 'FOV Scale', val: '110°' }
           ].map((stat, i) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 + i * 0.1 }}
               className="glass-panel p-6 rounded-[2.5rem] border-white/5 backdrop-blur-3xl bg-white/[0.03] flex items-center gap-6"
             >
                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                   <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-0.5">
                   <p className="text-[10px] font-black text-blue-400/50 uppercase tracking-widest">{stat.label}</p>
                   <p className="text-xl font-black italic tracking-tighter text-white/90 uppercase">{stat.val}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
      
      {/* Return Button */}
      <button 
        onClick={() => {
          // In a real app this would transition back, here we'll just hide it via parent state
        }}
        className="absolute top-12 left-1/2 -translate-x-1/2 p-4 px-8 glass-panel border-white/10 rounded-full text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/10 transition-all z-20"
      >
        Exit Spatial Environment
      </button>
    </div>
  );
};
