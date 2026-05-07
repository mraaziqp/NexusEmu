import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Cpu, Activity, Database, AlertCircle, Sparkles, Loader2, Layers } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { GameCard } from './components/GameCard';
import { ExpandableDetail } from './components/ExpandableDetail';
import { ControllerSettings } from './components/ControllerSettings';
import { SyncEngine } from './components/SyncEngine';
import { ScannerInbox } from './components/ScannerInbox';
import { CommandPalette } from './components/CommandPalette';
import { BootSequence } from './components/BootSequence';
import { ServerHealth } from './components/ServerHealth';
import { ActivityStats } from './components/ActivityStats';
import { SetupWizard } from './components/SetupWizard';
import { DeviceManager } from './components/DeviceManager';
import { RemotePairing } from './components/RemotePairing';
import { StorageTiering } from './components/StorageTiering';
import { SpatialView } from './components/SpatialView';
import { DaemonManager } from './components/DaemonManager';
import { VaultManager } from './components/VaultManager';
import { PlaylistHub } from './components/PlaylistHub';
import { CoreForge } from './components/CoreForge';
import { MOCK_GAMES } from './data/mockGames';
import { Game, SystemStatus } from './types';
import { scrapeMetadata } from './services/aiService';

export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [bootingGame, setBootingGame] = useState<Game | null>(null);
  const [isSpatialMode, setIsSpatialMode] = useState(false);
  const [isDaemonOpen, setIsDaemonOpen] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(() => {
    return !localStorage.getItem('nexus_initialized');
  });
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<SystemStatus>({
    cpuLoad: 12,
    gpuLoad: 4,
    controllersLinked: 1,
    cloudSyncEnabled: true,
    lastSync: new Date().toISOString()
  });

  // Filter games based on search
  const filteredGames = MOCK_GAMES.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock system load fluctuation
  useEffect(() => {
    const handlePaletteKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handlePaletteKey);
    return () => window.removeEventListener('keydown', handlePaletteKey);
  }, []);

  useEffect(() => {
    const handleDaemonKey = (e: KeyboardEvent) => {
      if (e.key === '`') {
        e.preventDefault();
        setIsDaemonOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleDaemonKey);
    return () => window.removeEventListener('keydown', handleDaemonKey);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        cpuLoad: Math.floor(Math.random() * 20) + 10,
        gpuLoad: Math.floor(Math.random() * 10) + 2
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    // Simulate finding a messy ROM
    setTimeout(() => {
      setIsScanning(false);
      // In a real app, this would add a new game to state
      alert("AI Metadata Scraper: Found 'zelda_majora_mask_v1_0.z64' - Analysis complete.");
    }, 2000);
  };

  const handleLaunch = (game: Game) => {
    setSelectedGame(null);
    setBootingGame(game);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-nexus-bg text-white relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col min-w-0 h-full p-4 md:p-8 relative overflow-y-auto no-scrollbar">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
          <div className="space-y-1">
            <h2 className="text-nexus-muted text-[10px] font-black uppercase tracking-[0.3em]">
              Nexus_System_v2.0.4
            </h2>
            <h1 className="text-4xl font-black italic tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted group-focus-within:text-nexus-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 w-full md:w-80 focus:outline-none focus:ring-1 focus:ring-nexus-accent/50 focus:bg-white/10 transition-all font-medium text-sm"
              />
            </div>
            
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="px-6 py-3 bg-nexus-accent/10 border border-nexus-accent/30 rounded-2xl flex items-center gap-2 hover:bg-nexus-accent/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isScanning ? (
                <Loader2 className="w-4 h-4 animate-spin text-nexus-accent" />
              ) : (
                <Plus className="w-4 h-4 text-nexus-accent" />
              )}
              <span className="font-bold text-sm text-nexus-accent">SCAN</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="relative h-full flex flex-col gap-8">
          {activeTab === 'library' && (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Cpu, label: 'CPU LOAD', value: `${status.cpuLoad}%`, color: 'text-nexus-accent' },
                  { icon: Activity, label: 'GPU LATENCY', value: `${status.gpuLoad}ms`, color: 'text-blue-400' },
                  { icon: Database, label: 'LIB SIZE', value: `${MOCK_GAMES.length} TITLES`, color: 'text-purple-400' },
                  { icon: AlertCircle, label: 'SYNC', value: 'ACTIVE', color: 'text-green-500' }
                ].map((stat, i) => (
                  <div key={i} className="glass-panel p-4 rounded-2xl flex flex-col gap-1 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-nexus-muted pb-1">
                      <stat.icon className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Grid Section */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-20">
                <AnimatePresence mode="popLayout">
                  {filteredGames.map((game, i) => (
                    <GameCard 
                      key={game.id} 
                      game={game} 
                      index={i} 
                      onSelect={(g) => setSelectedGame(g)} 
                    />
                  ))}
                </AnimatePresence>
                
                {/* Empty State */}
                {filteredGames.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-nexus-muted space-y-4">
                    <Search className="w-12 h-12 opacity-20" />
                    <p className="font-medium tracking-tight">No items found matching your query.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'sync' && (
            <SyncEngine />
          )}

          {activeTab === 'spatial' && (
            <div className="flex-1 flex items-center justify-center p-20">
               <div className="text-center space-y-6 max-w-md">
                  <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl inline-block mb-4">
                     <Layers className="w-12 h-12 text-blue-400" />
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Enter Spatial Hub?</h3>
                  <p className="text-nexus-muted text-sm pb-4">
                     Nexus will recalibrate the library for 3D panoramic projection. Recommended for Quest 3 / Vision Pro users.
                  </p>
                  <button 
                    onClick={() => setIsSpatialMode(true)}
                    className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all uppercase tracking-widest italic"
                  >
                    Calibrate & Launch
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <StorageTiering />
          )}

          {activeTab === 'vaults' && (
            <VaultManager />
          )}

          {activeTab === 'playlists' && (
            <PlaylistHub />
          )}

          {activeTab === 'forge' && (
            <CoreForge />
          )}

          {activeTab === 'scanner' && (
            <ScannerInbox />
          )}

          {activeTab === 'activity' && (
            <ActivityStats />
          )}

          {activeTab === 'profile' && (
            <DeviceManager />
          )}

          {activeTab === 'handheld' && (
            <RemotePairing />
          )}

          {activeTab === 'controller' && (
            <ControllerSettings />
          )}
          
          {activeTab === 'info' && (
            <ServerHealth />
          )}
          
          {activeTab === 'settings' && (
             <div className="max-w-2xl space-y-8">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-nexus-accent">AI Pipeline Configuration</h3>
                  <div className="glass-panel p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="font-bold">Deep-Web Consensus (Gemini)</p>
                          <p className="text-xs text-nexus-muted">Use Gemini 1.5 to identify broken filenames.</p>
                       </div>
                       <input type="checkbox" checked readOnly className="accent-nexus-accent w-4 h-4" />
                    </div>
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="font-bold">Color-Thief Theming</p>
                          <p className="text-xs text-nexus-muted">Dynamically adjust UI colors based on box art.</p>
                       </div>
                       <input type="checkbox" checked readOnly className="accent-nexus-accent w-4 h-4" />
                    </div>
                  </div>
                </section>
                
                <section className="space-y-4">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-nexus-accent">Input Mapping</h3>
                   <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <Sparkles className="w-6 h-6 text-yellow-500" />
                         <div>
                            <p className="font-bold">PS5 DualSense Detected</p>
                            <p className="text-xs text-nexus-muted">VID: 0x054C / PID: 0x0CE6</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-mono px-3 py-1 bg-green-500/20 text-green-500 rounded border border-green-500/30">ZERO-CONFIG MAPPED</span>
                   </div>
                </section>
             </div>
          )}
        </div>
      </main>

      <ExpandableDetail 
        game={selectedGame} 
        onClose={() => setSelectedGame(null)} 
        onLaunch={handleLaunch}
      />
      
      {/* Dynamic Background Gradient */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0 transition-colors duration-1000"
            style={{ 
              background: `radial-gradient(circle at 100% 0%, ${selectedGame.dominantColor} 0%, transparent 100%)` 
            }}
          />
        )}
      </AnimatePresence>

      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)}
        onSelectGame={(game) => handleLaunch(game)}
      />

      <BootSequence 
        game={bootingGame} 
        onComplete={() => setBootingGame(null)} 
      />

      <AnimatePresence>
        {isFirstLaunch && (
          <SetupWizard onComplete={() => {
            setIsFirstLaunch(false);
            localStorage.setItem('nexus_initialized', 'true');
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSpatialMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
             <SpatialView />
             {/* Overlay closer for demo */}
             <button 
               onClick={() => setIsSpatialMode(false)}
               className="fixed top-12 left-1/2 -translate-x-1/2 p-4 px-8 glass-panel border-white/10 rounded-full text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/10 transition-all z-[160]"
             >
               Exit Spatial Environment
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DaemonManager isOpen={isDaemonOpen} onClose={() => setIsDaemonOpen(false)} />
    </div>
  );
}
