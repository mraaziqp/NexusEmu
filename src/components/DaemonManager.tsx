import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, RotateCcw, Database, Cloud, Wifi } from 'lucide-react';
import { DaemonLog } from '../types';
import { useTelemetry } from '../hooks/useTelemetry';

export const DaemonManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<DaemonLog[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { stats } = useTelemetry(2000);

  // Load historic logs
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/daemon/logs')
      .then(r => r.json())
      .then((data: DaemonLog[]) => setLogs(data))
      .catch(() => {});
  }, [isOpen]);

  // SSE for real-time log streaming
  useEffect(() => {
    if (!isOpen) return;
    const es = new EventSource('/api/daemon/stream');
    es.onmessage = (e) => {
      const entry = JSON.parse(e.data) as DaemonLog;
      if (entry.level) {
        setLogs(prev => [...prev.slice(-99), entry]);
      }
    };
    return () => es.close();
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const services = [
    { id: 'db',     name: 'Neon PostgreSQL',    status: 'active',   metric: `${stats.memory.usedPercent}% RAM` },
    { id: 'ai',     name: 'Gemini AI Core',     status: 'active',   metric: 'gemini-2.0-flash' },
    { id: 'cpu',    name: 'CPU Telemetry',       status: 'active',   metric: `${stats.cpu.load}% LOAD` },
    { id: 'gpu',    name: 'GPU (RTX 3060 Ti)',   status: stats.gpu.available ? 'active' : 'indexing', metric: stats.gpu.available ? `${stats.gpu.load}%` : 'nvidia-smiâ€¦' },
  ];

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
                   <span className="text-[10px] font-mono text-nexus-accent font-bold">SYSTEM_LEVEL: ROOT Â· CPU {stats.cpu.load}%</span>
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
                   <span className="text-[10px] font-mono text-nexus-muted">Nodes: {services.length.toString().padStart(2, '0')}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                   {services.map(s => (
                      <div key={s.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                         <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                               s.status === 'active' ? 'bg-green-500' :
                               s.status === 'indexing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                            }`} />
                            <div>
                               <p className="text-xs font-bold">{s.name}</p>
                               <p className="text-[8px] font-mono text-nexus-muted uppercase">{s.metric}</p>
                            </div>
                         </div>
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
                   <span className="uppercase tracking-widest font-black text-[9px]">Live Process Stream Â· SSE</span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 text-white/50">
                   {logs.map((entry, i) => (
                      <p key={i} className={`flex gap-3 ${
                        entry.level === 'WARN'  ? 'text-yellow-500/80' :
                        entry.level === 'ERROR' ? 'text-red-500/80' :
                        entry.level === 'DEBUG' ? 'text-blue-400/60' : ''
                      }`}>
                         <span className="opacity-30 shrink-0">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                         <span className="shrink-0 font-bold">[{entry.level}]</span>
                         <span className="shrink-0 text-nexus-accent/60">[{entry.source}]</span>
                         <span className="break-all">{entry.message}</span>
                      </p>
                   ))}
                   <div ref={logEndRef} />
                   <div className="w-2 h-4 bg-nexus-accent animate-pulse inline-block align-middle ml-2" />
                </div>
             </div>
          </div>

          <div className="p-4 bg-nexus-accent/10 border-t border-white/5 flex items-center justify-center gap-8">
             <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-nexus-accent" />
                <span className="text-[9px] font-mono font-bold">NEON_POSTGRES</span>
             </div>
             <div className="flex items-center gap-2">
                <Cloud className="w-3 h-3 text-nexus-accent" />
                <span className="text-[9px] font-mono font-bold">GEMINI_AI_ACTIVE</span>
             </div>
             <div className="flex items-center gap-2">
                <Wifi className="w-3 h-3 text-nexus-accent" />
                <span className="text-[9px] font-mono font-bold">SSE_STREAM: LIVE</span>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
