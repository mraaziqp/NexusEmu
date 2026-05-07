import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad, Activity, ShieldCheck, Zap, Cpu, Terminal, RefreshCw, Radio } from 'lucide-react';

export const ControllerSettings: React.FC = () => {
  const [latency, setLatency] = useState(2.4);
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const [scanProgress, setScanProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Number((Math.random() * 2 + 2).toFixed(1)));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Terminal className="w-3 h-3" /> Hardware_IO_Manager
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight">Controller Diagnostics</h2>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-green-500 font-bold uppercase tracking-widest">SYSTEM_LIVE</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Active Devices */}
        <div className="md:col-span-2 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Detected Input Nodes</h4>
              <span className="text-[10px] font-mono text-nexus-muted">Devices: 01</span>
            </div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-6 glass-panel rounded-2xl relative overflow-hidden group border-white/10"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-nexus-accent" />
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Gamepad className="w-24 h-24 rotate-12" />
              </div>

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-nexus-accent/10 rounded-2xl flex items-center justify-center border border-nexus-accent/20">
                    <Gamepad className="w-8 h-8 text-nexus-accent" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-xl font-bold tracking-tight">DualSense Wireless Controller</h5>
                    <div className="flex gap-4 font-mono text-[10px]">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-nexus-muted">VID: <span className="text-white">0x054C</span></span>
                      <span className="px-2 py-0.5 bg-white/5 rounded text-nexus-muted">PID: <span className="text-white">0x0CE6</span></span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] font-bold text-green-500/80 uppercase">Verified Firmware v1.0.4.0</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold rounded-lg flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    CONNECTED
                  </div>
                  <span className="text-[10px] font-mono text-nexus-muted pt-2 opacity-50">BUS: 001 DEV: 004</span>
                </div>
              </div>

              {/* Translation Mapping Visual */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-nexus-muted uppercase tracking-widest">SDL2 Translation Layer</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-4 h-1 bg-nexus-accent rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[9px]">
                  {[
                    { label: 'BTN_SOUTH', map: 'SDL_A' },
                    { label: 'BTN_EAST', map: 'SDL_B' },
                    { label: 'ABS_X', map: 'SDL_AXIS_0' },
                    { label: 'ABS_Y', map: 'SDL_AXIS_1' }
                  ].map((map, i) => (
                    <div key={i} className="p-2 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between hover:bg-nexus-accent/5 transition-colors">
                      <span className="text-nexus-muted">{map.label}</span>
                      <span className="text-nexus-accent">→ {map.map}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Auto-Detect Terminal Switch */}
          <section className="glass-panel p-6 rounded-2xl border-white/5 overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl transition-colors ${isAutoDetect ? 'bg-nexus-accent/20' : 'bg-white/5'}`}>
                  <RefreshCw className={`w-5 h-5 ${isAutoDetect ? 'text-nexus-accent animate-spin-slow' : 'text-nexus-muted'}`} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold flex items-center gap-2">
                    Zero-Config Auto-Detection
                    {isAutoDetect && <span className="inline-block w-2 h-2 rounded-full bg-nexus-accent animate-pulse" />}
                  </h4>
                  <p className="text-xs text-nexus-muted max-w-sm">
                    Nexus intercepts HID signals and matches against the master mapping table instantly.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsAutoDetect(!isAutoDetect)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${
                  isAutoDetect ? 'bg-nexus-accent' : 'bg-white/10'
                }`}
              >
                <motion.div 
                  initial={false}
                  animate={{ x: isAutoDetect ? 26 : 4 }}
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                />
              </button>
            </div>
            
            {/* Terminal Trace Mock */}
            <AnimatePresence>
              {isAutoDetect && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 font-mono text-[9px] text-nexus-accent/60 space-y-1 border-t border-white/5 pt-4"
                >
                  <p>[INFO] Polling SDL2_Input_Hub...</p>
                  <p>[SCAN] Node 'dev/input/js0' matched 054C:0CE6</p>
                  <p>[MAP] Loading profile 'dualsense_v2_standard'</p>
                  <p className="flex items-center gap-1"><span className="text-green-500">COMPLETE</span> Kernel translation link confirmed.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Right: Metrics & Info */}
        <div className="space-y-6">
          <section className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted px-1">Signal Analytics</h4>
             
             {/* Latency Meter */}
             <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-6">
                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                      <p className="text-xs font-bold flex items-center gap-2">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        Round Trip Latency
                      </p>
                      <span className="font-mono text-xl font-bold italic text-nexus-accent">{latency}ms</span>
                   </div>
                   <div className="h-12 flex items-end gap-1 px-1">
                      {[...Array(20)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ 
                            height: [`${Math.random() * 40 + 20}%`, `${Math.random() * 60 + 40}%`, `${Math.random() * 40 + 20}%`] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5 + Math.random(),
                            ease: 'easeInOut'
                          }}
                          className={`flex-1 rounded-t-sm transition-colors ${
                            latency > 3.5 ? 'bg-red-500/50' : 'bg-nexus-accent/40'
                          }`}
                        />
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                   <div className="space-y-1">
                      <p className="text-[8px] font-black text-nexus-muted uppercase tracking-widest">Jitter</p>
                      <p className="font-mono text-xs text-white/80">0.2ms</p>
                   </div>
                   <div className="text-right space-y-1">
                      <p className="text-[8px] font-black text-nexus-muted uppercase tracking-widest">Packet Drop</p>
                      <p className="font-mono text-xs text-green-500">0.00%</p>
                   </div>
                </div>
             </div>

             {/* Connection Strength */}
             <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-xs font-bold flex items-center gap-2 text-blue-400">
                      <Radio className="w-3 h-3" />
                      Signal Strength
                   </p>
                   <span className="text-[10px] font-mono font-bold">100%</span>
                </div>
                <div className="flex gap-1.5 h-1.5">
                   {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className="flex-1 bg-nexus-accent rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                   ))}
                </div>
             </div>
          </section>

          <section className="p-6 bg-nexus-accent/5 rounded-2xl border border-nexus-accent/10">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-accent mb-4 flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                SDL2 Runtime Env
             </h4>
             <ul className="space-y-3 font-mono text-[9px] text-nexus-accent/80">
                <li className="flex justify-between border-b border-white/5 pb-2">
                   <span>SDL_VERSION</span>
                   <span className="text-white">2.28.5</span>
                </li>
                <li className="flex justify-between border-b border-white/5 pb-2">
                   <span>INPUT_DRIVER</span>
                   <span className="text-white">xinput/rawlib</span>
                </li>
                <li className="flex justify-between">
                   <span>HAPTIC_ENGINE</span>
                   <span className="text-green-500">READY</span>
                </li>
             </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
