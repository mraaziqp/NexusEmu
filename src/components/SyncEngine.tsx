import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HardDrive, Cloud, ArrowRightLeft, CheckCircle2, AlertCircle, RefreshCw, Database, Terminal, ShieldCheck, History } from 'lucide-react';

interface SyncEvent {
  id: string;
  timestamp: string;
  message: string;
  status: 'info' | 'success' | 'warning';
}

export const SyncEngine: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<SyncEvent[]>([]);
  const [healthStatus, setHealthStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const esRef = useRef<EventSource | null>(null);

  // Subscribe to server SSE for real daemon logs
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setHealthStatus(data.database === 'connected' ? 'connected' : 'disconnected'))
      .catch(() => setHealthStatus('disconnected'));

    // Bridge daemon SSE into sync log format
    const es = new EventSource('/api/daemon/stream');
    esRef.current = es;
    es.onmessage = (e) => {
      const entry = JSON.parse(e.data);
      if (entry.level) {
        const newLog: SyncEvent = {
          id: Math.random().toString(36).slice(2),
          timestamp: new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          message: `[${entry.source}] ${entry.message}`,
          status: entry.level === 'ERROR' ? 'warning' : entry.level === 'WARN' ? 'warning' : entry.level === 'INFO' && entry.message.includes('complete') ? 'success' : 'info',
        };
        setLogs(prev => [newLog, ...prev.slice(0, 15)]);
      }
    };
    return () => es.close();
  }, []);

  const addLog = (message: string, status: 'info' | 'success' | 'warning' = 'info') => {
    const newLog: SyncEvent = {
      id: Math.random().toString(36).slice(2),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      status,
    };
    setLogs(prev => [newLog, ...prev.slice(0, 15)]);
  };

  const handleForceSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addLog('Manual sync initiated', 'info');

    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.database === 'connected') {
        addLog('Neon PostgreSQL handshake: verified', 'success');
        addLog('Scanning local vault for save state deltas...', 'info');
        // Trigger a vault scan to refresh the DB
        const scanRes = await fetch('/api/vault/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const scanData = await scanRes.json();
        if (scanRes.ok) {
          addLog(`Vault sync complete: ${scanData.scanned ?? 0} files checked`, 'success');
        } else {
          addLog(scanData.error ?? 'Vault scan skipped (no root path)', 'warning');
        }
      } else {
        addLog('Database offline — sync deferred', 'warning');
      }
    } catch (e) {
      addLog(`Sync error: ${e}`, 'warning');
    } finally {
      setIsSyncing(false);
    }
  };


  return (
    <div className="space-y-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Cloud className="w-3 h-3" /> AWS_Delta_Sync_v1.4
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Cloud Vault Console</h2>
        </div>
        
        <button 
          onClick={handleForceSync}
          disabled={isSyncing}
          className={`px-8 py-4 rounded-xl flex items-center gap-3 transition-all active:scale-95 border ${
            isSyncing 
              ? 'bg-nexus-accent/10 border-nexus-accent/40 text-nexus-accent cursor-not-allowed' 
              : 'bg-nexus-accent border-nexus-accent/50 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
          }`}
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="font-bold tracking-tight">FORCE GLOBAL SYNC</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {/* Left Pane: Local */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <HardDrive className="w-4 h-4 text-nexus-muted" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Local Storage (Nexus OS)</h4>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <HardDrive className="w-24 h-24" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">SSD_M2_NEXUS</span>
                <span className="text-[10px] font-mono text-green-500">OPTIMIZED</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-nexus-muted uppercase tracking-widest">
                  <span>Directory Scan</span>
                  <span>424 Files</span>
                </div>
                <div className="flex gap-1 h-1.5">
                  {[1, 1, 1, 1, 1, 0, 0, 0].map((v, i) => (
                    <div key={i} className={`flex-1 rounded-full ${v ? 'bg-nexus-accent/60' : 'bg-white/5'}`} />
                  ))}
                </div>
              </div>
              
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[9px] space-y-2">
                <div className="flex justify-between">
                  <span className="text-nexus-muted">Save Path:</span>
                  <span className="text-white/80">/emu/saves/</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nexus-muted">Last Write:</span>
                  <span className="text-white/80 text-right">Super Metroid (2m ago)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Pane: Activity Bridge */}
        <div className="space-y-4 lg:order-2">
          <div className="flex items-center gap-2 px-2">
            <div className="p-2 bg-nexus-accent/10 rounded-lg border border-nexus-accent/20">
              <ArrowRightLeft className="w-4 h-4 text-nexus-accent" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-accent">Sync activity stream</h4>
          </div>

          <div className="glass-panel p-4 rounded-3xl border-nexus-accent/20 h-[400px] overflow-hidden flex flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1">
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 relative group hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono font-bold opacity-30 group-hover:opacity-100 transition-opacity">[{log.timestamp}]</span>
                      {log.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : log.status === 'warning' ? (
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                      ) : (
                        <Terminal className="w-3 h-3 text-nexus-accent/50" />
                      )}
                    </div>
                    <p className={`text-[11px] font-mono leading-tight ${
                      log.status === 'success' ? 'text-green-500/80' : 
                      log.status === 'warning' ? 'text-yellow-500/80' : 'text-white/80'
                    }`}>
                      {log.message}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="pt-4 border-t border-white/5 mt-auto">
              <div className="flex items-center justify-center gap-2 p-2 bg-nexus-accent/5 rounded-xl border border-nexus-accent/10">
                <ShieldCheck className="w-4 h-4 text-nexus-accent" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Encryption Active: AES-256</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Cloud */}
        <div className="space-y-4 lg:order-3">
          <div className="flex items-center gap-2 px-2">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
              <Cloud className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Cloud Vault (AWS S3)</h4>
          </div>
          
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Cloud className="w-24 h-24" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold block italic uppercase tracking-tighter">Nexus_Global_Root</span>
                  <span className="text-[10px] text-nexus-muted font-mono">Region: US-EAST-1</span>
                </div>
                <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-nexus-muted uppercase tracking-[0.2em]">Capacity Usage</p>
                      <p className="font-mono text-xl font-bold">124.5 <span className="text-xs text-nexus-muted">MB</span></p>
                   </div>
                   <p className="text-[10px] font-mono text-nexus-muted pb-1">12.4% Used</p>
                </div>
                <div className="h-4 bg-white/5 border border-white/10 rounded-full overflow-hidden p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '12.4%' }}
                    className="h-full bg-gradient-to-r from-purple-500 to-nexus-accent rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                   <p className="text-[8px] font-black text-nexus-muted uppercase">Retention</p>
                   <p className="text-xs font-bold italic">FOREVER</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                   <p className="text-[8px] font-black text-nexus-muted uppercase">Multi-AZ</p>
                   <p className="text-xs font-bold text-green-500/80 italic">ENABLED</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <History className="w-5 h-5 text-nexus-muted" />
                <div className="space-y-0.5">
                   <p className="text-[10px] font-black text-nexus-muted uppercase">Last Global Checkpoint</p>
                   <p className="text-xs font-bold">5 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
