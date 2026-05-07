import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HardDrive, Archive, ArrowRightLeft, Zap, ShieldAlert, Cpu, Database, Save, ArrowDown, Activity } from 'lucide-react';
import { MOCK_GAMES } from '../data/mockGames';

interface StorageItem {
  id: string;
  title: string;
  size: string;
  platform: string;
  tier: 'hot' | 'cold';
}

export const StorageTiering: React.FC = () => {
  const [items, setItems] = useState<StorageItem[]>(
    MOCK_GAMES.map((g, i) => ({
      id: g.id,
      title: g.title,
      platform: g.platform,
      size: (Math.random() * 2 + 0.5).toFixed(1) + ' GB',
      tier: i < 4 ? 'hot' : 'cold'
    }))
  );
  const [smartCache, setSmartCache] = useState(true);

  const moveItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, tier: item.tier === 'hot' ? 'cold' : 'hot' } : item
    ));
  };

  const hotItems = items.filter(i => i.tier === 'hot');
  const coldItems = items.filter(i => i.tier === 'cold');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Database className="w-3 h-3" /> Data_Lifecycle_Manager
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Storage Tiering</h2>
        </div>
        
        <div className="flex items-center gap-6 px-6 py-3 glass-panel rounded-2xl border-white/5">
           <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-nexus-accent" />
              <div className="space-y-0.5">
                 <p className="text-[8px] font-black text-nexus-muted uppercase">Drive Health</p>
                 <p className="text-xs font-bold text-nexus-accent">82% - STABLE</p>
              </div>
           </div>
           <div className="w-px h-8 bg-white/10" />
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-nexus-muted uppercase">Smart Cache</span>
              <button 
                onClick={() => setSmartCache(!smartCache)}
                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                  smartCache ? 'bg-nexus-accent' : 'bg-white/10'
                }`}
              >
                <motion.div 
                  animate={{ x: smartCache ? 22 : 2 }}
                  className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full"
                />
              </button>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-stretch h-[calc(100vh-280px)]">
        {/* Hot Storage Zone */}
        <div className="glass-panel rounded-[40px] border-white/5 p-8 flex flex-col space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="w-32 h-32" />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-nexus-accent/10 rounded-2xl border border-nexus-accent/20">
                <HardDrive className="w-6 h-6 text-nexus-accent" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold tracking-tight uppercase italic text-nexus-accent">Hot Storage</h4>
                <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-[0.2em]">NVMe_Array_Nexus_0</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-nexus-muted uppercase">Capacity</p>
               <p className="font-mono text-sm font-bold text-white">420GB / 1TB</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 relative z-10">
            <AnimatePresence mode="popLayout">
              {hotItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50, scale: 0.95 }}
                  className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-10 bg-nexus-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="space-y-1">
                        <p className="text-xs font-bold">{item.title}</p>
                        <div className="flex gap-2">
                           <span className="text-[9px] font-mono p-1 px-1.5 bg-white/5 rounded leading-none text-nexus-muted">{item.platform}</span>
                           <span className="text-[9px] font-mono p-1 px-1.5 bg-white/5 rounded leading-none text-nexus-accent font-bold italic">{item.size}</span>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => moveItem(item.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 bg-nexus-surface border border-white/10 rounded-lg hover:border-nexus-accent text-nexus-muted hover:text-nexus-accent transition-all"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="pt-6 border-t border-white/5 space-y-4">
             <div className="flex items-center gap-3 p-4 bg-nexus-accent/5 rounded-2xl border border-nexus-accent/10">
                <Activity className="w-4 h-4 text-nexus-accent animate-pulse" />
                <p className="text-[10px] text-nexus-muted leading-tight">
                  <span className="text-nexus-accent font-bold">SMART_TIERING_DAEMON:</span> High-priority access enabled. Write leveling is being optimized for primary NVMe.
                </p>
             </div>
          </div>
        </div>

        {/* Cold Storage Zone */}
        <div className="glass-panel rounded-[40px] border-white/5 p-8 flex flex-col space-y-6 relative overflow-hidden bg-white/[0.02]">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Archive className="w-32 h-32" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-nexus-muted/10 rounded-2xl border border-white/5">
                <Archive className="w-6 h-6 text-nexus-muted" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold tracking-tight uppercase italic">Cold Vault</h4>
                <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-[0.2em]">Network_NAS_Archive</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-nexus-muted uppercase">Available</p>
               <p className="font-mono text-sm font-bold text-white">4.2TB / 8TB</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 relative z-10">
            <AnimatePresence mode="popLayout">
              {coldItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all opacity-60 hover:opacity-100"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-1.5 h-10 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                     <div className="space-y-1">
                        <p className="text-xs font-bold">{item.title}</p>
                        <div className="flex gap-2">
                           <span className="text-[9px] font-mono p-1 px-1.5 bg-white/5 rounded leading-none text-nexus-muted">{item.platform}</span>
                           <span className="text-[9px] font-mono p-1 px-1.5 bg-white/5 rounded leading-none text-white/40">{item.size}</span>
                        </div>
                     </div>
                  </div>
                  <button 
                    onClick={() => moveItem(item.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 bg-nexus-surface border border-white/10 rounded-lg hover:border-white/40 text-nexus-muted hover:text-white transition-all"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="pt-6 border-t border-white/5">
             <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-[10px] font-black text-nexus-muted uppercase tracking-widest px-2">
                   <span>Archive Compression</span>
                   <span className="text-nexus-accent">LZ4_ENHANCED</span>
                </div>
                <div className="h-2 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden">
                   <motion.div animate={{ width: '42%' }} className="h-full bg-white/20" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
