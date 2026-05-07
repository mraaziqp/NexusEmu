import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Gamepad2, 
  QrCode, 
  Copy, 
  Wifi, 
  Terminal, 
  Server, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  Search,
  Loader2
} from 'lucide-react';

export const RemotePairing: React.FC = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const pin = "7294-8142";

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Smartphone className="w-3 h-3" /> Bridge_Subsystem_v1.2
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Handheld Pairing</h2>
        </div>
        
        <div className="flex items-center gap-4">
           {isConnected ? (
              <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black font-mono text-green-500 tracking-widest uppercase">CLIENT_LINKED</span>
              </div>
           ) : (
              <div className="px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl flex items-center gap-3">
                 <Loader2 className="w-4 h-4 text-nexus-accent animate-spin" />
                 <span className="text-[10px] font-black font-mono text-nexus-accent tracking-widest uppercase italic">Awaiting handshake...</span>
              </div>
           )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Visual Pairing */}
        <div className="glass-panel p-10 rounded-[40px] border-white/5 flex flex-col items-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
          
          <div className="space-y-2 relative z-10">
            <h4 className="text-xl font-bold tracking-tight">Nexus App Connector</h4>
            <p className="text-xs text-nexus-muted max-w-xs mx-auto">Scan with your handheld device to instantly bridge library & save states.</p>
          </div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white rounded-3xl relative group cursor-pointer shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
             {/* Mocked QR Code */}
             <div className="w-48 h-48 grid grid-cols-6 grid-rows-6 gap-1.5 opacity-90 p-1">
                {[...Array(36)].map((_, i) => (
                   <div key={i} className={`rounded-[2px] ${Math.random() > 0.4 ? 'bg-black' : 'bg-gray-200'}`} />
                ))}
                {/* Fixed bits to look like QR */}
                <div className="absolute top-1 left-1 w-[31%] h-[31%] border-[6px] border-black rounded-lg bg-white" />
                <div className="absolute top-1 right-1 w-[31%] h-[31%] border-[6px] border-black rounded-lg bg-white" />
                <div className="absolute bottom-1 left-1 w-[31%] h-[31%] border-[6px] border-black rounded-lg bg-white" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                   <div className="w-full h-full bg-nexus-accent rounded-xl flex items-center justify-center">
                      <Smartphone className="text-white w-10 h-10" />
                   </div>
                </div>
             </div>
          </motion.div>

          <div className="space-y-4 pt-4 relative z-10 w-full">
             <p className="text-[10px] font-black text-nexus-muted uppercase tracking-[0.3em]">Manual Secure PIN</p>
             <div 
               onClick={handleCopy}
               className="group flex flex-col items-center cursor-pointer"
             >
                <div className="text-4xl font-mono font-black italic tracking-widest text-white/90 group-hover:text-nexus-accent transition-colors">
                   {pin}
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-nexus-muted uppercase tracking-widest">
                   {isCopied ? <span className="text-green-500">COPIED TO BUFFER</span> : <span>CLICK TO COPY PIN</span>}
                   <Copy className={`w-3 h-3 ${isCopied ? 'text-green-500' : ''}`} />
                </div>
             </div>
          </div>
        </div>

        {/* Homebrew / Legacy Bridge */}
        <div className="space-y-8">
           <section className="glass-panel p-8 rounded-[40px] border-white/5 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <Wifi className="w-6 h-6 text-purple-400" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-bold tracking-tight">FTP / SMB Legacy Bridge</h4>
                    <p className="text-[10px] text-nexus-muted uppercase font-mono tracking-widest">Protocol Version: 2.4.1 (AES_SECURE)</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-nexus-muted font-bold tracking-widest uppercase">Host Domain</span>
                       <span className="font-mono text-nexus-accent">192.168.1.142</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-nexus-muted font-bold tracking-widest uppercase">Active Port</span>
                       <span className="font-mono text-white">8080</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-nexus-muted font-bold tracking-widest uppercase">Link Credentials</span>
                       <span className="font-mono text-white italic">NEXUS_GUEST_7294</span>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-nexus-accent/5 border border-nexus-accent/20 rounded-2xl flex items-start gap-4">
                    <ShieldAlert className="w-5 h-5 text-nexus-accent shrink-0 mt-1" />
                    <p className="text-[10px] leading-relaxed text-nexus-muted italic font-medium">
                       Credentials refresh every 12 hours. Ensure your legacy handheld (Vita / 3DS) has the Nexus-Bridge homebrew installed.
                    </p>
                 </div>
              </div>

              <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 flex items-center justify-center gap-3 group text-sm font-bold">
                 DOWNLOAD NEXUS_BRIDGE.VPK <ArrowRight className="w-4 h-4 text-nexus-muted group-hover:translate-x-1 transition-transform" />
              </button>
           </section>

           {/* Network Environment */}
           <div className="p-8 bg-nexus-accent/5 rounded-[40px] border border-nexus-accent/10 space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-accent flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Runtime Discovery
                 </h4>
                 <span className="text-[8px] font-mono opacity-50">v1.2.0-STABLE</span>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap className="w-4 h-4 text-yellow-500" />
                       <span className="text-[10px] font-bold">DISCOVERY_UDP_PORT: 5353</span>
                    </div>
                    <span className="text-[10px] font-mono text-green-500">LISTENING</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Server className="w-4 h-4 text-nexus-accent" />
                       <span className="text-[10px] font-bold">MDNS_RESOLVER: NEXUS_SERVER</span>
                    </div>
                    <span className="text-[10px] font-mono text-green-500">RESOLVED</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
