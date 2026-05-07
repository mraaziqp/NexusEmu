import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  FolderRoot, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  FileJson, 
  Box, 
  Database,
  Link,
  ChevronRight,
  Terminal,
  Unlink,
  HardDrive
} from 'lucide-react';

export const VaultManager: React.FC = () => {
  const [isRelinking, setIsRelinking] = useState(false);
  const [vaultStatus, setVaultStatus] = useState('VERIFIED');
  const [rootPath, setRootPath] = useState('/Volumes/GameDrive/RetroLib');

  const handleRelink = () => {
    setIsRelinking(true);
    setVaultStatus('SCANNING');
    setTimeout(() => {
      setIsRelinking(false);
      setVaultStatus('VERIFIED');
      // Mocked "healing" of paths
      setRootPath('/Volumes/NEXUS_VAULT_PRO/RetroLib');
    }, 2500);
  };

  const checklist = [
    { label: 'nexus-vault.json', desc: 'Relative path manifest', status: 'OK' },
    { label: '.nexus_assets/', desc: 'Local cover art bundle', status: 'OK' },
    { label: '.nexus_metadata/', desc: 'Offline game descriptions', status: 'OK' },
    { label: 'User Save States', desc: 'In-folder .SRM redirection', status: 'OK' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
             <Shield className="w-3 h-3" /> Architecture_Layer_v9
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Vault Management</h2>
        </div>
        
        <button className="px-6 py-3 bg-white text-black font-black flex items-center gap-3 rounded-xl hover:bg-nexus-accent hover:text-white transition-all group italic">
           <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
           CREATE PORTABLE VAULT
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Status & Relinking */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-panel p-8 rounded-[40px] border-white/10 bg-white/[0.02] relative overflow-hidden ring-1 ring-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <HardDrive className="w-48 h-48" />
              </div>

              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                 <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-nexus-muted uppercase tracking-widest">Active Root Path</label>
                       <div className="p-4 bg-black/40 border border-white/10 rounded-2xl font-mono text-sm flex items-center justify-between group overflow-hidden">
                          <span className="text-nexus-accent truncate mr-4">{rootPath}</span>
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest shrink-0">RELATIVE_MAPPING: ON</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                          <p className="text-[8px] font-black text-nexus-muted uppercase tracking-widest">Vault ID</p>
                          <p className="font-mono text-xs font-bold">NV-9412-PRB</p>
                       </div>
                       <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                          <p className="text-[8px] font-black text-nexus-muted uppercase tracking-widest">Linked Titles</p>
                          <p className="font-mono text-xs font-bold">142 Files</p>
                       </div>
                    </div>
                 </div>

                 <div className="md:w-64 space-y-4 flex flex-col justify-center border-l border-white/5 md:pl-8">
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full ${
                          vaultStatus === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                       }`} />
                       <span className="text-sm font-black italic tracking-tighter uppercase">{vaultStatus}</span>
                    </div>
                    <p className="text-[10px] text-nexus-muted leading-relaxed italic">
                       Portable Vault integrity is healthy. All local paths resolve relative to standard mount keys.
                    </p>
                    <button 
                      onClick={handleRelink}
                      disabled={isRelinking}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black tracking-widest hover:bg-nexus-accent hover:border-nexus-accent transition-all flex items-center justify-center gap-2"
                    >
                       {isRelinking ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                       ) : (
                          <Link className="w-3 h-3" />
                       )}
                       {isRelinking ? 'HEALING PATHS...' : 'RELINK DRIVE'}
                    </button>
                 </div>
              </div>

              {/* Terminal-style healing animation */}
              <AnimatePresence>
                {isRelinking && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 p-4 bg-black/60 rounded-2xl border border-nexus-accent/20 font-mono text-[10px] text-nexus-accent overflow-hidden"
                  >
                    <div className="space-y-1">
                       <p>{'>'} [SCANNING] Initializing Relink Sequence...</p>
                       <p>{'>'} [CHECK] Updating Root: {rootPath} {'->'} /Volumes/NEXUS_VAULT_PRO</p>
                       <p>{'>'} [RESOLVING] Recalculating relative paths for 142 titles...</p>
                       <p>{'>'} [VERIFY] Boxart checksum verification... OK</p>
                       <p>{'>'} [DONE] Vault integrity re-established.</p>
                       <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity }} className="w-2 h-3 bg-nexus-accent inline-block align-middle" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <section className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Portability Checklist
                 </h4>
                 <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <Box className="w-3 h-3 text-green-500" />
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Portable_Mode_Active</span>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 {checklist.map((item, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center group-hover:bg-nexus-accent group-hover:text-white transition-all">
                             <FileJson className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold">{item.label}</p>
                             <p className="text-[10px] text-nexus-muted">{item.desc}</p>
                          </div>
                       </div>
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="p-8 bg-nexus-accent rounded-[40px] text-white space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              <Database className="w-10 h-10 opacity-20" />
              <div className="space-y-2">
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">Sync Offline</h4>
                 <p className="text-sm text-white/80 leading-relaxed font-medium">
                    Vaults prioritize local assets over the Nexus Cloud. Perfect for travel or air-gapped systems.
                 </p>
              </div>
              <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
                 <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span>Cloud Master Sync</span>
                    <span>DISABLED</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span>Asset Locality</span>
                    <span>100% (LOCAL)</span>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6 bg-white/5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Unlink className="w-6 h-6 text-nexus-muted" />
                 </div>
                 <h4 className="font-bold tracking-tight">Decouple System</h4>
              </div>
              <p className="text-[10px] text-nexus-muted leading-relaxed">
                 Detach this client's association with the central Postgres metadata service and use the local `nexus-vault.json` manifest as the primary source.
              </p>
              <button className="w-full py-4 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all uppercase">
                 ENTER AIR-GAP MODE
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
