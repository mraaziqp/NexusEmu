import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  Search,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { FolderPickerInput } from './FolderPickerInput';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  // Step 2 — path inputs
  const [romsPath, setRomsPath] = useState('');
  const [biosPath, setBiosPath] = useState('');
  const [emulatorPath, setEmulatorPath] = useState('');
  const [savingPaths, setSavingPaths] = useState(false);
  const [pathError, setPathError] = useState('');

  // Step 3 — real scan
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [scanError, setScanError] = useState('');
  const [foundCount, setFoundCount] = useState(0);

  const variants = {
    enter: { x: 500, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -500, opacity: 0 },
  };

  const handleSavePaths = async () => {
    if (!romsPath.trim()) { setPathError('ROMs directory is required.'); return; }
    setPathError('');
    setSavingPaths(true);
    try {
      const res = await fetch('/api/vault/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          root_path: romsPath.trim(),
          bios_path: biosPath.trim() || undefined,
          emulator_path: emulatorPath.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setStep(3);
    } catch {
      setPathError('Could not save config — is the server running?');
    } finally {
      setSavingPaths(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setScanError('');
    try {
      const res = await fetch('/api/vault/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ root_path: romsPath.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setScanError(data.error ?? 'Scan failed'); return; }
      setFoundCount(data.added ?? 0);
      setScanDone(true);
      setTimeout(() => setStep(4), 1200);
    } catch {
      setScanError('Scan request failed — check server logs.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-nexus-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#050505_100%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nexus-accent blur-[120px] rounded-full animate-pulse" />
      </div>

      <motion.div
        layout
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative z-10"
      >
        {/* Progress Header */}
        <div className="flex gap-2 p-6 pb-0">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= i ? 'bg-nexus-accent' : 'bg-white/5'
              }`}
            />
          ))}
        </div>

        <div className="p-12 min-h-[450px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* Step 1 — Welcome */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="space-y-8 text-center"
              >
                <div className="w-20 h-20 bg-nexus-accent/20 rounded-3xl mx-auto flex items-center justify-center border border-nexus-accent/30 relative">
                  <div className="absolute inset-0 bg-nexus-accent blur-xl opacity-20 animate-pulse" />
                  <Gamepad2 className="w-10 h-10 text-nexus-accent" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase">Welcome to Nexus</h1>
                  <p className="text-nexus-muted text-sm max-w-sm mx-auto">
                    Your next-gen retro gaming hub. Let's point it at your ROM library and you'll be playing in minutes.
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-nexus-accent hover:text-white transition-all group"
                >
                  GET STARTED <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-nexus-muted font-mono uppercase tracking-widest">No account required</p>
              </motion.div>
            )}

            {/* Step 2 — Path Setup */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">Set Your Paths</h2>
                  <p className="text-nexus-muted text-xs">Click Browse to pick folders — or type paths manually. ROMs folder is required.</p>
                </div>

                <div className="space-y-4">
                  <FolderPickerInput
                    label="ROMs Directory"
                    value={romsPath}
                    onChange={v => { setRomsPath(v); setPathError(''); }}
                    placeholder="e.g. D:\ROMs  or  C:\Games\ROMs"
                    required
                    folderDescription="Select your ROMs folder"
                  />
                  <FolderPickerInput
                    label="BIOS / Firmware Folder"
                    hint="(optional — needed for PS1, PS2, GBA)"
                    value={biosPath}
                    onChange={setBiosPath}
                    placeholder="e.g. D:\BIOS"
                    folderDescription="Select your BIOS folder"
                  />
                  <FolderPickerInput
                    label="RetroArch Executable"
                    hint="(optional — auto-detected if installed)"
                    value={emulatorPath}
                    onChange={setEmulatorPath}
                    placeholder="e.g. C:\RetroArch\retroarch.exe"
                    mode="file"
                    fileFilter="Executables|*.exe|All files|*.*"
                    fileTitle="Select retroarch.exe"
                  />
                </div>

                {pathError && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">{pathError}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-sm text-nexus-muted hover:text-white transition-all">
                    BACK
                  </button>
                  <button
                    onClick={handleSavePaths}
                    disabled={savingPaths || !romsPath.trim()}
                    className="flex-1 py-4 bg-nexus-accent text-black rounded-2xl font-black text-sm hover:bg-nexus-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingPaths ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    SAVE & CONTINUE
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Scan */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative">
                  <motion.div
                    animate={scanning ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    className="w-32 h-32 border-2 border-dashed border-nexus-accent/30 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {scanDone
                      ? <CheckCircle2 className="w-10 h-10 text-green-400" />
                      : scanning
                        ? <Loader2 className="w-10 h-10 text-nexus-accent animate-spin" />
                        : <Search className="w-10 h-10 text-nexus-accent" />
                    }
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">
                    {scanDone ? 'Scan Complete' : scanning ? 'Scanning…' : 'Ready to Scan'}
                  </h2>
                  <p className="text-nexus-muted text-xs max-w-xs mx-auto">
                    {scanDone
                      ? `Found ${foundCount} new title${foundCount !== 1 ? 's' : ''} and added them to your library.`
                      : scanning
                        ? `Scanning ${romsPath}`
                        : `Nexus will index every ROM in ${romsPath || 'your vault'} and auto-detect platforms.`
                    }
                  </p>
                </div>

                {scanError && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl w-full">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">{scanError}</p>
                  </div>
                )}

                {!scanDone && (
                  <div className="flex gap-4 w-full">
                    <button onClick={() => setStep(2)} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold text-sm text-nexus-muted hover:text-white transition-all">
                      BACK
                    </button>
                    <button
                      onClick={handleScan}
                      disabled={scanning}
                      className="flex-1 py-4 bg-nexus-accent text-black rounded-2xl font-black text-sm hover:bg-nexus-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      {scanning ? 'SCANNING…' : 'START SCAN'}
                    </button>
                  </div>
                )}

                {!scanDone && !scanning && (
                  <button onClick={() => setStep(4)} className="text-[10px] text-nexus-muted hover:text-white transition-colors underline underline-offset-4">
                    Skip for now, I'll scan later
                  </button>
                )}
              </motion.div>
            )}

            {/* Step 4 — Done */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={variants} initial="enter" animate="center" exit="exit"
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="space-y-8 text-center"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full mx-auto flex items-center justify-center relative border border-green-500/30">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                  <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black italic uppercase tracking-tight">You're All Set</h2>
                  <p className="text-nexus-muted text-xs mx-auto max-w-sm">
                    {foundCount > 0
                      ? `${foundCount} game${foundCount !== 1 ? 's' : ''} indexed and ready to play.`
                      : 'Nexus is configured. You can scan your vault any time from the Vault Manager tab.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-left">
                    <Database className="w-5 h-5 text-nexus-accent" />
                    <div>
                      <p className="text-[10px] font-black text-nexus-muted uppercase">Database</p>
                      <p className="text-xs font-bold">Neon PostgreSQL</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-left">
                    <Search className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-[10px] font-black text-nexus-muted uppercase">Ghost Scanner</p>
                      <p className="text-xs font-bold">{romsPath ? 'Active' : 'Set vault to activate'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onComplete}
                  className="w-full py-5 bg-nexus-accent text-black font-black rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest italic"
                >
                  Enter Nexus →
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};