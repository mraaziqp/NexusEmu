import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Laptop, 
  Smartphone, 
  Headset, 
  RefreshCw, 
  Cloud, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  User,
  Activity,
  History
} from 'lucide-react';

export const DeviceManager: React.FC = () => {
  const [showConflict, setShowConflict] = useState(false);
  
  const devices = [
    { name: 'CachyOS Main Rig', specs: 'RTX 3060 Ti', status: 'Online', icon: Laptop, lastSync: '10m ago', active: true },
    { name: 'Meta Quest 3S', specs: 'Snapdragon XR2 Gen 2', status: 'Offline', icon: Headset, lastSync: '2h ago', active: false },
    { name: 'Razer Kishi / iPhone', specs: 'Mobile Client', status: 'Online', icon: Smartphone, lastSync: '1s ago', active: true }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Active Profile Header */}
      <div className="glass-panel p-8 rounded-[32px] border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden bg-nexus-accent/5">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Cloud className="w-48 h-48" />
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-nexus-accent to-purple-500 p-0.5 shadow-2xl">
            <div className="w-full h-full rounded-[22px] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
               <User className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-1">
             <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">Nexus_User_01</h2>
             <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-nexus-accent text-[8px] font-black rounded uppercase tracking-widest">Verified Resident</span>
                <span className="text-[10px] font-mono text-nexus-muted flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Cloud saves encrypted</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-4 relative z-10">
           <div className="text-right">
              <p className="text-[10px] font-black text-nexus-muted uppercase tracking-widest mb-1">Global Save State</p>
              <div className="flex items-center gap-2 text-green-500 font-mono text-sm font-bold">
                 <RefreshCw className="w-4 h-4 animate-spin-slow" />
                 SYNCHRONIZED
              </div>
           </div>
           <button 
             onClick={() => setShowConflict(true)}
             className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-nexus-muted hover:text-white transition-colors flex items-center gap-2"
           >
              <History className="w-3 h-3" /> SIMULATE SAVE CONFLICT
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden transition-all group ${
              device.active ? 'border-nexus-accent/20 bg-nexus-accent/5' : ''
            }`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <device.icon className="w-16 h-16" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-3 rounded-2xl border ${device.active ? 'bg-nexus-accent/20 border-nexus-accent/30' : 'bg-white/5 border-white/5'}`}>
                 <device.icon className={`w-6 h-6 ${device.active ? 'text-nexus-accent' : 'text-nexus-muted'}`} />
              </div>
              <div className="space-y-0.5">
                 <h4 className="font-bold tracking-tight">{device.name}</h4>
                 <p className="text-[10px] text-nexus-muted uppercase font-mono">{device.specs}</p>
              </div>
            </div>

            <div className="space-y-3 relative z-10">
               <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-nexus-muted uppercase">Status</span>
                  <span className={device.status === 'Online' ? 'text-green-500' : 'text-nexus-muted'}>{device.status}</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-nexus-muted uppercase">Last Sync</span>
                  <span>{device.lastSync}</span>
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
               <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-nexus-muted uppercase tracking-widest">Auto-Pull Saves</span>
               </div>
               <div className="relative w-10 h-5 bg-white/5 rounded-full border border-white/10 group-hover:border-nexus-accent/30 transition-colors">
                  <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full ${device.active ? 'bg-nexus-accent translate-x-5' : 'bg-nexus-muted'} transition-transform`} />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showConflict && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowConflict(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="w-full max-w-xl bg-nexus-surface border border-yellow-500/30 rounded-3xl p-8 relative z-10 shadow-[0_0_50px_rgba(234,179,8,0.2)]"
             >
                <div className="flex items-center gap-4 mb-6">
                   <div className="p-3 bg-yellow-500/20 rounded-2xl border border-yellow-500/30">
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black italic tracking-tighter uppercase">Save Conflict Detected</h3>
                      <p className="text-nexus-muted text-xs font-mono">HASH_MISMATCH: Super Metroid (SNES)</p>
                   </div>
                </div>

                <p className="text-sm text-nexus-muted mb-8 leading-relaxed">
                   Two devices have produced out-of-sync save states. Select the master record to preserve.
                </p>

                <div className="space-y-4">
                   <button className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all flex items-center justify-between group">
                      <div className="flex gap-4 items-center">
                         <div className="p-3 bg-nexus-accent/10 rounded-xl group-hover:bg-nexus-accent/20 transition-colors text-nexus-accent">
                            <Laptop className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold">Local Device Save</p>
                            <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-widest">TIMESTAMP: 2024-05-06 14:15:22</p>
                         </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-nexus-muted group-hover:text-white transition-colors" />
                   </button>

                   <button className="w-full p-6 bg-white/5 border border-nexus-accent/30 rounded-2xl text-left hover:bg-nexus-accent/10 transition-all flex items-center justify-between group ring-1 ring-nexus-accent/40">
                      <div className="flex gap-4 items-center">
                         <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors text-purple-400">
                            <Cloud className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold">Cloud Vault Save (Latest)</p>
                            <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-widest">TIMESTAMP: 2024-05-06 14:22:15</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-black text-nexus-accent bg-nexus-accent/20 px-3 py-1 rounded">RECOMMENDED</span>
                   </button>
                </div>

                <button 
                  onClick={() => setShowConflict(false)}
                  className="w-full mt-8 py-4 bg-nexus-muted/10 hover:bg-white/5 text-[10px] font-black tracking-widest text-nexus-muted hover:text-white rounded-xl transition-all uppercase"
                >
                   Cancel Extraction
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
