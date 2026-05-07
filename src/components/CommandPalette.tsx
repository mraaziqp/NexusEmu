import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Gamepad2, Laptop, Settings, Terminal, Command, Hash, X } from 'lucide-react';
import { useGames } from '../hooks/useGames';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onSelectGame }) => {
  const [query, setQuery] = useState('');
  const { games } = useGames();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // This would be handled by parent state
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredGames = games.filter(g => 
    g.title.toLowerCase().includes(query.toLowerCase()) || 
    g.platform.toLowerCase().includes(query.toLowerCase())
  );

  const systems = ['NES', 'SNES', 'N64', 'PS1', 'PS2', 'GBA'].filter(s => 
    s.toLowerCase().includes(query.toLowerCase())
  );

  const actions = [
    { label: 'Sync Cloud Vault', icon: Laptop },
    { label: 'Controller Diagnostics', icon: Gamepad2 },
    { label: 'System Settings', icon: Settings },
    { label: 'Metadata Re-scan', icon: Terminal }
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10"
        >
          <div className="flex items-center px-6 border-b border-white/5 py-4 gap-4 ring-2 ring-nexus-accent/20 focus-within:ring-nexus-accent/50 transition-all">
            <Search className="w-5 h-5 text-nexus-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search games, systems, or commands..."
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-nexus-muted"
            />
            <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-[10px] text-nexus-muted font-bold font-mono">
              <Command className="w-3 h-3" /> K
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-2">
            {/* Quick Filters */}
            <div className="flex gap-2 p-4 pt-2 overflow-x-auto no-scrollbar">
              {['/games', '/psx', '/n64', '/sync'].map(tag => (
                <button 
                  key={tag}
                  className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-nexus-muted hover:text-nexus-accent hover:border-nexus-accent/30 transition-all font-mono"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="space-y-6 pb-6">
              {filteredGames.length > 0 && (
                <section className="space-y-1">
                  <h4 className="px-4 text-[10px] font-black text-nexus-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Gamepad2 className="w-3 h-3" /> Games
                  </h4>
                  {filteredGames.map(game => (
                    <button
                      key={game.id}
                      onClick={() => {
                        onSelectGame(game);
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-nexus-accent/10 rounded-xl transition-all group"
                    >
                      <img src={game.boxArt} className="w-10 h-10 rounded shadow-lg object-cover" />
                      <div className="flex-1 text-left">
                        <p className="font-bold text-sm tracking-tight">{game.title}</p>
                        <p className="text-[10px] text-nexus-muted uppercase font-black">{game.platform}</p>
                      </div>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 font-mono text-nexus-accent">Launch →</span>
                    </button>
                  ))}
                </section>
              )}

              {actions.length > 0 && (
                <section className="space-y-1">
                  <h4 className="px-4 text-[10px] font-black text-nexus-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Commands
                  </h4>
                  {actions.map(action => (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                        <action.icon className="w-4 h-4 text-nexus-muted" />
                      </div>
                      <span className="flex-1 text-left font-medium text-sm">{action.label}</span>
                      <span className="text-[10px] font-mono text-nexus-muted opacity-50 uppercase">Settings</span>
                    </button>
                  ))}
                </section>
              )}

              {systems.length > 0 && (
                 <section className="space-y-1">
                  <h4 className="px-4 text-[10px] font-black text-nexus-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Hash className="w-3 h-3" /> Platforms
                  </h4>
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {systems.map(system => (
                      <button
                        key={system}
                        className="flex items-center gap-3 px-3 py-3 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all text-left"
                      >
                        <div className="w-6 h-6 rounded bg-nexus-accent/20 flex items-center justify-center">
                          <span className="text-[8px] font-black">{system[0]}</span>
                        </div>
                        <span className="text-sm font-medium">{system}</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[9px] font-mono font-bold text-nexus-muted tracking-widest">
            <div className="flex gap-4">
              <span>↑↓ NAVIGATE</span>
              <span>ENTER SELECT</span>
            </div>
            <span>ESC TO DISMISS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
