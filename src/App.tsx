import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Cpu, Activity, Database, AlertCircle, Loader2, Layers, Gamepad2, LayoutGrid, LayoutList } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { GameCard } from './components/GameCard';
import { ExpandableDetail } from './components/ExpandableDetail';
import { CommandPalette } from './components/CommandPalette';
import { BootSequence } from './components/BootSequence';
import { SetupWizard } from './components/SetupWizard';
import { DaemonManager } from './components/DaemonManager';
import { ToastContainer } from './components/Toast';
import { ProfileManager } from './components/ProfileManager';
import { FolderPickerInput } from './components/FolderPickerInput';
import { Game } from './types';
import { useGames } from './hooks/useGames';
import { useTelemetry } from './hooks/useTelemetry';
import { useToast } from './hooks/useToast';
import { useProfile } from './hooks/useProfile';
import { useGamepad, getNavItems, setNavFocus, clearNavFocus, clickFocused } from './hooks/useGamepad';
import { usePWAInstall } from './hooks/usePWAInstall';

// ─── Lazy-load heavy tab components ──────────────────────────────────────────
const SyncEngine      = lazy(() => import('./components/SyncEngine').then(m => ({ default: m.SyncEngine })));
const ScannerInbox    = lazy(() => import('./components/ScannerInbox').then(m => ({ default: m.ScannerInbox })));
const ControllerSettings = lazy(() => import('./components/ControllerSettings').then(m => ({ default: m.ControllerSettings })));
const ServerHealth    = lazy(() => import('./components/ServerHealth').then(m => ({ default: m.ServerHealth })));
const ActivityStats   = lazy(() => import('./components/ActivityStats').then(m => ({ default: m.ActivityStats })));
const RemotePairing   = lazy(() => import('./components/RemotePairing').then(m => ({ default: m.RemotePairing })));
const StorageTiering  = lazy(() => import('./components/StorageTiering').then(m => ({ default: m.StorageTiering })));
const SpatialView     = lazy(() => import('./components/SpatialView').then(m => ({ default: m.SpatialView })));
const VaultManager    = lazy(() => import('./components/VaultManager').then(m => ({ default: m.VaultManager })));
const PlaylistHub     = lazy(() => import('./components/PlaylistHub').then(m => ({ default: m.PlaylistHub })));
const CoreForge       = lazy(() => import('./components/CoreForge').then(m => ({ default: m.CoreForge })));

function TabLoader() {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-nexus-muted" />
    </div>
  );
}

const TABS = [
  'library','sync','spatial','storage','vaults','playlists','forge',
  'scanner','activity','profile','handheld','controller','info','settings',
];

const PLATFORM_DISPLAY: Record<string, string> = {
  ps1: 'PlayStation', ps2: 'PlayStation 2', ps3: 'PlayStation 3', psp: 'PlayStation Portable',
  nes: 'NES', snes: 'Super Nintendo', n64: 'Nintendo 64', gamecube: 'GameCube', wii: 'Wii',
  gba: 'Game Boy Advance', gbc: 'Game Boy Color', gb: 'Game Boy', nds: 'Nintendo DS',
  genesis: 'Sega Genesis', megadrive: 'Sega Mega Drive', dreamcast: 'Sega Dreamcast',
  saturn: 'Sega Saturn', gamegear: 'Sega Game Gear', '32x': 'Sega 32X',
  mame: 'Arcade (MAME)', neogeo: 'SNK Neo Geo', atari2600: 'Atari 2600',
  turbografx: 'TurboGrafx-16', unknown: 'Unknown',
};

