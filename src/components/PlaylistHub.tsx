import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  HardDrive, 
  LayoutGrid, 
  Star, 
  Smartphone, 
  ExternalLink, 
  Zap, 
  Trash2, 
  Share2, 
  FileJson,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { MOCK_GAMES } from '../data/mockGames';

export const PlaylistHub: React.FC = () => {
  const [cloudGames, setCloudGames] = useState(MOCK_GAMES.slice(0, 8));
  const [portablePlaylist, setPortablePlaylist] = useState(MOCK_GAMES.slice(8, 12));
  const [isExporting, setIsExporting] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <LayoutGrid className="w-3 h-3" /> Collection_Engine_v4
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Playlist Hub</h2>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-nexus-accent italic flex items-center gap-2">
              <Zap className="w-4 h-4" /> Ready for Export
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 min-h-[600px]">
        {/* Cloud Library (Source) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <Cloud className="w-5 h-5 text-blue-400" />
                 <h4 className="font-bold tracking-tight uppercase italic underline decoration-blue-500/50 underline-offset-4">Cloud Library</h4>
              </div>
              <span className="text-[10px] font-mono text-nexus-muted">POSTGRES_REMOTE_ACTIVE</span>
           </div>

           <div className="glass-panel p-6 rounded-[40px] border-white/5 space-y-4 bg-white/[0.01] h-full">
              <div className="grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar max-h-[500px] p-2">
                 {cloudGames.map((game) => (
                    <motion.div
                      key={game.id}
                      layoutId={game.id}
                      whileHover={{ scale: 1.02 }}
                      className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
                    >
                       <img src={game.boxArt} className="w-8 h-10 object-cover rounded shadow-lg" alt="" />
                       <div className="space-y-1 overflow-hidden">
                          <p className="text-[10px] font-bold truncate">{game.title}</p>
                          <p className="text-[8px] font-mono text-nexus-muted uppercase">{game.platform}</p>
                       </div>
                    </motion.div>
                 ))}
              </div>
              <div className="pt-4 mt-auto">
                 <p className="text-[9px] text-center text-nexus-muted uppercase font-black italic tracking-wider">Drag items to initiate portable export</p>
              </div>
           </div>
        </div>

        {/* Portable Playlists (Destination) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <HardDrive className="w-5 h-5 text-nexus-accent" />
                 <h4 className="font-bold tracking-tight uppercase italic underline decoration-nexus-accent/50 underline-offset-4">Best of SNES (Portable)</h4>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                 <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle className="w-3 h-3" />
                    SYNC_CONFLICT
                 </div>
                 <button className="text-nexus-muted hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-[40px] border-nexus-accent/20 bg-nexus-accent/[0.03] space-y-8 flex flex-col h-full border-dashed border-2">
              <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar max-h-[400px]">
                 {portablePlaylist.map((game, i) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group transition-all hover:bg-white/10"
                    >
                       <div className="flex items-center gap-4">
                          <img src={game.boxArt} className="w-10 h-12 object-cover rounded-lg shadow-xl" alt="" />
                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <p className="text-sm font-bold">{game.title}</p>
                                {i === 0 && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                             </div>
                             <div className="flex gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest p-1 bg-white/5 rounded leading-none text-nexus-muted">{game.platform}</span>
                                <span className="text-[8px] font-mono p-1 bg-nexus-accent/10 rounded leading-none text-nexus-accent">PORTABLE_READY</span>
                             </div>
                          </div>
                       </div>
                       <button className="p-2 opacity-0 group-hover:opacity-100 text-nexus-muted hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </motion.div>
                 ))}

                 {portablePlaylist.length === 0 && (
                    <div className="h-48 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-nexus-muted space-y-4 opacity-40">
                       <LayoutGrid className="w-12 h-12" />
                       <p className="text-xs uppercase font-black tracking-widest italic">Drop to add to Vault</p>
                    </div>
                 )}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6 mt-auto">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Export for Portability</p>
                       <p className="text-[8px] font-mono text-nexus-accent">Generates: nexus-playlist.json</p>
                    </div>
                    <button 
                      onClick={() => setIsExporting(!isExporting)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                        isExporting ? 'bg-nexus-accent' : 'bg-white/10'
                      }`}
                    >
                       <motion.div 
                         animate={{ x: isExporting ? 26 : 2 }}
                         className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                       />
                    </button>
                 </div>

                 <button className="w-full py-5 bg-white text-black font-black italic rounded-2xl flex items-center justify-center gap-3 hover:bg-nexus-accent hover:text-white transition-all group tracking-tighter">
                    <Share2 className="w-5 h-5" />
                    DEPLOY TO PORTABLE VAULT
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* Sync Conflict Overlay example logic (simulated in view) */}
      <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-2xl">
               <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="space-y-1">
               <h5 className="font-bold tracking-tight">Sync Conflict Detected</h5>
               <p className="text-[10px] text-nexus-muted uppercase font-mono tracking-widest opacity-80">
                  Metadata for 'Chrono Trigger' in Vault differs from Cloud Master.
               </p>
            </div>
         </div>
         <button className="px-5 py-2 bg-yellow-500 text-black font-black text-[10px] uppercase rounded-xl hover:bg-yellow-400 transition-all">
            Resolve Conflict
         </button>
      </div>
    </div>
  );
};
