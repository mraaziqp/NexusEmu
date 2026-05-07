import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone, Gamepad2, QrCode, Copy, Wifi, Server, Zap,
  ArrowRight, ShieldAlert, Loader2, Download, CheckCircle,
  Globe, Lock, Monitor, Play, RefreshCw
} from 'lucide-react';
import { NetworkInfo } from '../types';
import { useGames } from '../hooks/useGames';
import { MobileEmulatorSetup } from './MobileEmulatorSetup';

const LS_TOKEN_KEY = 'nexus_remote_token';

export const RemotePairing: React.FC = () => {
  const { games } = useGames();
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loadingNetwork, setLoadingNetwork] = useState(true);
  const [pin, setPin] = useState('');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(LS_TOKEN_KEY));
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [watcherStatus, setWatcherStatus] = useState<{ active: boolean; watchingPath: string } | null>(null);

  useEffect(() => {
    fetch('/api/network/info')
      .then(r => r.json())
      .then((data: NetworkInfo) => setNetworkInfo(data))
      .catch(() => {})
      .finally(() => setLoadingNetwork(false));

    fetch('/api/watcher/status')
      .then(r => r.json())
      .then(setWatcherStatus)
      .catch(() => {});
  }, []);

  // Verify existing token on load
  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ valid }) => { if (!valid) { setToken(null); localStorage.removeItem(LS_TOKEN_KEY); } })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error ?? 'Invalid PIN'); return; }
      setToken(data.token);
      localStorage.setItem(LS_TOKEN_KEY, data.token);
      setPin('');
    } catch {
      setAuthError('Connection error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 2000);
  };

  const handleDownload = async (gameId: string) => {
    setDownloadingId(gameId);
    const link = document.createElement('a');
    link.href = `/api/games/${gameId}/download`;
    link.click();
    setTimeout(() => setDownloadingId(null), 2000);
  };

  const primaryUrl = networkInfo?.urls[0] ?? `http://localhost:${networkInfo?.port ?? 3000}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Smartphone className="w-3 h-3" /> Remote_Access_v2.0
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Online Access</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border text-[10px] font-black font-mono uppercase tracking-widest ${
            watcherStatus?.active
              ? 'bg-green-500/10 border-green-500/20 text-green-500'
              : 'bg-white/5 border-white/10 text-nexus-muted'
          }`}>
            <div className={`w-2 h-2 rounded-full ${watcherStatus?.active ? 'bg-green-500 animate-pulse' : 'bg-nexus-muted'}`} />
            {watcherStatus?.active ? 'Ghost Scanner Active' : 'Scanner Idle'}
          </div>
          {token && (
            <div className="px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-nexus-accent" />
              <span className="text-[10px] font-black text-nexus-accent uppercase tracking-widest">Authenticated</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: QR + Network URL */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.06)_0%,transparent_70%)]" />

            <div className="relative z-10 space-y-2">
              <h4 className="font-bold tracking-tight">Connect Any Device</h4>
              <p className="text-xs text-nexus-muted max-w-xs">Open this URL on your phone, tablet, or another PC to browse your library remotely.</p>
            </div>

            {/* QR Code */}
            <div className="relative z-10 flex justify-center">
              {loadingNetwork ? (
                <div className="w-[200px] h-[200px] bg-white/5 rounded-3xl flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-nexus-accent animate-spin" />
                </div>
              ) : networkInfo?.qrDataUrl ? (
                <motion.div whileHover={{ scale: 1.05 }} className="p-4 bg-white rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] cursor-pointer">
                  <img src={networkInfo.qrDataUrl} alt="Nexus QR Code" className="w-[180px] h-[180px]" />
                </motion.div>
              ) : (
                <div className="w-[200px] h-[200px] bg-white/5 border border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center gap-3 text-nexus-muted">
                  <QrCode className="w-10 h-10 opacity-30" />
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-50 text-center px-4">Configure network to generate QR</p>
                </div>
              )}
            </div>

            {/* URL List */}
            <div className="relative z-10 space-y-3">
              {loadingNetwork ? (
                <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
              ) : (networkInfo?.urls ?? []).map((url) => {
                const ip = url.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
                const label = networkInfo?.labels?.[ip];
                const isTailscale = label === 'tailscale';
                const isVpn = label === 'vpn';
                return (
                  <button
                    key={url}
                    onClick={() => handleCopyUrl(url)}
                    className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl transition-all group ${
                      isTailscale
                        ? 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Globe className={`w-4 h-4 flex-shrink-0 ${isTailscale ? 'text-purple-400' : 'text-nexus-accent'}`} />
                      <span className={`font-mono text-sm truncate ${isTailscale ? 'text-purple-300' : 'text-nexus-accent'}`}>{url}</span>
                      {isTailscale && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-purple-300">
                          Tailscale
                        </span>
                      )}
                      {isVpn && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-300">
                          VPN
                        </span>
                      )}
                    </div>
                    {copiedUrl === url ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-nexus-muted group-hover:text-white transition-colors flex-shrink-0" />
                    )}
                  </button>
                );
              })}
              {!loadingNetwork && (networkInfo?.urls ?? []).length === 0 && (
                <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-yellow-500" />
                  <p className="text-[10px] text-yellow-400 font-bold">No network interfaces detected. Check your connection.</p>
                </div>
              )}
            </div>
          </div>

          {/* Ghost Scanner Status */}
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
              <Zap className="w-3 h-3 text-nexus-accent" /> Ghost Scanner
            </h4>
            <div className={`p-4 rounded-2xl border flex items-start gap-4 ${
              watcherStatus?.active ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'
            }`}>
              <div className={`p-2 rounded-xl ${watcherStatus?.active ? 'bg-green-500/20' : 'bg-white/10'}`}>
                <RefreshCw className={`w-5 h-5 ${watcherStatus?.active ? 'text-green-400 animate-spin-slow' : 'text-nexus-muted'}`} />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-sm font-bold">{watcherStatus?.active ? 'Watching for new ROMs' : 'Scanner not active'}</p>
                <p className="text-[9px] font-mono text-nexus-muted truncate">
                  {watcherStatus?.watchingPath || 'Set Vault Root in Vault Manager to activate'}
                </p>
                <p className="text-[9px] text-nexus-muted">Drop a ROM into your vault folder — it will auto-detect, enrich metadata via Gemini, and appear in your library instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Auth + Game Library */}
        <div className="space-y-6">
          {/* PIN Auth */}
          {!token ? (
            <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-nexus-accent/10 rounded-2xl border border-nexus-accent/20">
                  <Lock className="w-6 h-6 text-nexus-accent" />
                </div>
                <div>
                  <h4 className="font-bold tracking-tight">Remote Authentication</h4>
                  <p className="text-xs text-nexus-muted">Set ACCESS_PIN in .env, then authenticate here to access your library remotely.</p>
                </div>
              </div>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter your ACCESS_PIN..."
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-mono text-center text-xl tracking-[0.5em] focus:outline-none focus:border-nexus-accent/50"
                />
                {authError && (
                  <p className="text-[10px] text-red-400 font-bold text-center">{authError}</p>
                )}
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn || !pin}
                  className="w-full py-4 bg-nexus-accent text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-nexus-accent/80 transition-all disabled:opacity-50 uppercase tracking-widest"
                >
                  {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  AUTHENTICATE
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-3xl border-green-500/20 bg-green-500/5 flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-green-400">Remote Session Active</p>
                <p className="text-[10px] text-nexus-muted">Token valid 7 days. Open {primaryUrl} on any device.</p>
              </div>
              <button
                onClick={() => { setToken(null); localStorage.removeItem(LS_TOKEN_KEY); }}
                className="px-3 py-2 bg-white/5 rounded-xl text-[10px] font-black text-nexus-muted hover:text-white transition-colors uppercase"
              >
                LOG OUT
              </button>
            </div>
          )}

          {/* Game Download Library */}
          <div className="glass-panel p-6 rounded-[40px] border-white/5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
                <Download className="w-3 h-3" /> Transfer to Device
              </h4>
              <span className="text-[10px] font-mono text-nexus-muted">{games.length} TITLES</span>
            </div>
            <p className="text-[9px] text-nexus-muted px-1">Download ROMs directly to your device to run through its local emulator app.</p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {games.slice(0, 20).map((game) => (
                <div
                  key={game.id}
                  className="flex items-center gap-4 px-4 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                >
                  {game.boxArt ? (
                    <img src={game.boxArt} className="w-8 h-10 object-cover rounded shadow-lg flex-shrink-0" alt="" />
                  ) : (
                    <div className="w-8 h-10 bg-white/10 rounded flex items-center justify-center text-[7px] font-mono text-nexus-muted uppercase flex-shrink-0">{game.platform.slice(0,3)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{game.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] font-mono text-nexus-accent uppercase">{game.platform}</span>
                      {game.coreId && (
                        <span className="text-[7px] font-mono text-nexus-muted">· {game.coreId}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(game.id)}
                    disabled={downloadingId === game.id}
                    className="p-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl text-nexus-accent hover:bg-nexus-accent/20 transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    {downloadingId === game.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Download className="w-4 h-4" />
                    }
                  </button>
                </div>
              ))}
              {games.length === 0 && (
                <div className="py-12 text-center text-nexus-muted opacity-40">
                  <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-xs font-black uppercase tracking-widest">Scan your vault to populate library</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile emulator setup — shown when visiting from phone/tablet */}
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
              <Smartphone className="w-3 h-3 text-nexus-accent" /> Emulator Setup
            </h4>
            <MobileEmulatorSetup serverUrl={primaryUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};