function platformLabel(p: string) {
  return PLATFORM_DISPLAY[p.toLowerCase()] ?? p.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function App() {
  const [activeTab, setActiveTab]         = useState('library');
  const [selectedGame, setSelectedGame]   = useState<Game | null>(null);
  const [bootingGame, setBootingGame]     = useState<Game | null>(null);
  const [isSpatialMode, setIsSpatialMode] = useState(false);
  const [isDaemonOpen, setIsDaemonOpen]   = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(() => !localStorage.getItem('nexus_initialized'));
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [gpConnected, setGpConnected]     = useState(false);
  const [gpFocusIdx, setGpFocusIdx]       = useState(0);

  const { games, loading: gamesLoading, scanning: isScanning, scanVault, fetchGames } = useGames();
  const { stats }                      = useTelemetry(3000);
  const pwa                            = usePWAInstall();
  const { toasts, addToast, removeToast } = useToast();
  const profile                        = useProfile();

  const [groupByPlatform, setGroupByPlatform] = useState(true);

  const filteredGames = useMemo(() => games.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.platform.toLowerCase().includes(searchQuery.toLowerCase())
  ), [games, searchQuery]);

  const platformGroups = useMemo(() => {
    const map = new Map<string, Game[]>();
    for (const g of filteredGames) {
      const key = g.platform.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredGames]);

  // Reset controller focus index when tab changes
  useEffect(() => {
    setGpFocusIdx(0);
    clearNavFocus();
  }, [activeTab]);

  // Ghost Scanner SSE — only keep connection while tab is visible
  useEffect(() => {
    let es: EventSource | null = null;

    function connect() {
      if (es) return;
      es = new EventSource('/api/daemon/stream');
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'new-rom-detected' && data.game) {
            addToast('New title added to Vault', 'success', data.game);
            fetchGames();
          }
        } catch { /* heartbeat */ }
      };
    }

    function disconnect() {
      es?.close();
      es = null;
    }

    if (!document.hidden) connect();

    const onVisibility = () => {
      if (document.hidden) disconnect();
      else connect();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Gamepad connect/disconnect indicator
  useEffect(() => {
    const onConnect    = () => setGpConnected(true);
    const onDisconnect = () => setGpConnected(false);
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);
    return () => {
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsPaletteOpen(p => !p); }
      if (e.key === '`') { e.preventDefault(); setIsDaemonOpen(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Controller navigation — full-app
  useGamepad(useCallback((action) => {
    // Close modal on B
    if (selectedGame) {
      if (action === 'cancel') setSelectedGame(null);
      return;
    }

    const tabIdx = TABS.indexOf(activeTab);
    // LB / RB = previous / next tab
    if (action === 'lb') { setActiveTab(TABS[Math.max(0, tabIdx - 1)]); setGpFocusIdx(0); clearNavFocus(); return; }
    if (action === 'rb') { setActiveTab(TABS[Math.min(TABS.length - 1, tabIdx + 1)]); setGpFocusIdx(0); clearNavFocus(); return; }
    // Select / Menu button = command palette
    if (action === 'menu') { setIsPaletteOpen(p => !p); return; }

    // Library — grid navigation
    if (activeTab === 'library') {
      const items = getNavItems(document.querySelector('main') ?? undefined);
      let idx = items.findIndex(el => el.hasAttribute('data-gpfocus'));
      if (idx === -1) idx = gpFocusIdx;
      const cols = window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 3 : window.innerWidth < 1280 ? 4 : 6;
      let next = idx;
      if (action === 'right')   next = Math.min(items.length - 1, idx + 1);
      if (action === 'left')    next = Math.max(0, idx - 1);
      if (action === 'down')    next = Math.min(items.length - 1, idx + cols);
      if (action === 'up')      next = Math.max(0, idx - cols);
      if (action === 'confirm') { clickFocused(); return; }
      setGpFocusIdx(next);
      setNavFocus(items, next);
      return;
    }

    // All other tabs — generic button / interactive element navigation
    // We select all focusable elements that are visible inside <main>
    const mainEl = document.querySelector('main');
    if (!mainEl) return;
    const focusable = Array.from(
      mainEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    if (!focusable.length) return;

    // Find which element is currently focused
    let idx = focusable.findIndex(el => el === document.activeElement);
    if (idx === -1) idx = gpFocusIdx < focusable.length ? gpFocusIdx : 0;

    if (action === 'down' || action === 'right') {
      const next = Math.min(focusable.length - 1, idx + 1);
      focusable[next].focus({ preventScroll: false });
      focusable[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      setGpFocusIdx(next);
    } else if (action === 'up' || action === 'left') {
      const next = Math.max(0, idx - 1);
      focusable[next].focus({ preventScroll: false });
      focusable[next].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      setGpFocusIdx(next);
    } else if (action === 'confirm') {
      const active = document.activeElement as HTMLElement | null;
      if (active && focusable.includes(active)) {
        active.click();
      } else if (focusable[idx]) {
        focusable[idx].focus();
        focusable[idx].click();
      }
    } else if (action === 'cancel') {
      (document.activeElement as HTMLElement | null)?.blur();
    }
  }, [selectedGame, activeTab, gpFocusIdx]));

  // Launch game with auto-detect + error toasts
  const handleLaunch = useCallback(async (game: Game) => {
    setSelectedGame(null);
    try {
      const res = await fetch('/api/games/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: game.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        const err: string = data.error ?? '';
        if (err.toLowerCase().includes('emulator')) {
          addToast('Searching for RetroArch…', 'success');
          const detect = await fetch('/api/emulator/detect').then(r => r.json());
          if (detect.found) {
            const retry = await fetch('/api/games/launch', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ game_id: game.id }),
            });
            if (!retry.ok) {
              const rd = await retry.json();
              addToast('Launch failed: ' + (rd.error ?? 'unknown'), 'error');
              return;
            }
          } else {
            addToast('RetroArch not found — check Settings → Emulator Setup', 'error');
            return;
          }
        } else if (err.toLowerCase().includes('core')) {
          addToast(`Missing core for ${game.platform} — go to Core Forge to download it`, 'error');
          return;
        } else {
          addToast('Launch failed: ' + err, 'error');
          return;
        }
      }

      setBootingGame(game);
      setTimeout(() => {
        fetch(`/api/games/${game.id}/playtime`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes: 1 }),
        }).catch(() => {});
      }, 5000);
    } catch {
      addToast('Could not reach server — is it running?', 'error');
    }
  }, [addToast]);

  const handleScan = async () => {
    const result = await scanVault();
    if (result) addToast(`Scan complete — ${result.added} new title(s) found`, 'success');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-nexus-bg text-white relative">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); clearNavFocus(); }} />

      <main className="flex-1 flex flex-col min-w-0 h-full p-4 md:p-8 relative overflow-y-auto no-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-nexus-muted text-[10px] font-black uppercase tracking-[0.3em]">Nexus v2</h2>
              {gpConnected && (
                <span className="gp-hint text-nexus-accent"><Gamepad2 className="w-2.5 h-2.5 inline" /> Active</span>
              )}
              {/* PWA install button — shown when browser signals installability */}
              {!pwa.isInstalled && pwa.canInstall && (
                <button
                  onClick={async () => {
                    const accepted = await pwa.promptInstall();
                    if (accepted) addToast('NexusEmu installed! Find it in your Start Menu.', 'success');
                  }}
                  className="gp-hint text-nexus-accent border-nexus-accent/40 hover:bg-nexus-accent/10 transition-colors cursor-pointer"
                >
                  ⬇ Install App
                </button>
              )}
              {/* iOS manual install hint */}
              {!pwa.isInstalled && pwa.isIOS && (
                <span className="gp-hint text-yellow-400 border-yellow-400/30">
                  Tap Share → Add to Home Screen
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black italic tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>

          {activeTab === 'library' && (
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted group-focus-within:text-nexus-accent transition-colors" />
                <input
                  type="text" placeholder="Search collection…"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 w-full md:w-72 focus:outline-none focus:ring-1 focus:ring-nexus-accent/50 focus:bg-white/10 transition-all font-medium text-sm"
                />
              </div>
              <button onClick={handleScan} disabled={isScanning}
                className="px-5 py-3 bg-nexus-accent/10 border border-nexus-accent/30 rounded-2xl flex items-center gap-2 hover:bg-nexus-accent/20 transition-all active:scale-95 disabled:opacity-50">
                {isScanning ? <Loader2 className="w-4 h-4 animate-spin text-nexus-accent" /> : <Plus className="w-4 h-4 text-nexus-accent" />}
                <span className="font-bold text-sm text-nexus-accent">SCAN</span>
              </button>
              <button
                onClick={() => setGroupByPlatform(v => !v)}
                title={groupByPlatform ? 'Switch to grid' : 'Group by console'}
                className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                  groupByPlatform
                    ? 'bg-nexus-accent/20 border-nexus-accent/50 text-nexus-accent'
                    : 'bg-white/5 border-white/10 text-nexus-muted hover:text-white'
                }`}
              >
                {groupByPlatform ? <LayoutList className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              </button>
            </div>
          )}
        </header>

        <div className="relative flex-1 flex flex-col gap-8">

          {activeTab === 'library' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Cpu,         label: 'CPU',     value: `${stats.cpu.load}%`,             color: 'text-nexus-accent' },
                  { icon: Activity,    label: 'GPU',     value: stats.gpu.available ? `${stats.gpu.load}%` : 'N/A', color: 'text-blue-400' },
                  { icon: Database,    label: 'LIBRARY', value: gamesLoading ? '…' : `${games.length}`, color: 'text-purple-400' },
                  { icon: AlertCircle, label: 'RAM',     value: `${stats.memory.usedPercent}%`,    color: 'text-green-500' },
                ].map((s, i) => (
                  <div key={i} className="glass-panel p-4 rounded-2xl flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-nexus-muted pb-1">
                      <s.icon className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">{s.label}</span>
                    </div>
                    <span className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>

              {gamesLoading ? (
                <div className="py-20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-nexus-muted" />
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-nexus-muted space-y-4">
                  <Search className="w-12 h-12 opacity-20" />
                  <p className="font-medium">No games found — scan your vault to get started.</p>
                </div>
              ) : groupByPlatform ? (
                <div className="space-y-10 pb-20">
                  {platformGroups.map(([platform, pg]) => (
                    <div key={platform}>
                      <div className="flex items-center gap-3 mb-4">
                        <Gamepad2 className="w-4 h-4 text-nexus-muted flex-none" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white whitespace-nowrap">
                          {platformLabel(platform)}
                        </h2>
                        <span className="text-[10px] text-nexus-muted font-bold whitespace-nowrap">{pg.length} {pg.length === 1 ? 'game' : 'games'}</span>
                        <div className="flex-1 h-px bg-white/5" />
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1"
                        style={{ scrollbarWidth: 'none' }}>
                        {pg.map((game, i) => (
                          <div key={game.id} className="flex-none w-[130px] sm:w-[150px]">
                            <GameCard game={game} index={i} focused={false} onSelect={g => setSelectedGame(g)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 pb-20">
                  {filteredGames.map((game, i) => (
                    <GameCard key={game.id} game={game} index={i}
                      focused={gpConnected && gpFocusIdx === i}
                      onSelect={g => setSelectedGame(g)} />
                  ))}
                </div>
              )}
            </>
          )}

          <Suspense fallback={<TabLoader />}>
            {activeTab === 'sync'       && <SyncEngine />}
            {activeTab === 'storage'    && <StorageTiering />}
            {activeTab === 'vaults'     && <VaultManager />}
            {activeTab === 'playlists'  && <PlaylistHub />}
            {activeTab === 'forge'      && <CoreForge />}
            {activeTab === 'scanner'    && <ScannerInbox />}
            {activeTab === 'activity'   && <ActivityStats />}
            {activeTab === 'handheld'   && <RemotePairing />}
            {activeTab === 'controller' && <ControllerSettings />}
            {activeTab === 'info'       && <ServerHealth />}
          </Suspense>

          {activeTab === 'profile' && (
            <ProfileManager user={profile.user} onLogin={profile.login}
              onRegister={profile.register} onLogout={profile.logout} />
          )}

          {activeTab === 'spatial' && (
            <div className="flex-1 flex items-center justify-center p-20">
              <div className="text-center space-y-6 max-w-md">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl inline-block mb-4">
                  <Layers className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Enter Spatial Hub?</h3>
                <p className="text-nexus-muted text-sm pb-4">Nexus will recalibrate for 3D panoramic projection.</p>
                <button onClick={() => setIsSpatialMode(true)}
                  className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all uppercase tracking-widest italic">
                  Calibrate & Launch
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-nexus-accent">Emulator Setup</h3>
                <EmulatorSettingsPanel addToast={addToast} />
              </section>
              <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-nexus-accent">AI Pipeline</h3>
                <div className="glass-panel p-6 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">Gemini Metadata Scraper</p>
                      <p className="text-xs text-nexus-muted">Auto-identify games from ROM filenames using AI.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="accent-nexus-accent w-4 h-4" />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <ExpandableDetail game={selectedGame} onClose={() => setSelectedGame(null)} onLaunch={handleLaunch} />

      <AnimatePresence>
        {selectedGame && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background: `radial-gradient(circle at 100% 0%, ${selectedGame.dominantColor} 0%, transparent 100%)` }} />
        )}
      </AnimatePresence>

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} onSelectGame={g => handleLaunch(g)} />
      <BootSequence game={bootingGame} onComplete={() => setBootingGame(null)} />

      <AnimatePresence>
        {isFirstLaunch && (
          <SetupWizard onComplete={() => { setIsFirstLaunch(false); localStorage.setItem('nexus_initialized', 'true'); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSpatialMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Suspense fallback={null}><SpatialView /></Suspense>
            <button onClick={() => setIsSpatialMode(false)}
              className="fixed top-12 left-1/2 -translate-x-1/2 p-4 px-8 glass-panel border-white/10 rounded-full text-[10px] font-black tracking-[0.3em] uppercase hover:bg-white/10 transition-all z-[160]">
              Exit Spatial Environment
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DaemonManager isOpen={isDaemonOpen} onClose={() => setIsDaemonOpen(false)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

// ─── Emulator Settings Panel ──────────────────────────────────────────────────
function EmulatorSettingsPanel({ addToast }: { addToast: (msg: string, type: 'success'|'error'|'info') => void }) {
  const [detecting, setDetecting] = useState(false);
  const [customPath, setCustomPath] = useState('');
  const [saved, setSaved]           = useState(false);
  const [detectedPath, setDetectedPath] = useState<string | null>(null);

  const detect = async () => {
    setDetecting(true);
    try {
      const data = await fetch('/api/emulator/detect').then(r => r.json());
      if (data.found) {
        setDetectedPath(data.path);
        setCustomPath(data.path);
        addToast('RetroArch found: ' + data.path, 'success');
      } else {
        addToast('RetroArch not found in common locations — browse to find it', 'error');
      }
    } finally { setDetecting(false); }
  };

  const save = async () => {
    if (!customPath.trim()) return;
    try {
      await fetch('/api/vault/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emulator_path: customPath.trim() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      addToast('Emulator path saved', 'success');
    } catch {
      addToast('Failed to save emulator path', 'error');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <FolderPickerInput
        label="RetroArch Executable"
        hint="(auto-detected or browse to set manually)"
        value={customPath}
        onChange={setCustomPath}
        placeholder="e.g. C:\RetroArch\retroarch.exe"
        mode="file"
        fileFilter="Executables|*.exe|All files|*.*"
        fileTitle="Select retroarch.exe"
      />
      {detectedPath && (
        <p className="text-[10px] text-green-400 font-mono pl-1">Auto-detected: {detectedPath}</p>
      )}
      <div className="flex gap-3">
        <button onClick={detect} disabled={detecting}
          className="flex-1 px-4 py-2.5 bg-nexus-accent/10 border border-nexus-accent/30 rounded-xl text-xs font-bold text-nexus-accent hover:bg-nexus-accent/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {detecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Auto-Detect
        </button>
        <button onClick={save} disabled={!customPath.trim()}
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          {saved ? '✓ Saved' : 'Save Path'}
        </button>
      </div>
    </div>
  );
}
