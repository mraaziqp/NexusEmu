import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  FolderRoot, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  FileJson, 
  Box, 
  Database,
  Link,
  ChevronRight,
  Terminal,
  Unlink,
  HardDrive,
  AlertCircle,
  Save,
  Image,
  PackageOpen,
  Loader2,
} from 'lucide-react';
import { VaultConfig } from '../types';
import { FolderPickerInput } from './FolderPickerInput';

export const VaultManager: React.FC = () => {
  const [config, setConfig] = useState<VaultConfig>({ root_path: '', bios_path: '', emulator_path: '', vault_id: 'NV-9412-PRB' });
  const [isRelinking, setIsRelinking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [vaultStatus, setVaultStatus] = useState('LOADING');
  const [healLog, setHealLog] = useState<string[]>([]);
  const [scanResult, setScanResult] = useState<{ scanned: number; added: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editRoot, setEditRoot] = useState('');
  const [editBios, setEditBios] = useState('');
  const [editEmulator, setEditEmulator] = useState('');
  const [lbPath, setLbPath] = useState('');
  const [lbStatus, setLbStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [lbMsg, setLbMsg] = useState('');
  const [lbImgPath, setLbImgPath] = useState('');
  const [lbImgStatus, setLbImgStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [lbImgMsg, setLbImgMsg] = useState('');
  const [artFetching, setArtFetching] = useState(false);
  const [artMsg, setArtMsg] = useState('');

  useEffect(() => {
    fetch('/api/vault/config')
      .then(r => r.json())
      .then((data: VaultConfig) => {
        setConfig(data);
        setEditRoot(data.root_path);
        setEditBios(data.bios_path);
        setEditEmulator(data.emulator_path);
        setVaultStatus(data.root_path ? 'VERIFIED' : 'UNCONFIGURED');
      })
      .catch(() => setVaultStatus('ERROR'));
  }, []);

  const handleSavePaths = async () => {
    // Create directories that don't exist yet
    const dirsToCreate = [editRoot, editBios].filter(Boolean);
    await Promise.all(
      dirsToCreate.map((p) =>
        fetch('/api/fs/mkdir', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: p }),
        }).catch(() => {/* best-effort */})
      )
    );

    const res = await fetch('/api/vault/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ root_path: editRoot, bios_path: editBios, emulator_path: editEmulator }),
    });
    if (res.ok) {
      setConfig(prev => ({ ...prev, root_path: editRoot, bios_path: editBios, emulator_path: editEmulator }));
      setVaultStatus(editRoot ? 'VERIFIED' : 'UNCONFIGURED');
    }
  };

  const handleRelink = async () => {
    if (!editRoot) return;
    setIsRelinking(true);
    setHealLog([]);
    setVaultStatus('HEALING');
    setError(null);

    setHealLog(prev => [...prev, `> [HEALING] Updating vault root...`]);
    const res = await fetch('/api/vault/heal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ new_root_path: editRoot }),
    });
    const data = await res.json();
    if (res.ok) {
      setConfig(prev => ({ ...prev, root_path: data.new_root_path }));
      setHealLog(prev => [...prev,
        `> [RESOLVING] Recalculating relative paths...`,
        `> [VERIFY] All relative links healed to: ${data.new_root_path}`,
        `> [DONE] Vault integrity re-established.`
      ]);
      setVaultStatus('VERIFIED');
    } else {
      setError(data.error);
      setVaultStatus('ERROR');
    }
    setIsRelinking(false);
  };

  const handleScan = async () => {
    if (!config.root_path) { setError('Set vault root path first.'); return; }
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    const res = await fetch('/api/vault/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ root_path: config.root_path }),
    });
    const data = await res.json();
    if (res.ok) {
      setScanResult({ scanned: data.scanned, added: data.added });
    } else {
      setError(data.error);
    }
    setIsScanning(false);
  };

  const handleImportLaunchbox = async () => {
    if (!lbPath) return;
    setLbStatus('running');
    setLbMsg('Import started — this may take a few minutes for large libraries…');
    try {
      const res = await fetch('/api/vault/import-launchbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchbox_path: lbPath }),
      });
      const data = await res.json();
      if (!res.ok) { setLbStatus('error'); setLbMsg(data.error ?? 'Import failed'); return; }
      setLbStatus('done');
      setLbMsg('LaunchBox import running in background — check library in a few minutes.');
    } catch {
      setLbStatus('error');
      setLbMsg('Could not reach server');
    }
  };

  const handleScanLbImages = async () => {
    if (!lbImgPath) return;
    setLbImgStatus('running');
    setLbImgMsg('Scanning LaunchBox Images folder — matching art to library…');
    try {
      const res = await fetch('/api/art/scan-launchbox-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images_path: lbImgPath }),
      });
      const data = await res.json();
      if (!res.ok) { setLbImgStatus('error'); setLbImgMsg(data.error ?? 'Scan failed'); return; }
      setLbImgStatus('done');
      setLbImgMsg('Art scan running in background — artwork will appear in minutes.');
    } catch {
      setLbImgStatus('error');
      setLbImgMsg('Could not reach server');
    }
  };

  const handleFetchArt = async () => {
    setArtFetching(true);
    setArtMsg('');
    try {
      const res = await fetch('/api/art/fetch-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 200 }),
      });
      const data = await res.json();
      if (res.ok) setArtMsg(`Fetching art for ${data.count} games in background…`);
      else setArtMsg('Art fetch failed');
    } catch {
      setArtMsg('Could not reach server');
    } finally {
      setArtFetching(false);
    }
  };

  const checklist = [
    { label: 'nexus-vault.json', desc: 'Relative path manifest', status: config.root_path ? 'OK' : 'MISSING' },
    { label: 'BIOS Directory', desc: 'Firmware files path', status: config.bios_path ? 'OK' : 'MISSING' },
    { label: 'Emulator Path', desc: 'RetroArch / standalone', status: config.emulator_path ? 'OK' : 'MISSING' },
    { label: 'Vault Root', desc: 'ROM library root path', status: config.root_path ? 'OK' : 'MISSING' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
             <Shield className="w-3 h-3" /> Architecture_Layer_v9
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight uppercase">Vault Management</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleScan}
            disabled={isScanning || !config.root_path}
            className="px-6 py-3 bg-white/5 border border-white/10 font-black flex items-center gap-3 rounded-xl hover:bg-white/10 transition-all italic text-sm disabled:opacity-40"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin text-nexus-accent" /> : <FolderRoot className="w-4 h-4 text-nexus-accent" />}
            {isScanning ? 'SCANNING...' : 'SCAN VAULT'}
          </button>
          <button className="px-6 py-3 bg-white text-black font-black flex items-center gap-3 rounded-xl hover:bg-nexus-accent hover:text-white transition-all group italic">
             <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
             CREATE PORTABLE VAULT
          </button>
        </div>
      </div>

      {scanResult && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          <span className="text-sm font-bold text-green-400">
            Scan complete — {scanResult.scanned} ROM(s) found, {scanResult.added} new title(s) added to library.
          </span>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-sm font-bold text-red-400">{error}</span>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Status & Relinking */}
        <div className="lg:col-span-2 space-y-8">
           <div className="glass-panel p-8 rounded-[40px] border-white/10 bg-white/[0.02] relative overflow-hidden ring-1 ring-white/5">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <HardDrive className="w-48 h-48" />
              </div>

              <div className="flex flex-col gap-8 relative z-10">
                 <div className="space-y-5">
                    <FolderPickerInput
                       label="ROM Vault Root Path"
                       value={editRoot}
                       onChange={setEditRoot}
                       placeholder="e.g. C:\Games\ROMs"
                       required
                       folderDescription="Select your ROMs root folder"
                    />
                    <FolderPickerInput
                       label="BIOS Directory"
                       hint="(optional)"
                       value={editBios}
                       onChange={setEditBios}
                       placeholder="e.g. C:\Games\BIOS"
                       folderDescription="Select your BIOS folder"
                    />
                    <FolderPickerInput
                       label="Emulator Executable"
                       hint="(optional)"
                       value={editEmulator}
                       onChange={setEditEmulator}
                       placeholder="e.g. C:\RetroArch\retroarch.exe"
                       mode="file"
                       fileFilter="Executables|*.exe|All files|*.*"
                       fileTitle="Select retroarch.exe"
                    />

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSavePaths}
                        className="flex-1 py-3 bg-nexus-accent/10 border border-nexus-accent/30 rounded-xl text-[10px] font-black tracking-widest hover:bg-nexus-accent hover:border-nexus-accent transition-all flex items-center justify-center gap-2"
                      >
                        <Save className="w-3 h-3" /> SAVE PATHS
                      </button>
                      <button
                        onClick={handleRelink}
                        disabled={isRelinking || !editRoot}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black tracking-widest hover:bg-nexus-accent hover:border-nexus-accent transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {isRelinking ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />}
                        {isRelinking ? 'HEALING...' : 'RELINK DRIVE'}
                      </button>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <div className={`w-3 h-3 rounded-full ${
                      vaultStatus === 'VERIFIED' ? 'bg-green-500' :
                      vaultStatus === 'HEALING' ? 'bg-yellow-500 animate-pulse' :
                      vaultStatus === 'UNCONFIGURED' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-black italic tracking-tighter uppercase">{vaultStatus}</span>
                    <span className="text-[10px] text-nexus-muted font-mono ml-auto">
                      {config.vault_id} · RELATIVE_MAPPING: ON
                    </span>
                 </div>
              </div>

              <AnimatePresence>
                {healLog.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 p-4 bg-black/60 rounded-2xl border border-nexus-accent/20 font-mono text-[10px] text-nexus-accent overflow-hidden"
                  >
                    <div className="space-y-1">
                      {healLog.map((line, i) => <p key={i}>{line}</p>)}
                      {isRelinking && <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity }} className="w-2 h-3 bg-nexus-accent inline-block align-middle" />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <section className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted flex items-center gap-2">
                    <Terminal className="w-3 h-3" /> Portability Checklist
                 </h4>
                 <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <Box className="w-3 h-3 text-green-500" />
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Portable_Mode_Active</span>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 {checklist.map((item, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-nexus-accent/10 border border-nexus-accent/20 flex items-center justify-center group-hover:bg-nexus-accent group-hover:text-white transition-all">
                             <FileJson className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold">{item.label}</p>
                             <p className="text-[10px] text-nexus-muted">{item.desc}</p>
                          </div>
                       </div>
                       {item.status === 'OK' ? (
                         <CheckCircle2 className="w-5 h-5 text-green-500" />
                       ) : (
                         <AlertCircle className="w-5 h-5 text-yellow-500" />
                       )}
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="p-8 bg-nexus-accent rounded-[40px] text-white space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              <Database className="w-10 h-10 opacity-20" />
              <div className="space-y-2">
                 <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">Portable First</h4>
                 <p className="text-sm text-white/80 leading-relaxed font-medium">
                    All paths stored as relative to your vault root. Move the drive, update root path — all links heal instantly.
                 </p>
              </div>
              <div className="pt-4 border-t border-white/20 flex flex-col gap-3">
                 <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span>Path Strategy</span>
                    <span>RELATIVE</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span>Manifest</span>
                    <span>nexus-vault.json</span>
                 </div>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6 bg-white/5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Unlink className="w-6 h-6 text-nexus-muted" />
                 </div>
                 <h4 className="font-bold tracking-tight">Decouple System</h4>
              </div>
              <p className="text-[10px] text-nexus-muted leading-relaxed">
                 Detach this client from the central Postgres service and use the local <code>nexus-vault.json</code> manifest as the primary source of truth.
              </p>
              <button className="w-full py-4 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all uppercase">
                 ENTER AIR-GAP MODE
              </button>
           </div>

           {/* Boxart / Artwork Fetcher */}
           <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                    <Image className="w-6 h-6 text-purple-400" />
                 </div>
                 <div>
                    <h4 className="font-bold tracking-tight">Boxart Manager</h4>
                    <p className="text-[10px] text-nexus-muted">Download missing cover art</p>
                 </div>
              </div>
              <p className="text-[10px] text-nexus-muted leading-relaxed">
                 Auto-downloads boxart from the libretro thumbnails database for all games missing cover images. Runs in background.
              </p>
              {artMsg && (
                <p className="text-[10px] text-green-400 font-bold">{artMsg}</p>
              )}
              <button
                onClick={handleFetchArt}
                disabled={artFetching}
                className="w-full py-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-black tracking-widest rounded-2xl hover:bg-purple-500 hover:text-white transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {artFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Image className="w-3 h-3" />}
                FETCH MISSING BOXART
              </button>
           </div>

           {/* LaunchBox Images Scan */}
           <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                    <Image className="w-6 h-6 text-yellow-400" />
                 </div>
                 <div>
                    <h4 className="font-bold tracking-tight">Scan LaunchBox Art</h4>
                    <p className="text-[10px] text-nexus-muted">Point to Images folder — auto-import all boxart</p>
                 </div>
              </div>
              <p className="text-[10px] text-nexus-muted leading-relaxed">
                 Point to your <span className="font-mono text-white/60">LaunchBox\Images</span> folder. Nexus will match every <em>Box - Front</em> image to games already in your library and apply them instantly.
              </p>
              <FolderPickerInput
                value={lbImgPath}
                onChange={setLbImgPath}
                placeholder="e.g. I:\LaunchBox\Images"
                folderDescription="Select LaunchBox Images folder"
                label="LaunchBox Images Folder"
              />
              {lbImgMsg && (
                <p className={`text-[10px] font-bold ${lbImgStatus === 'error' ? 'text-red-400' : lbImgStatus === 'done' ? 'text-green-400' : 'text-nexus-accent'}`}>
                  {lbImgMsg}
                </p>
              )}
              <button
                onClick={handleScanLbImages}
                disabled={!lbImgPath || lbImgStatus === 'running'}
                className="w-full py-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[10px] font-black tracking-widest rounded-2xl hover:bg-yellow-500 hover:text-black transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {lbImgStatus === 'running'
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> SCANNING…</>
                  : <><Image className="w-3 h-3" /> SCAN & IMPORT ART</>
                }
              </button>
           </div>

           {/* LaunchBox Import */}
           <div className="glass-panel p-8 rounded-[40px] border-white/5 space-y-5">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                    <PackageOpen className="w-6 h-6 text-orange-400" />
                 </div>
                 <div>
                    <h4 className="font-bold tracking-tight">LaunchBox Import</h4>
                    <p className="text-[10px] text-nexus-muted">Import games, metadata & art from XML</p>
                 </div>
              </div>
              <FolderPickerInput
                value={lbPath}
                onChange={setLbPath}
                placeholder="e.g. I:\LaunchBox"
                folderDescription="Select LaunchBox installation folder"
                label="LaunchBox Root Folder"
              />
              {lbMsg && (
                <p className={`text-[10px] font-bold ${lbStatus === 'error' ? 'text-red-400' : lbStatus === 'done' ? 'text-green-400' : 'text-nexus-accent'}`}>
                  {lbMsg}
                </p>
              )}
              <button
                onClick={handleImportLaunchbox}
                disabled={!lbPath || lbStatus === 'running'}
                className="w-full py-3 bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[10px] font-black tracking-widest rounded-2xl hover:bg-orange-500 hover:text-white transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {lbStatus === 'running'
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> IMPORTING…</>
                  : <><PackageOpen className="w-3 h-3" /> IMPORT GAMES + METADATA</>
                }
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
