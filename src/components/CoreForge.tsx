import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  ShieldCheck, 
  AlertCircle, 
  Hammer, 
  Zap, 
  Download, 
  Activity, 
  Monitor, 
  CheckCircle2,
  Settings2,
  Terminal,
  Box
} from 'lucide-react';

export const CoreForge: React.FC = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [biosVerified, setBiosVerified] = useState(false);
  const [gpuProfile, setGpuProfile] = useState('1080p');

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const biosFiles = [
    { name: 'PS2 BIOS - SCPH-70012', status: 'VERIFIED', size: '4.0 MB' },
    { name: 'GBA BIOS - normatt', status: 'MISSING', size: '16 KB' },
    { name: 'Dreamcast Boot - v1.01', status: 'VERIFIED', size: '2.0 MB' },
  ];

  const cores = [
    { name: 'Beetle PSX HW', ver: '0.9.44', status: 'Up to Date', load: '12%' },
    { name: 'mGBA', ver: '0.10.1', status: 'Outdated (v0.10.2 Ready)', load: '2%' },
    { name: 'SwanStation', ver: '1.2.0', status: 'Up to Date', load: '8%' },
  ];

  const presets = [
    { id: 'native', label: 'Native Resolution', desc: '1:1 Pixel Mapping' },
    { id: '1080p', label: '2x Upscale (1080p)', desc: 'DLSS Super Resolution' },
    { id: '4k', label: 'Extreme (4K)', desc: 'Shader-Heavy / Max Samples' },
  ];

  const isSystemReady = biosFiles.every(b => b.status === 'VERIFIED') && cores.every(c => !c.status.includes('Outdated'));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Hammer className="w-3 h-3" /> Core_Forge_v2.1
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Hardware Diagnostic</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl flex items-center gap-3">
             <Activity className="w-4 h-4 text-nexus-accent animate-pulse" />
             <span className="text-[10px] font-black font-mono text-nexus-accent tracking-widest uppercase italic">GPU_SYNC: RTX 3060 Ti</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* BIOS Vault */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> System BIOS Vault
            </h4>
            <button className="text-[10px] font-bold text-nexus-accent hover:underline">IMPORT_ALL</button>
          </div>

          <div className="glass-panel p-6 rounded-[32px] border-white/5 space-y-4">
            {biosFiles.map((bios, i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="space-y-1">
                  <p className="text-xs font-bold">{bios.name}</p>
                  <p className="text-[8px] font-mono text-nexus-muted tracking-widest uppercase">{bios.size} | CRC32_OK</p>
                </div>
                {bios.status === 'VERIFIED' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <button className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100">
                    <Download className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <div className="pt-2">
               <button className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-nexus-muted hover:text-white hover:border-white/30 transition-all uppercase tracking-widest">
                  + Add New Firmware
               </button>
            </div>
          </div>
        </div>

        {/* Global Forge Controls */}
        <div className="lg:col-span-2 space-y-8">
           {/* Performance Forge */}
           <section className="glass-panel p-8 rounded-[40px] border-white/5 space-y-8 relative overflow-hidden bg-nexus-accent/[0.02]">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <Settings2 className="w-48 h-48" />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                 <div className="space-y-1">
                    <h4 className="font-bold tracking-tight uppercase italic flex items-center gap-2">
                       <Monitor className="w-4 h-4 text-nexus-accent" /> GPU Performance Forge
                    </h4>
                    <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-widest">Active Scaler: FSR 2.1 Balanced</p>
                 </div>
                 <div className="flex gap-2">
                    {presets.map((preset) => (
                       <button
                         key={preset.id}
                         onClick={() => setGpuProfile(preset.id)}
                         className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                           gpuProfile === preset.id 
                             ? 'bg-nexus-accent border-nexus-accent text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                             : 'bg-white/5 border-white/10 text-nexus-muted hover:text-white'
                         }`}
                       >
                          {preset.id}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 relative z-10">
                 <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-nexus-muted uppercase">Sample Rate</span>
                       <span className="text-[10px] font-mono text-nexus-accent">16x_ANISOTROPIC</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div animate={{ width: '80%' }} className="h-full bg-nexus-accent" />
                    </div>
                 </div>
                 <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-nexus-muted uppercase">Shader Cache</span>
                       <span className="text-[10px] font-mono text-nexus-accent">4.2 GB READY</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div animate={{ width: '100%' }} className="h-full bg-nexus-accent" />
                    </div>
                 </div>
                 <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-nexus-muted uppercase">VRAM_Pressure</span>
                       <span className="text-[10px] font-mono text-nexus-accent">LOW</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div animate={{ width: '25%' }} className="h-full bg-nexus-accent" />
                    </div>
                 </div>
              </div>
           </section>

           {/* Core Downloader */}
           <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
                   <Box className="w-3 h-3" /> Active Emulation Cores
                 </h4>
                 <span className="text-[10px] font-mono text-nexus-muted">UPDATER: ENABLED</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 {cores.map((core, i) => (
                    <div key={i} className="p-6 glass-panel border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-nexus-accent transition-colors">
                             <Cpu className={`w-6 h-6 ${core.status.includes('Update') ? 'text-nexus-accent' : 'text-nexus-muted'}`} />
                          </div>
                          <div>
                             <p className="font-bold">{core.name}</p>
                             <div className="flex gap-2">
                                <span className="text-[8px] font-mono text-nexus-muted uppercase">v{core.ver}</span>
                                <span className={`text-[8px] font-black uppercase italic ${
                                   core.status.includes('Outdated') ? 'text-yellow-500' : 'text-green-500'
                                }`}>{core.status}</span>
                             </div>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-nexus-muted uppercase mb-1">Thread Load</p>
                          <p className="text-xs font-mono font-bold">{core.load}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </div>

      {/* Pre-Flight Health Bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed bottom-0 left-0 right-0 p-6 z-[100] transition-all duration-700 ${
          isSystemReady ? 'bg-green-500 shadow-[0_-10px_50px_rgba(34,197,94,0.3)]' : 'bg-nexus-accent shadow-[0_-10px_50px_rgba(59,130,246,0.3)]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="p-2 bg-white/20 rounded-lg">
                 <Terminal className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                    {isSystemReady ? 'SYSTEM READY TO LAUNCH' : 'DIAGNOSTIC INCOMPLETE'}
                 </p>
                 <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest">
                    BIOS: {biosFiles.filter(b => b.status === 'VERIFIED').length}/{biosFiles.length} | CORES: {cores.length} | DRIVE: 82% 
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="hidden md:flex flex-col text-right">
                 <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">Kernel Latency</span>
                 <span className="text-lg font-mono font-black text-white italic">0.02ms</span>
              </div>
              <button className="px-10 py-4 bg-white text-black font-black italic rounded-xl hover:scale-105 active:scale-95 transition-all shadow-2xl tracking-tighter">
                 GLOBAL START
              </button>
           </div>
        </div>
      </motion.div>

      {/* Initial Scan Interface */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center space-y-8"
          >
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               className="w-32 h-32 border-2 border-t-nexus-accent border-r-nexus-accent border-b-transparent border-l-transparent rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)]"
             />
             <div className="space-y-2">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase">Initializing Forge</h3>
                <div className="flex items-center justify-center gap-3">
                   <div className="w-1.5 h-1.5 bg-nexus-accent rounded-full animate-pulse" />
                   <p className="text-[10px] font-mono text-nexus-muted tracking-widest uppercase italic">Scanning system environment for BIOS & Kernels...</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
