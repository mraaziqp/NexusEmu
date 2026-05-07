import React from 'react';
import { motion } from 'motion/react';
import { Clock, Smartphone, Gamepad2, Trophy, Flame, Calendar, TrendingUp, Monitor } from 'lucide-react';
import { MOCK_GAMES } from '../data/mockGames';

export const ActivityStats: React.FC = () => {
  // Mock data for the heat map (contribution graph style)
  const days = Array.from({ length: 140 }, (_, i) => ({
    intensity: Math.floor(Math.random() * 5), // 0 to 4
    date: new Date(Date.now() - (139 - i) * 24 * 60 * 60 * 1000)
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <TrendingUp className="w-3 h-3" /> Gameplay_Metrics_v4
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Activity Hub</h2>
        </div>
        
        <div className="flex items-center gap-4 px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
          <span className="text-xs font-bold font-mono">12 DAY STREAK</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Time Wallet */}
        <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
            <Clock className="w-3 h-3" /> Time Wallet
          </h4>
          
          <div className="space-y-6">
            <div className="p-4 bg-nexus-accent/5 border border-nexus-accent/20 rounded-2xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-nexus-muted uppercase">Global Total</span>
                <span className="text-[10px] font-mono text-nexus-accent">RANK: ELITE</span>
              </div>
              <p className="text-4xl font-black italic tracking-tighter">440.5 <span className="text-sm font-normal text-nexus-muted">H</span></p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Monitor className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-nexus-muted uppercase">Consoles</span>
                    <span>300 Hours</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '68%' }} className="h-full bg-blue-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-nexus-muted uppercase">Handhelds</span>
                    <span>140 Hours</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '32%' }} className="h-full bg-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playback Heat Map */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border-white/5 space-y-6 flex flex-col">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Engagement Heatmap
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-nexus-muted uppercase">Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(v => (
                  <div key={v} className={`w-2 h-2 rounded-sm ${
                    v === 0 ? 'bg-white/5' : v === 1 ? 'bg-nexus-accent/20' : v === 2 ? 'bg-nexus-accent/40' : v === 3 ? 'bg-nexus-accent/70' : 'bg-nexus-accent'
                  }`} />
                ))}
              </div>
              <span className="text-[8px] text-nexus-muted uppercase">More</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex gap-4 mb-2">
              {months.map(m => (
                <span key={m} className="text-[10px] font-mono text-nexus-muted uppercase flex-1">{m}</span>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {days.map((day, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-[2px] transition-all hover:scale-150 relative group ${
                    day.intensity === 0 ? 'bg-white/5' :
                    day.intensity === 1 ? 'bg-nexus-accent/20' :
                    day.intensity === 2 ? 'bg-nexus-accent/40' :
                    day.intensity === 3 ? 'bg-nexus-accent/70' : 'bg-nexus-accent shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  }`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-1 px-2 bg-nexus-surface border border-white/10 rounded text-[8px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                    {day.date.toLocaleDateString()} | {day.intensity * 2}h
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Currently Playing / Most Launched */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2 px-1">
          <Gamepad2 className="w-3 h-3 text-nexus-accent" /> Active Objectives
        </h4>
        <div className="grid md:grid-cols-3 gap-6">
          {MOCK_GAMES.slice(0, 3).map((game, i) => {
            const hlbTime = 40; // Mock average completion time
            const progress = (game.playtime / 60 / hlbTime) * 100;
            
            return (
              <motion.div 
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-5 rounded-3xl border-white/5 hover:bg-white/5 transition-colors relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Trophy className="w-12 h-12 text-nexus-accent" />
                </div>
                
                <div className="flex gap-4 mb-6 relative z-10">
                  <img src={game.boxArt} className="w-12 h-16 rounded-lg object-cover shadow-2xl" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-nexus-accent uppercase tracking-widest">{game.platform}</p>
                    <h5 className="text-sm font-bold leading-tight line-clamp-1">{game.title}</h5>
                    <p className="text-[10px] font-mono text-nexus-muted">{game.playtime} MIN ACCUMULATED</p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-nexus-muted uppercase">Completion Progress</p>
                      <p className="text-lg font-black italic tracking-tighter">{progress.toFixed(0)}%</p>
                    </div>
                    <p className="text-[9px] font-mono text-nexus-muted pb-1">ETR: {Math.max(0, hlbTime - Math.floor(game.playtime/60))}H</p>
                  </div>
                  <div className="h-2 bg-white/5 border border-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-nexus-accent/40 to-nexus-accent rounded-full" 
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
