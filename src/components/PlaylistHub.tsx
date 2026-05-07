import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'motion/react';
import { 
  Cloud, 
  HardDrive, 
  LayoutGrid, 
  Star, 
  Smartphone, 
  Zap, 
  Trash2, 
  Share2, 
  FileJson,
  AlertTriangle,
  Settings,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Game, Playlist } from '../types';
import { useGames } from '../hooks/useGames';

export const PlaylistHub: React.FC = () => {
  const { games, loading } = useGames();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [playlistGames, setPlaylistGames] = useState<Game[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/playlists')
      .then(r => r.json())
      .then((data: Playlist[]) => {
        setPlaylists(data);
        if (data.length > 0) {
          setActivePlaylist(data[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activePlaylist && games.length > 0) {
      setPlaylistGames(
        activePlaylist.game_ids
          .map(id => games.find(g => g.id === id))
          .filter(Boolean) as Game[]
      );
    } else {
      setPlaylistGames([]);
    }
  }, [activePlaylist, games]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    setIsCreating(true);
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPlaylistName.trim(), game_ids: [], is_portable: true }),
    });
    if (res.ok) {
      const created: Playlist = await res.json();
      setPlaylists(prev => [...prev, created]);
      setActivePlaylist(created);
      setNewPlaylistName('');
    }
    setIsCreating(false);
  };

  const handleAddToPlaylist = async (game: Game) => {
    if (!activePlaylist) return;
    if (activePlaylist.game_ids.includes(game.id)) return;
    const updated = { ...activePlaylist, game_ids: [...activePlaylist.game_ids, game.id] };
    setActivePlaylist(updated);
    setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
    await fetch(`/api/playlists/${activePlaylist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_ids: updated.game_ids }),
    });
  };

  const handleRemoveFromPlaylist = async (gameId: string) => {
    if (!activePlaylist) return;
    const updated = { ...activePlaylist, game_ids: activePlaylist.game_ids.filter(id => id !== gameId) };
    setActivePlaylist(updated);
    setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
    await fetch(`/api/playlists/${activePlaylist.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_ids: updated.game_ids }),
    });
  };

  const handleExport = () => {
    if (!activePlaylist) return;
    const manifest = {
      playlist_name: activePlaylist.name,
      exported_at: new Date().toISOString(),
      games: playlistGames.map(g => ({ id: g.id, title: g.title, platform: g.platform, relative_path: g.relativePath })),
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlaylist.name.replace(/\s+/g, '_')}_nexus-playlist.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const libraryGames = games.filter(g => !activePlaylist?.game_ids.includes(g.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <LayoutGrid className="w-3 h-3" /> Collection_Engine_v4
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Playlist Hub</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            value={newPlaylistName}
            onChange={e => setNewPlaylistName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
            placeholder="New playlist name..."
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-nexus-accent/50"
          />
          <button onClick={handleCreatePlaylist} disabled={isCreating || !newPlaylistName.trim()}
            className="px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/30 rounded-xl flex items-center gap-2 hover:bg-nexus-accent/20 transition-all disabled:opacity-50">
            {isCreating ? <RefreshCw className="w-4 h-4 animate-spin text-nexus-accent" /> : <Plus className="w-4 h-4 text-nexus-accent" />}
            <span className="text-[10px] font-black text-nexus-accent uppercase tracking-widest">CREATE</span>
          </button>
        </div>
      </div>

      {/* Playlist Tabs */}
      {playlists.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {playlists.map(p => (
            <button key={p.id} onClick={() => setActivePlaylist(p)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                activePlaylist?.id === p.id
                  ? 'bg-nexus-accent border-nexus-accent text-white'
                  : 'bg-white/5 border-white/10 text-nexus-muted hover:text-white'
              }`}>
              {p.name} ({p.game_ids.length})
            </button>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-12 min-h-[600px]">
        {/* Cloud Library (Source) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <Cloud className="w-5 h-5 text-blue-400" />
                 <h4 className="font-bold tracking-tight uppercase italic underline decoration-blue-500/50 underline-offset-4">Cloud Library</h4>
              </div>
              <span className="text-[10px] font-mono text-nexus-muted">
                {loading ? 'LOADING...' : `${games.length} TITLES`}
              </span>
           </div>

           <div className="glass-panel p-6 rounded-[40px] border-white/5 space-y-4 bg-white/[0.01] h-full">
              <div className="grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar max-h-[500px] p-2">
                 {libraryGames.map((game) => (
                    <motion.div
                      key={game.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleAddToPlaylist(game)}
                      className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
                    >
                       {game.boxArt ? (
                         <img src={game.boxArt} className="w-8 h-10 object-cover rounded shadow-lg" alt="" />
                       ) : (
                         <div className="w-8 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center text-[8px] font-mono text-nexus-muted uppercase">{game.platform.slice(0,3)}</div>
                       )}
                       <div className="space-y-1 overflow-hidden">
                          <p className="text-[10px] font-bold truncate">{game.title}</p>
                          <p className="text-[8px] font-mono text-nexus-muted uppercase">{game.platform}</p>
                       </div>
                    </motion.div>
                 ))}
                 {!loading && libraryGames.length === 0 && (
                   <div className="col-span-2 py-12 text-center text-nexus-muted opacity-40">
                     <p className="text-xs font-black uppercase tracking-widest">All games added to playlist</p>
                   </div>
                 )}
              </div>
              <div className="pt-4 mt-auto">
                 <p className="text-[9px] text-center text-nexus-muted uppercase font-black italic tracking-wider">Click to add to playlist</p>
              </div>
           </div>
        </div>

        {/* Playlist (Destination) */}
        <div className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <HardDrive className="w-5 h-5 text-nexus-accent" />
                 <h4 className="font-bold tracking-tight uppercase italic underline decoration-nexus-accent/50 underline-offset-4">
                   {activePlaylist?.name ?? 'No Playlist Selected'}
                 </h4>
              </div>
              {activePlaylist && (
                <span className="text-[10px] font-mono text-nexus-accent">{playlistGames.length} TITLES</span>
              )}
           </div>

           <div className="glass-panel p-8 rounded-[40px] border-nexus-accent/20 bg-nexus-accent/[0.03] space-y-8 flex flex-col h-full border-dashed border-2">
              {!activePlaylist ? (
                <div className="flex-1 flex flex-col items-center justify-center text-nexus-muted opacity-40 space-y-4">
                  <LayoutGrid className="w-12 h-12" />
                  <p className="text-xs uppercase font-black tracking-widest italic">Create a playlist first</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar max-h-[400px]">
                     {playlistGames.map((game, i) => (
                        <motion.div
                          key={game.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group transition-all hover:bg-white/10"
                        >
                           <div className="flex items-center gap-4">
                              {game.boxArt ? (
                                <img src={game.boxArt} className="w-10 h-12 object-cover rounded-lg shadow-xl" alt="" />
                              ) : (
                                <div className="w-10 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[8px] font-mono text-nexus-muted uppercase">{game.platform.slice(0,3)}</div>
                              )}
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
                           <button onClick={() => handleRemoveFromPlaylist(game.id)}
                             className="p-2 opacity-0 group-hover:opacity-100 text-nexus-muted hover:text-red-400 transition-all">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </motion.div>
                     ))}
                     {playlistGames.length === 0 && (
                        <div className="h-48 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-nexus-muted space-y-4 opacity-40">
                           <LayoutGrid className="w-12 h-12" />
                           <p className="text-xs uppercase font-black tracking-widest italic">Click games to add</p>
                        </div>
                     )}
                  </div>

                  <div className="pt-8 border-t border-white/5 space-y-6 mt-auto">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Export as JSON</p>
                           <p className="text-[8px] font-mono text-nexus-accent">nexus-playlist.json</p>
                        </div>
                        <button onClick={() => setIsExporting(!isExporting)}
                          className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isExporting ? 'bg-nexus-accent' : 'bg-white/10'}`}>
                           <motion.div animate={{ x: isExporting ? 26 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                        </button>
                     </div>
                     <button onClick={handleExport} disabled={playlistGames.length === 0}
                       className="w-full py-5 bg-white text-black font-black italic rounded-2xl flex items-center justify-center gap-3 hover:bg-nexus-accent hover:text-white transition-all group tracking-tighter disabled:opacity-50">
                        <Share2 className="w-5 h-5" />
                        EXPORT PORTABLE PLAYLIST
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
