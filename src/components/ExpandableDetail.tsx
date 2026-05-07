import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from '../types';
import { X, Play, Clock, Trophy, Calendar, Users, Star, Info, Cloud, Smartphone, Monitor, Gamepad, Share2, BookOpen, Database } from 'lucide-react';
import { AIGameGuide } from './AIGameGuide';

interface ExpandableDetailProps {
  game: Game | null;
  onClose: () => void;
  onLaunch: (game: Game) => void;
}

export const ExpandableDetail: React.FC<ExpandableDetailProps> = ({ game, onClose, onLaunch }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AnimatePresence>
      {game && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
          />

          <motion.div
            layoutId={`card-${game.id}`}
            className="w-full max-w-6xl h-full max-h-[85vh] bg-nexus-surface rounded-3xl overflow-hidden relative flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
          >
            {/* Background Image Hero */}
            <div className="absolute inset-0 z-0">
              <motion.img 
                src={game.heroImage} 
                className="w-full h-full object-cover opacity-20"
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-nexus-surface via-nexus-surface/80 to-transparent"
                style={{ backgroundColor: `${game.dominantColor}10` }}
              />
            </div>

            {/* Left Column: Visuals (Sidebar) */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="relative z-10 w-full md:w-[380px] p-8 flex flex-col glass-panel border-y-0 border-l-0"
            >
              <motion.img
                layoutId={`image-${game.id}`}
                src={game.boxArt}
                alt={game.title}
                className="w-full rounded-2xl shadow-2xl mb-8 border border-white/10"
              />
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <motion.button 
                    animate={{ 
                      boxShadow: ['0 0 0px rgba(59, 130, 246, 0)', '0 0 20px rgba(59, 130, 246, 0.4)', '0 0 0px rgba(59, 130, 246, 0)']
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    onClick={() => onLaunch(game)}
                    className="w-full py-4 bg-nexus-accent hover:bg-nexus-accent/90 rounded-xl font-bold flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    <Play className="fill-current w-5 h-5 ml-1" />
                    PLAY NOW
                  </motion.button>
                  
                  {/* Controller Profile Badge */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="bg-nexus-accent/20 p-2 rounded-lg">
                      <Gamepad className="w-4 h-4 text-nexus-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-nexus-muted uppercase">Controller Profile</p>
                      <p className="text-xs font-bold text-white/90">Xbox Core Controller <span className="text-green-500 text-[10px] ml-1">• Auto-Mapped</span></p>
                    </div>
                  </div>
                </div>

                {/* Time Wallet */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-nexus-muted px-1">Session Data</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <Monitor className="w-4 h-4 mx-auto mb-1 text-nexus-accent" />
                      <p className="text-[10px] font-bold">{(game.playtime / 60 * 0.7).toFixed(1)}h</p>
                      <p className="text-[8px] text-nexus-muted uppercase">Desktop</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                      <Smartphone className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                      <p className="text-[10px] font-bold">{(game.playtime / 60 * 0.3).toFixed(1)}h</p>
                      <p className="text-[8px] text-nexus-muted uppercase">Mobile</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <div className="flex items-center gap-2 text-xs text-nexus-muted mb-2">
                    <Info className="w-3 h-3" />
                    <span>EMULATOR: RETROARCH v1.17</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Data */}
            <div className="relative z-10 flex-1 p-8 md:p-12 overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <motion.span 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-xs font-black tracking-[0.3em] text-nexus-accent uppercase mb-2 block"
                  >
                    SYSTEM: {game.platform}
                  </motion.span>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-5xl font-black leading-tight italic"
                  >
                    {game.title}
                  </motion.h1>
                </div>
                <div className="flex gap-2">
                   <button className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/5">
                      <Share2 className="w-5 h-5 text-nexus-muted" />
                   </button>
                   <button 
                     onClick={onClose}
                     className="p-3 hover:bg-white/10 rounded-full transition-colors"
                   >
                     <X className="w-6 h-6" />
                   </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 border-b border-white/5 mb-8 shrink-0 overflow-x-auto no-scrollbar">
                {[
                  { id: 'overview', label: 'Overview', icon: Info },
                  { id: 'guide', label: 'AI Game Guide', icon: BookOpen },
                  { id: 'metadata', label: 'Technical Spec', icon: Database }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-[10px] font-black uppercase tracking-widest relative whitespace-nowrap flex items-center gap-2 transition-colors ${
                      activeTab === tab.id ? 'text-white' : 'text-nexus-muted hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-3 h-3" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div layoutId="detail-tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-nexus-accent rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div 
                      key="overview"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="space-y-12 pb-12"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] text-nexus-muted flex items-center gap-1 uppercase font-bold tracking-wider">
                            <Star className="w-3 h-3" />Rating
                          </p>
                          <p className="font-mono text-xl">{game.metadata.rating}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-nexus-muted flex items-center gap-1 uppercase font-bold tracking-wider">
                            <Calendar className="w-3 h-3" />Released
                          </p>
                          <p className="font-mono text-xl">{game.metadata.releaseDate.split('-')[0]}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-nexus-muted flex items-center gap-1 uppercase font-bold tracking-wider">
                            <Users className="w-3 h-3" />Players
                          </p>
                          <p className="font-mono text-xl">{game.metadata.players}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-nexus-muted flex items-center gap-1 uppercase font-bold tracking-wider">
                            <Clock className="w-3 h-3" />Playtime
                          </p>
                          <p className="font-mono text-xl">{(game.playtime / 60).toFixed(0)}h <span className="text-xs text-nexus-muted">{game.playtime % 60}m</span></p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-nexus-muted text-[10px] font-black uppercase tracking-[0.2em]">Metadata Analysis</h3>
                        <p className="text-lg leading-relaxed text-blue-50/80 font-medium italic">
                          "{game.metadata.description}"
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        {/* RetroAchievements Widget */}
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              RetroAchievements
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-nexus-accent">RANK: #420</span>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-nexus-muted">PROGRESS</span>
                                <span>14 / 50</span>
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '28%' }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className="h-full bg-gradient-to-r from-yellow-500 to-nexus-accent rounded-full" 
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center ${i <= 3 ? 'bg-yellow-500/10 grayscale-0' : 'bg-white/5 grayscale saturate-0'}`}>
                                  <Trophy className={`w-4 h-4 ${i <= 3 ? 'text-yellow-500' : 'text-white/20'}`} />
                                </div>
                              ))}
                              <div className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center text-[10px] font-bold text-nexus-muted">
                                +36
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-nexus-accent/10 rounded-2xl border border-nexus-accent/20 h-fit">
                          <h4 className="text-xs font-bold mb-4 flex items-center gap-2 text-nexus-accent">
                             <Cloud className="w-4 h-4" />
                             AWS Delta-Sync
                          </h4>
                          <div className="space-y-2">
                            <p className="text-[10px] leading-snug text-nexus-muted">
                              Latest .SRM hash verified. Secure channel active. Your progress is synced to 'Global_Cluster_01'.
                            </p>
                            <div className="pt-4 flex items-center gap-2">
                              <div className="animate-pulse w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-[10px] font-mono uppercase tracking-widest">STATE: CONSISTENT</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'guide' && (
                    <motion.div 
                      key="guide"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="h-full"
                    >
                      <AIGameGuide title={game.title} />
                    </motion.div>
                  )}

                  {activeTab === 'metadata' && (
                    <motion.div 
                      key="metadata"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="space-y-6"
                    >
                       <div className="p-6 bg-white/5 rounded-2xl border border-white/5 font-mono text-[10px] space-y-4">
                          <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-nexus-muted uppercase">SHA256_HASH</span>
                             <span className="text-white break-all text-right max-w-[200px]">8F1A2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-nexus-muted uppercase">File_System</span>
                             <span className="text-white">EXT4 / Encrypted</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-nexus-muted uppercase">BIOS_Linked</span>
                             <span className="text-green-500">YES (SCPH-1001.BIN)</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-nexus-muted uppercase">Mapper_ID</span>
                             <span className="text-white">vRC6_TYPE_B</span>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
