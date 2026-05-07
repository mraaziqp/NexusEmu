import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderOpen, FolderPlus, ChevronRight, ArrowLeft, HardDrive, X, Check, Loader2, Home, AlertCircle, Keyboard, Sparkles, RefreshCw } from 'lucide-react';

interface FsEntry {
  name: string;
  path: string;
  type: string;
  isDir: boolean;
}

interface FsListing {
  current: string;
  parent: string | null;
  entries: FsEntry[];
}

interface Suggestion { label: string; path: string; hint?: string; }

interface MobileFolderPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  title?: string;
}

export const MobileFolderPicker: React.FC<MobileFolderPickerProps> = ({
  isOpen, onClose, onSelect, title = 'Select Folder',
}) => {
  const [listing, setListing] = useState<FsListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drives, setDrives] = useState<FsEntry[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showHome, setShowHome] = useState(true);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualPath, setManualPath] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const manualInputRef = useRef<HTMLInputElement>(null);

  const navigate = useCallback(async (p: string | null) => {
    if (!p) { setShowHome(true); setListing(null); setError(''); return; }
    setLoading(true);
    setError('');
    setShowNewFolder(false);
    setNewFolderName('');
    try {
      const res = await fetch(`/api/fs/list?path=${encodeURIComponent(p)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Cannot open folder'); return; }
      setListing(data);
      setShowHome(false);
    } catch {
      setError('Cannot reach server. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    setSuggestLoading(true);
    try {
      const res = await fetch('/api/fs/suggest');
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setDrives(data.drives ?? [{ name: 'C:\\', path: 'C:\\', type: 'drive', isDir: true }]);
    } catch {
      setDrives([{ name: 'C:\\', path: 'C:\\', type: 'drive', isDir: true }]);
    } finally {
      setSuggestLoading(false);
    }
  }, []);

  const handleManualConfirm = async () => {
    const p = manualPath.trim();
    if (!p) return;
    try {
      await fetch('/api/fs/mkdir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: p }) });
    } catch { /* best-effort */ }
    await navigate(p);
    setManualMode(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentPath) return;
    setCreating(true);
    setCreateError('');
    const sep = currentPath.includes('/') ? '/' : '\\';
    const newPath = currentPath.replace(/[\\/]+$/, '') + sep + newFolderName.trim();
    try {
      const res = await fetch('/api/fs/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error ?? 'Could not create folder'); return; }
      setNewFolderName('');
      setShowNewFolder(false);
      await navigate(data.created);
    } catch {
      setCreateError('Network error');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setShowHome(true);
    setListing(null);
    setError('');
    setManualMode(false);
    setManualPath('');
    setShowNewFolder(false);
    setNewFolderName('');
    loadSuggestions();
  }, [isOpen, loadSuggestions]);

  const currentPath = listing?.current ?? '';

  const breadcrumbs = currentPath
    ? currentPath.replace(/\\/g, '/').split('/').filter(Boolean).reduce<{ label: string; path: string }[]>((acc, seg, i, arr) => {
        const isWin = /^[A-Z]:$/.test(arr[0]);
        const joined = isWin ? arr.slice(0, i + 1).join('\\') + (i === 0 ? '\\' : '') : '/' + arr.slice(0, i + 1).join('/');
        acc.push({ label: seg, path: joined });
        return acc;
      }, [])
    : [];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col" style={{ touchAction: 'none' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          className="relative mt-auto bg-[#0d0d1a] border-t border-white/10 rounded-t-3xl flex flex-col max-h-[92vh]"
          style={{ touchAction: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8 flex-shrink-0">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-nexus-accent" />
              <div>
                <span className="font-black text-sm uppercase tracking-widest">{title}</span>
                <p className="text-[9px] text-nexus-muted font-mono mt-0.5">PC filesystem</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setManualMode(m => !m); setTimeout(() => manualInputRef.current?.focus(), 50); }}
                className={`p-2 rounded-xl transition-colors ${manualMode ? 'bg-nexus-accent/20 text-nexus-accent' : 'hover:bg-white/10 text-nexus-muted'}`}
                title="Type path manually"
              >
                <Keyboard className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-nexus-muted" />
              </button>
            </div>
          </div>

          {/* Manual path input */}
          <AnimatePresence>
            {manualMode && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden flex-shrink-0 border-b border-white/5">
                <div className="px-4 py-3 flex gap-2">
                  <input
                    ref={manualInputRef}
                    value={manualPath}
                    onChange={(e) => setManualPath(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleManualConfirm(); }}
                    placeholder="e.g. D:\Games\ROMs"
                    className="flex-1 px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm font-mono focus:outline-none focus:border-nexus-accent text-white placeholder-white/30"
                  />
                  <button onClick={handleManualConfirm} disabled={!manualPath.trim() || loading}
                    className="px-4 py-2.5 bg-nexus-accent text-black rounded-xl text-xs font-black disabled:opacity-40 flex items-center gap-1.5 shrink-0">
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    GO
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Breadcrumb — only when browsing */}
          {!showHome && (
            <div className="px-4 py-2 flex items-center gap-1 flex-wrap flex-shrink-0 border-b border-white/5 min-h-[40px]">
              <button onClick={() => { setShowHome(true); setListing(null); setError(''); }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
                <Home className="w-3.5 h-3.5 text-nexus-muted" />
              </button>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.path}>
                  <ChevronRight className="w-3 h-3 text-white/20 flex-shrink-0" />
                  <button onClick={() => navigate(crumb.path)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-colors flex-shrink-0 ${
                      i === breadcrumbs.length - 1 ? 'text-nexus-accent font-bold' : 'text-nexus-muted hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {crumb.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-2">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-nexus-accent" />
              </div>
            )}

            {error && (
              <div className="mx-2 my-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
                <button
                  onClick={() => { setError(''); if (currentPath) navigate(currentPath); else { setShowHome(true); loadSuggestions(); } }}
                  className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}

            {/* Home: suggested paths + drives */}
            {!loading && showHome && (
              <div className="space-y-4 py-2">
                {suggestLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-nexus-muted" />
                  </div>
                ) : (
                  <>
                    {suggestions.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-2 pb-2">
                          <Sparkles className="w-3 h-3 text-nexus-accent" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-nexus-muted">Quick Select</span>
                        </div>
                        <div className="space-y-1.5">
                          {suggestions.map((s) => (
                            <button key={s.path}
                              onClick={() => { onSelect(s.path); onClose(); }}
                              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-nexus-accent/5 border border-nexus-accent/15 hover:bg-nexus-accent/10 active:bg-nexus-accent/20 transition-colors text-left"
                            >
                              <div className="p-1.5 bg-nexus-accent/10 rounded-xl border border-nexus-accent/20 shrink-0">
                                <FolderOpen className="w-4 h-4 text-nexus-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-mono font-bold text-sm truncate">{s.label}</p>
                                {s.hint && <p className="text-[10px] text-nexus-muted">{s.hint}</p>}
                              </div>
                              <Check className="w-4 h-4 text-nexus-accent shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 px-2 pb-2">
                        <HardDrive className="w-3 h-3 text-nexus-muted" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-nexus-muted">Browse Drives</span>
                      </div>
                      <div className="space-y-1">
                        {drives.map((drive) => (
                          <button key={drive.path} onClick={() => navigate(drive.path)}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-white/8 active:bg-white/12 transition-colors text-left"
                          >
                            <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                              <HardDrive className="w-5 h-5 text-nexus-muted" />
                            </div>
                            <span className="font-mono font-bold text-sm">{drive.name}</span>
                            <ChevronRight className="w-4 h-4 text-nexus-muted ml-auto" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Directory listing */}
            {!loading && !showHome && listing && (
              <div className="space-y-0.5 py-2">
                {listing.parent !== null && (
                  <button onClick={() => navigate(listing.parent)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/8 active:bg-white/12 transition-colors text-left"
                  >
                    <div className="p-1.5 bg-white/5 rounded-xl border border-white/10">
                      <ArrowLeft className="w-4 h-4 text-nexus-muted" />
                    </div>
                    <span className="text-sm text-nexus-muted font-mono">..</span>
                  </button>
                )}
                {listing.entries.length === 0 && (
                  <p className="text-center py-8 text-xs text-nexus-muted">Empty folder</p>
                )}
                {listing.entries.map((entry) => (
                  <button key={entry.path}
                    onClick={() => entry.isDir ? navigate(entry.path) : undefined}
                    disabled={!entry.isDir}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors text-left ${
                      entry.isDir ? 'hover:bg-white/8 active:bg-white/12 cursor-pointer' : 'opacity-40 cursor-default'
                    }`}
                  >
                    <div className={`p-1.5 rounded-xl border ${entry.isDir ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/10'}`}>
                      <FolderOpen className={`w-4 h-4 ${entry.isDir ? 'text-yellow-400' : 'text-nexus-muted'}`} />
                    </div>
                    <span className="text-sm font-mono flex-1 truncate">{entry.name}</span>
                    {entry.isDir && <ChevronRight className="w-4 h-4 text-nexus-muted flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/8 flex-shrink-0 space-y-3">
            {currentPath && !showHome && (
              <div className="px-3 py-2 bg-white/5 rounded-xl">
                <p className="text-[9px] uppercase font-black tracking-widest text-nexus-muted mb-1">Selected Path</p>
                <p className="font-mono text-xs text-nexus-accent truncate">{currentPath}</p>
              </div>
            )}

            {!showHome && currentPath && (
              showNewFolder ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input autoFocus value={newFolderName}
                      onChange={(e) => { setNewFolderName(e.target.value); setCreateError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName(''); } }}
                      placeholder="New folder name…"
                      className="flex-1 px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm font-mono focus:outline-none focus:border-nexus-accent text-white placeholder-white/30"
                    />
                    <button onClick={handleCreateFolder} disabled={!newFolderName.trim() || creating}
                      className="px-4 py-2.5 bg-nexus-accent text-black rounded-xl text-xs font-black disabled:opacity-40 flex items-center gap-1.5">
                      {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      CREATE
                    </button>
                    <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); setCreateError(''); }}
                      className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-nexus-muted">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {createError && <p className="text-[10px] text-red-400 font-bold px-1">{createError}</p>}
                </div>
              ) : (
                <button onClick={() => { setShowNewFolder(true); setCreateError(''); }}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/15 text-[11px] font-black uppercase tracking-widest text-nexus-muted hover:border-nexus-accent hover:text-nexus-accent transition-colors flex items-center justify-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5" /> New Folder
                </button>
              )
            )}

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-nexus-muted hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { if (currentPath) { onSelect(currentPath); onClose(); } }}
                disabled={!currentPath || showHome}
                className="flex-1 py-3.5 rounded-2xl bg-nexus-accent text-black text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-nexus-accent/90 transition-colors"
              >
                <Check className="w-4 h-4" />
                Select
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
