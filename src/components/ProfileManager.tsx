import React, { useState, useEffect } from 'react';
import {
  User, Lock, LogIn, UserPlus, LogOut,
  Smartphone, Monitor, Globe, Copy, Check,
} from 'lucide-react';
import type { UserProfile } from '../hooks/useProfile';

interface Props {
  user: UserProfile | null;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string, displayName?: string) => Promise<void>;
  onLogout: () => void;
}

export const ProfileManager: React.FC<Props> = ({ user, onLogin, onRegister, onLogout }) => {
  const [mode, setMode]           = useState<'login' | 'register'>('login');
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy]           = useState(false);
  const [err, setErr]             = useState('');
  const [netInfo, setNetInfo]     = useState<{ urls: string[]; qrDataUrl: string | null } | null>(null);
  const [copied, setCopied]       = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) { setErr('Username and password required.'); return; }
    setBusy(true); setErr('');
    try {
      if (mode === 'login') await onLogin(username.trim(), password);
      else await onRegister(username.trim(), password, displayName.trim() || undefined);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetch('/api/network/info').then(r => r.json()).then(setNetInfo).catch(() => {});
    }
  }, [user]);

  const copyUrl = async () => {
    const url = netInfo?.urls[0];
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight">Profile</h2>
          <p className="text-nexus-muted text-xs mt-1">
            Sign in or create an account to sync your library across devices.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-white/5 rounded-2xl p-1 gap-1">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setErr(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                mode === m ? 'bg-nexus-accent text-black' : 'text-nexus-muted hover:text-white'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-nexus-muted block">
                Display Name <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text" value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-nexus-accent/60 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-1.5">
              <User className="w-3 h-3" /> Username
            </label>
            <input
              type="text" value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete="username" autoCapitalize="none" spellCheck={false}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-nexus-accent/60 rounded-xl text-sm font-mono outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-nexus-accent/60 rounded-xl text-sm font-mono outline-none transition-colors"
            />
          </div>
        </div>

        {err && (
          <p className="text-xs text-red-400 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">{err}</p>
        )}

        <button
          onClick={handleSubmit} disabled={busy}
          className="w-full py-4 bg-nexus-accent text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-nexus-accent/90 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
        >
          {busy
            ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            : mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />
          }
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <p className="text-center text-[10px] text-nexus-muted leading-relaxed">
          Library is accessible locally without an account.<br />
          Sign in to enable cross-device sync.
        </p>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-8">
      {/* User card */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center gap-5">
        <div className="w-14 h-14 bg-nexus-accent/20 rounded-full flex items-center justify-center border border-nexus-accent/30 flex-shrink-0">
          <span className="text-xl font-black text-nexus-accent">
            {(user.display_name || user.username)[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-lg truncate">{user.display_name || user.username}</h3>
          <p className="text-xs text-nexus-muted font-mono">@{user.username}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 rounded-xl text-xs font-bold transition-all flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Other devices */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-nexus-accent">Access on Other Devices</h3>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
          <p className="text-sm text-nexus-muted leading-relaxed">
            Open Nexus on any device on the same Wi-Fi. Sign in and your full library syncs instantly.
            On mobile, browse games → Download ROM → launch in a compatible emulator.
          </p>

          {netInfo?.qrDataUrl && (
            <div className="flex gap-6 items-start flex-wrap">
              <div className="flex-shrink-0 text-center">
                <img src={netInfo.qrDataUrl} alt="QR Code" className="w-32 h-32 rounded-xl border border-white/10" />
                <p className="text-[9px] text-nexus-muted mt-1.5 font-mono">Scan with phone</p>
              </div>
              <div className="flex-1 min-w-0 space-y-3 pt-1">
                {netInfo.urls.map(url => (
                  <div key={url} className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono bg-black/30 px-3 py-2 rounded-lg text-nexus-accent truncate">{url}</code>
                    <button onClick={copyUrl} className="p-2 hover:bg-white/10 rounded-lg transition-all flex-shrink-0">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-nexus-muted" />}
                    </button>
                  </div>
                ))}
                <p className="text-[10px] text-nexus-muted">Sign in after opening — your games appear immediately.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <Monitor className="w-4 h-4 text-nexus-accent" />
              <p className="text-xs font-bold">PC / Laptop</p>
              <p className="text-[10px] text-nexus-muted">
                Open URL in Chrome or Edge. Install as PWA for a full app experience with offline support.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-bold">iPhone / iPad</p>
              <p className="text-[10px] text-nexus-muted">
                Browse library → Download ROM → open in <span className="text-white">Delta</span> (free) or <span className="text-white">Provenance</span>.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
              <Smartphone className="w-4 h-4 text-green-400" />
              <p className="text-xs font-bold">Android</p>
              <p className="text-[10px] text-nexus-muted">
                Browse library → Download ROM → open in <span className="text-white">RetroArch</span> or <span className="text-white">Lemuroid</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Outside home */}
      <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
        <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-blue-300">Outside your home network?</p>
          <p className="text-[11px] text-nexus-muted leading-relaxed">
            Install <span className="text-white font-semibold">Tailscale</span> (free) on this PC and your phone.
            Use your Tailscale IP instead of the local URL — works anywhere with no port forwarding needed.
          </p>
        </div>
      </div>
    </div>
  );
};
