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
  Box,
  RefreshCw
} from 'lucide-react';
import { BiosFile } from '../types';
import { useTelemetry } from '../hooks/useTelemetry';

export const CoreForge: React.FC = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [biosFiles, setBiosFiles] = useState<BiosFile[]>([]);
  const [biosPath, setBiosPath] = useState<string | null>(null);
  const [gpuProfile, setGpuProfile] = useState('native');
  const { stats } = useTelemetry(2000);

  const fetchBios = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/bios/verify');
      const data = await res.json();
      setBiosPath(data.bios_path);
      setBiosFiles(data.files ?? []);
    } catch { /* ignore */ }
    setIsScanning(false);
  };

  useEffect(() => { fetchBios(); }, []);

  const cores = [
    { name: 'Beetle PSX HW', ver: '0.9.44', status: 'Up to Date', load: '12%' },
    { name: 'mGBA', ver: '0.10.3', status: 'Up to Date', load: '2%' },
    { name: 'SwanStation', ver: '1.2.0', status: 'Up to Date', load: '8%' },
    { name: 'PCSX2 (EE)', ver: '2.1.0', status: 'Up to Date', load: '22%' },
  ];

  const presets = [
    { id: 'native', label: 'Native Resolution', desc: '1:1 Pixel Mapping' },
    { id: '1080p', label: '2x Upscale (1080p)', desc: 'CRT-Hyllian Shader' },
    { id: '4k', label: 'Extreme (4K)', desc: 'CRT-Royale / Max Samples' },
  ];

  const verifiedCount = biosFiles.filter(b => b.status === 'VERIFIED').length;
  const isSystemReady = biosPath !== null && biosFiles.length > 0 && verifiedCount === biosFiles.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
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
             <span className="text-[10px] font-black font-mono text-nexus-accent tracking-widest uppercase italic">
               GPU: {stats.gpu.available ? `${stats.gpu.load}% LOAD` : 'AWAITING nvidia-smi'}
             </span>
          </div>
          <button onClick={fetchBios} disabled={isScanning}
            className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-40">
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-nexus-accent' : 'text-nexus-muted'}`} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* BIOS Vault */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> System BIOS Vault
            </h4>
            <span className="text-[10px] font-mono text-nexus-muted">{verifiedCount}/{biosFiles.length} OK</span>
          </div>

          <div className="glass-panel p-6 rounded-[32px] border-white/5 space-y-4">
            {isScanning ? (
              <div className="flex items-center gap-3 text-nexus-muted py-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Scanning BIOS directory...</span>
              </div>
            ) : !biosPath ? (
              <div className="py-6 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                <p className="text-xs text-nexus-muted">BIOS path not configured.<br/>Set it in Vault Manager → BIOS Directory.</p>
              </div>
            ) : biosFiles.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                <p className="text-xs text-nexus-muted">No known BIOS files found in:<br/><code className="text-nexus-accent text-[10px]">{biosPath}</code></p>
              </div>
            ) : (
              biosFiles.map((bios, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                  <div className="space-y-1">
                    <p className="text-xs font-bold">{bios.name}</p>
                    <p className="text-[8px] font-mono text-nexus-muted tracking-widest uppercase">
                      {bios.size} | {bios.hash ? `MD5: ${bios.hash.slice(0, 8)}…` : bios.status}
                    </p>
                  </div>
                  {bios.status === 'VERIFIED' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : bios.status === 'HASH_MISMATCH' ? (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0" />
                  )}
                </div>
              ))
            )}
            <div className="pt-2">
               <p className="text-[9px] text-center text-nexus-muted uppercase font-black italic tracking-wider">
                 Place .bin/.rom files in BIOS dir
               </p>
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
                    <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-widest">
                      RTX 3060 Ti · Vulkan Driver · {stats.gpu.available ? `${stats.gpu.load}% GPU` : 'GPU telemetry pending'}
                    </p>
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
                       <span className="text-[10px] font-black text-nexus-muted uppercase">GPU Load</span>
                       <span className="text-[10px] font-mono text-nexus-accent">
                         {stats.gpu.available ? `${stats.gpu.load}%` : 'N/A'}
                       </span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div
                         animate={{ width: stats.gpu.available ? `${stats.gpu.load}%` : '0%' }}
                         transition={{ duration: 0.5 }}
                         className="h-full bg-nexus-accent"
                       />
                    </div>
                 </div>
                 <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-nexus-muted uppercase">CPU Load</span>
                       <span className="text-[10px] font-mono text-nexus-accent">{stats.cpu.load}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div
                         animate={{ width: `${stats.cpu.load}%` }}
                         transition={{ duration: 0.5 }}
                         className="h-full bg-nexus-accent"
                       />
                    </div>
                 </div>
                 <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-nexus-muted uppercase">RAM Pressure</span>
                       <span className="text-[10px] font-mono text-nexus-accent">{stats.memory.usedPercent}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div
                         animate={{ width: `${stats.memory.usedPercent}%` }}
                         transition={{ duration: 0.5 }}
                         className={`h-full ${stats.memory.usedPercent > 80 ? 'bg-red-500' : 'bg-nexus-accent'}`}
                       />
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
                 <span className="text-[10px] font-mono text-nexus-muted">Vulkan Backend Active</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 {cores.map((core, i) => (
                    <div key={i} className="p-6 glass-panel border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/5 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-nexus-accent transition-colors">
                             <Cpu className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                             <p className="font-bold">{core.name}</p>
                             <div className="flex gap-2">
                                <span className="text-[8px] font-mono text-nexus-muted uppercase">v{core.ver}</span>
                                <span className="text-[8px] font-black uppercase italic text-green-500">{core.status}</span>
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
                    {isSystemReady ? 'SYSTEM READY TO LAUNCH' : !biosPath ? 'CONFIGURE BIOS PATH' : 'DIAGNOSTIC INCOMPLETE'}
                 </p>
                 <p className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest">
                    BIOS: {verifiedCount}/{biosFiles.length} | CORES: {cores.length} | CPU: {stats.cpu.load}% | RAM: {stats.memory.usedPercent}%
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="hidden md:flex flex-col text-right">
                 <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">GPU Load</span>
                 <span className="text-lg font-mono font-black text-white italic">
                   {stats.gpu.available ? `${stats.gpu.load}%` : 'N/A'}
                 </span>
              </div>
              <button disabled={!isSystemReady} className="px-10 py-4 bg-white text-black font-black italic rounded-xl hover:scale-105 active:scale-95 transition-all shadow-2xl tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed">
                 GLOBAL START
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
