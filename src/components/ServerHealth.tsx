import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Server, Zap, Database, Activity, HardDrive, Wifi, ShieldCheck, Globe, Cpu } from 'lucide-react';

export const ServerHealth: React.FC = () => {
  const [readSpeed, setReadSpeed] = useState(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setReadSpeed(Math.random() > 0.7 ? Math.random() * 500 + 400 : Math.random() * 50 + 10);
      setPulse(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Server className="w-3 h-3" /> Core_Infrastructure
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight">Mainframe Diagnostics</h2>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black font-mono text-green-500 uppercase tracking-widest">NEXUS_OS: CONNECTED</span>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Read Speed Widget */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
                 <Activity className="w-3 h-3 text-nexus-accent" /> Data_Memory_Throughput
              </h4>
              <span className="font-mono text-xs text-nexus-accent">{readSpeed.toFixed(1)} MB/s</span>
           </div>
           
           <div className="h-32 flex items-end gap-1">
              {[...Array(40)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [`${Math.random() * 10 + 5}%`, `${readSpeed > 300 ? Math.random() * 80 + 20 : Math.random() * 20 + 5}%`] }}
                  className={`flex-1 rounded-t-sm ${readSpeed > 300 ? 'bg-nexus-accent' : 'bg-nexus-accent/30'}`}
                />
              ))}
           </div>
           <div className="flex justify-between font-mono text-[8px] text-nexus-muted uppercase">
              <span>0s ago</span>
              <span>Buffer: 128MB</span>
              <span>120s ago</span>
           </div>
        </div>

        {/* Latency / Network */}
        <div className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col justify-between">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
                 <Zap className="w-3 h-3 text-yellow-500" /> Connection_Pulse
              </h4>
              <div className="space-y-1">
                 <p className="text-4xl font-black italic tracking-tighter">{"< 1ms"}</p>
                 <p className="text-[10px] font-mono text-nexus-muted uppercase">Latency: Local Cloud</p>
              </div>
           </div>
           <div className="pt-6 border-t border-white/5 space-y-3">
              <div className="flex justify-between text-[10px]">
                 <span className="text-nexus-muted uppercase font-bold tracking-widest">Protocol</span>
                 <span className="text-white font-mono">QUIC / HTTP3</span>
              </div>
              <div className="flex justify-between text-[10px]">
                 <span className="text-nexus-muted uppercase font-bold tracking-widest">Auth</span>
                 <span className="text-green-500 font-mono flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> VERIFIED</span>
              </div>
           </div>
        </div>

        {/* Status Hub */}
        <div className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col justify-between bg-nexus-accent/5 border-nexus-accent/10">
           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-accent flex items-center gap-2">
                 <Globe className="w-3 h-3" /> Node_Status
              </h4>
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold">SQLITE_WAL_ACTIVE</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold">VIRTUAL_FS_LINKED</span>
                 </div>
              </div>
           </div>
           <div className="space-y-2">
              <div className="text-[8px] font-black text-nexus-muted uppercase mb-1">Server Cluster</div>
              <div className="flex gap-1 h-3">
                 {[1,1,1,1,1,0].map((v, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${v ? 'bg-nexus-accent' : 'bg-white/5'}`} />
                 ))}
              </div>
              <p className="text-[8px] font-mono text-right opacity-50 uppercase tracking-widest">Node_Cluster_01</p>
           </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         {/* Storage Rings */}
         <div className="glass-panel p-8 rounded-3xl border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2 mb-8">
               <Database className="w-4 h-4 text-purple-400" /> Remote_SSD_Array
            </h4>
            <div className="flex items-center gap-12">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                     <circle cx="64" cy="64" r="58" className="stroke-white/5 fill-none" strokeWidth="8" />
                     <motion.circle 
                       cx="64" cy="64" r="58" 
                       className="stroke-nexus-accent fill-none" 
                       strokeWidth="8" 
                       strokeDasharray="364.4" 
                       initial={{ strokeDashoffset: 364.4 }}
                       animate={{ strokeDashoffset: 364.4 * (1 - 0.72) }}
                     />
                  </svg>
                  <div className="absolute text-center">
                     <span className="text-xl font-black italic block">72%</span>
                     <span className="text-[8px] text-nexus-muted uppercase font-black">NVME_X2</span>
                  </div>
               </div>
               
               <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-nexus-muted uppercase">ROM Archive</span>
                        <span>4.2 TB / 6 TB</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div animate={{ width: '72%' }} className="h-full bg-nexus-accent" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-nexus-muted uppercase">Saves & Cache</span>
                        <span>240 GB / 1 TB</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div animate={{ width: '24%' }} className="h-full bg-purple-500" />
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Core Stats */}
         <div className="glass-panel p-8 rounded-3xl border-white/5 grid grid-cols-2 gap-8">
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black text-nexus-muted uppercase tracking-widest mb-1">Process Temp</p>
                  <p className="text-3xl font-black italic">42°C</p>
               </div>
               <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-nexus-accent" />
                  <div className="space-y-0.5">
                     <p className="text-[8px] font-black text-nexus-muted uppercase">Workload</p>
                     <p className="text-[10px] font-bold">BALANCED_IO</p>
                  </div>
               </div>
            </div>
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black text-nexus-muted uppercase tracking-widest mb-1">Uptime</p>
                  <p className="text-3xl font-black italic">14<span className="text-sm font-normal">d</span> 22<span className="text-sm font-normal">h</span></p>
               </div>
               <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  <div className="space-y-0.5">
                     <p className="text-[8px] font-black text-nexus-muted uppercase">S.M.A.R.T</p>
                     <p className="text-[10px] font-bold text-green-500">HEALTHY</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
