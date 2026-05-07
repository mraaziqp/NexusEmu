import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, Play, RotateCcw, AlertCircle, CheckCircle2, ShieldCheck, Database, Cloud, Wifi } from 'lucide-react';

export const DaemonManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<string[]>([
    '[INFO] Nexus OS Daemon initialized',
    '[INFO] Local Asset Server mounted at port 3000',
    '[INFO] PostgreSQL instance link established',
    '[WARN] Port 5353 (Discovery) is currently restricted by kernel'
  ]);

  const [services, setServices] = useState([
    { id: 'fs', name: 'Tauri File Watcher', status: 'active', load: '1.2%' },
    { id: 'db', name: 'PostgreSQL Instance', status: 'active', load: '4.5%' },
    { id: 'sync', name: 'S3 Sync Engine', status: 'indexing', load: '12%' },
    { id: 'assets', name: 'Local Asset Server', status: 'active', load: '0.8%' }
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const msgs = [
        `[INFO] Scanned ${Math.floor(Math.random() * 50)} files in /roms/${['snes', 'n64', 'psx'][Math.floor(Math.random() * 3)]}`,
        `[INFO] Background sync task complete (CRC32 verified)`,
        `[WARN] Delta detected in slot ${Math.floor(Math.random() * 10)}`,
        `[DEBUG] Memory page allocated at 0x${Math.random().toString(16).substr(2, 8).toUpperCase()}`
      ];
      setLogs(prev => [...prev.slice(-15), msgs[Math.floor(Math.random() * msgs.length)]]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col h-[600px]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-nexus-accent/5">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-nexus-accent/20 rounded-xl border border-nexus-accent/30">
                <Cpu className="w-5 h-5 text-nexus-accent" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black italic tracking-tight uppercase">Nexus Daemon Controller</h3>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-[10px] font-mono text-nexus-accent font-bold">SYSTEM_LEVEL: ROOT</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
               <RotateCcw className="w-4 h-4 text-nexus-muted" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
             {/* Service List */}
             <div className="p-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Microservice Registry</h4>
                   <span className="text-[10px] font-mono text-nexus-muted">Nodes: 04</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                   {services.map(s => (
                      <div key={s.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                               s.status === 'active' ? 'bg-green-500' :
                               s.status === 'indexing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                            }`} title={s.status} />
                            <div>
                               <p className="text-xs font-bold">{s.name}</p>
                               <p className="text-[8px] font-mono text-nexus-muted uppercase">LOAD: {s.load}</p>
                            </div>
                         </div>
                         <button className="p-2 opacity-0 group-hover:opacity-100 hover:text-nexus-accent transition-all">
                            <RotateCcw className="w-3.5 h-3.5" />
                         </button>
                      </div>
                   ))}
                </div>
             </div>

             {/* Terminal window */}
             <div className="flex-1 min-h-0 bg-black/40 border-t border-white/10 p-6 font-mono text-[10px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 pointer-events-none">
                   <Terminal className="w-24 h-24 opacity-[0.03]" />
                </div>
                <div className="flex items-center gap-2 mb-4 text-nexus-muted">
                   <Terminal className="w-3 h-3" />
                   <span className="uppercase tracking-widest font-black text-[9px]">Live Process Stream</span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 text-white/50">
                   {logs.map((log, i) => (
                      <p key={i} className={`flex gap-3 ${log.includes('[WARN]') ? 'text-yellow-500/80' : log.includes('[DEBUG]') ? 'text-blue-400/60' : ''}`}>
                         <span className="opacity-30 shrink-0">{(i + 1).toString().padStart(3, '0')}</span>
                         <span className="break-all">{log}</span>
                      </p>
                   ))}
                   <div className="w-2 h-4 bg-nexus-accent animate-pulse inline-block align-middle ml-2" />
                </div>
             </div>
          </div>

          <div className="p-4 bg-nexus-accent/10 border-t border-white/5 flex items-center justify-center gap-8">
             <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-nexus-accent" />
                <span className="text-[9px] font-mono font-bold">SQLITE_PERSISTENCE: ON</span>
             </div>
             <div className="flex items-center gap-2">
                <Cloud className="w-3 h-3 text-nexus-accent" />
                <span className="text-[9px] font-mono font-bold">AWS_DELTA_ACTIVE</span>
             </div>
             <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-nexus-accent" />
                <span className="text-[9px] font-mono font-bold">LOCAL_HNDSHAKE: 100%</span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
