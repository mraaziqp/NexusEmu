import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone, Download, CheckCircle2, ExternalLink,
  ChevronRight, Apple, Play, Gamepad2, AlertCircle,
  Monitor, Wifi, ArrowRight, Star, X,
} from 'lucide-react';

// ─── Emulator definitions ─────────────────────────────────────────────────────
const IOS_EMULATORS = [
  {
    id: 'delta',
    name: 'Delta',
    tagline: 'Best for NES, SNES, N64, GBA, GBC, DS, NDS',
    icon: '🕹️',
    storeUrl: 'https://apps.apple.com/app/delta-game-emulator/id1048524688',
    storeLabel: 'App Store',
    platforms: ['NES', 'SNES', 'N64', 'GBA', 'GBC', 'NDS'],
    free: true,
    recommended: true,
  },
  {
    id: 'provenance',
    name: 'Provenance',
    tagline: 'PS1, Sega Genesis, Atari, PC Engine + more',
    icon: '🎮',
    storeUrl: 'https://apps.apple.com/app/provenance-multi-emulator/id1148827539',
    storeLabel: 'App Store',
    platforms: ['PS1', 'Genesis', 'Atari', 'PCE'],
    free: true,
    recommended: false,
  },
  {
    id: 'ppsspp',
    name: 'PPSSPP',
    tagline: 'PlayStation Portable games at full speed',
    icon: '📱',
    storeUrl: 'https://apps.apple.com/app/ppsspp-psp-emulator/id1204733938',
    storeLabel: 'App Store',
    platforms: ['PSP'],
    free: true,
    recommended: false,
  },
];

const ANDROID_EMULATORS = [
  {
    id: 'retroarch',
    name: 'RetroArch',
    tagline: 'All-in-one — every system, every core',
    icon: '🎮',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.retroarch',
    storeLabel: 'Google Play',
    platforms: ['All systems'],
    free: true,
    recommended: true,
  },
  {
    id: 'lemuroid',
    name: 'Lemuroid',
    tagline: 'Clean modern UI, auto-detects ROMs',
    icon: '🦎',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.swordfish.lemuroid',
    storeLabel: 'Google Play',
    platforms: ['Most systems'],
    free: true,
    recommended: false,
  },
  {
    id: 'ppsspp-android',
    name: 'PPSSPP',
    tagline: 'PSP games, excellent compatibility',
    icon: '📱',
    storeUrl: 'https://play.google.com/store/apps/details?id=org.ppsspp.ppsspp',
    storeLabel: 'Google Play',
    platforms: ['PSP'],
    free: true,
    recommended: false,
  },
];

// Detect device type from userAgent
function getDeviceType(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

interface Emulator {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  storeUrl: string;
  storeLabel: string;
  platforms: string[];
  free: boolean;
  recommended: boolean;
}

// ─── Step-by-step guide per platform ─────────────────────────────────────────
function IOSGuide({ emulator, serverUrl }: { emulator: Emulator; serverUrl: string }) {
  const steps =
    emulator.id === 'delta'
      ? [
          { n: 1, title: 'Install Delta', desc: 'Tap "Get on App Store" above and install Delta.' },
          { n: 2, title: 'Open Nexus on your iPhone', desc: `Browse your library at ${serverUrl}` },
          { n: 3, title: 'Tap a game → DOWNLOAD ROM', desc: 'The ROM file saves to your iPhone.' },
          { n: 4, title: 'Open in Delta', desc: 'In Files, tap the downloaded ROM → "Open in Delta". Done!' },
        ]
      : [
          { n: 1, title: `Install ${emulator.name}`, desc: 'Tap "Get on App Store" and install it.' },
          { n: 2, title: 'Open Nexus on your iPhone', desc: `Browse your library at ${serverUrl}` },
          { n: 3, title: 'Download a ROM', desc: 'Tap a game → DOWNLOAD ROM. It saves to Files.' },
          { n: 4, title: `Open in ${emulator.name}`, desc: `In Files app, tap the ROM → "Open in ${emulator.name}". Done!` },
        ];

  return (
    <div className="space-y-3 pt-2">
      {steps.map(s => (
        <div key={s.n} className="flex gap-3 items-start">
          <div className="w-6 h-6 rounded-full bg-nexus-accent/20 border border-nexus-accent/40 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-nexus-accent">{s.n}</div>
          <div>
            <p className="text-sm font-bold">{s.title}</p>
            <p className="text-xs text-nexus-muted">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AndroidGuide({ emulator, serverUrl }: { emulator: Emulator; serverUrl: string }) {
  const steps =
    emulator.id === 'retroarch'
      ? [
          { n: 1, title: 'Install RetroArch', desc: 'Tap "Get on Google Play" above and install.' },
          { n: 2, title: 'Open RetroArch → Load Core', desc: 'In RetroArch: Main Menu → Load Core → Download a Core → pick your system.' },
          { n: 3, title: 'Open Nexus on your phone', desc: `Browse your library at ${serverUrl}` },
          { n: 4, title: 'Download a ROM', desc: 'Tap a game → DOWNLOAD ROM. It saves to Downloads.' },
          { n: 5, title: 'Load in RetroArch', desc: 'Main Menu → Load Content → navigate to Downloads → select the ROM.' },
        ]
      : [
          { n: 1, title: `Install ${emulator.name}`, desc: 'Tap "Get on Google Play" and install it.' },
          { n: 2, title: 'Open Nexus on your phone', desc: `Browse your library at ${serverUrl}` },
          { n: 3, title: 'Download a ROM', desc: 'Tap a game → DOWNLOAD ROM. Saves to Downloads folder.' },
          { n: 4, title: `Open ${emulator.name}`, desc: `It will auto-scan Downloads and find your games!` },
        ];

  return (
    <div className="space-y-3 pt-2">
      {steps.map(s => (
        <div key={s.n} className="flex gap-3 items-start">
          <div className="w-6 h-6 rounded-full bg-nexus-accent/20 border border-nexus-accent/40 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-nexus-accent">{s.n}</div>
          <div>
            <p className="text-sm font-bold">{s.title}</p>
            <p className="text-xs text-nexus-muted">{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const MobileEmulatorSetup: React.FC<{ serverUrl?: string }> = ({ serverUrl = window.location.origin }) => {
  const deviceType = getDeviceType();
  const emulators  = deviceType === 'ios' ? IOS_EMULATORS : ANDROID_EMULATORS;
  const [selected, setSelected] = useState<string>(emulators[0].id);
  const [guideOpen, setGuideOpen] = useState(false);

  const activeEmu = emulators.find(e => e.id === selected) ?? emulators[0];

  if (deviceType === 'desktop') {
    // On desktop this component isn't relevant — show a brief message
    return (
      <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
        <Monitor className="w-6 h-6 text-nexus-muted flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm">You're on desktop</p>
          <p className="text-xs text-nexus-muted mt-1">
            Emulators run locally via RetroArch. Configure it in{' '}
            <span className="text-nexus-accent">Settings → Emulator Setup</span>.
            To access from your phone, share the URL shown above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl">
          <Smartphone className="w-5 h-5 text-nexus-accent" />
        </div>
        <div>
          <h3 className="font-black text-sm uppercase tracking-widest">
            {deviceType === 'ios' ? '📱 iOS Emulator Setup' : '🤖 Android Emulator Setup'}
          </h3>
          <p className="text-[10px] text-nexus-muted">Pick an emulator below — we'll walk you through the rest.</p>
        </div>
      </div>

      {/* Emulator picker cards */}
      <div className="space-y-3">
        {emulators.map(emu => (
          <button
            key={emu.id}
            onClick={() => { setSelected(emu.id); setGuideOpen(false); }}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              selected === emu.id
                ? 'border-nexus-accent/60 bg-nexus-accent/10'
                : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emu.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm">{emu.name}</p>
                    {emu.recommended && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-nexus-accent bg-nexus-accent/15 px-2 py-0.5 rounded-full border border-nexus-accent/30">
                        ★ Recommended
                      </span>
                    )}
                    {emu.free && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-nexus-muted">{emu.tagline}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {emu.platforms.join(' · ')}
                  </p>
                </div>
              </div>
              {selected === emu.id && (
                <CheckCircle2 className="w-5 h-5 text-nexus-accent flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Install button for selected emulator */}
      <a
        href={activeEmu.storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full py-4 bg-nexus-accent text-black font-black rounded-2xl hover:bg-nexus-accent/90 active:scale-95 transition-all text-sm uppercase tracking-wider"
      >
        <Download className="w-4 h-4" />
        Get {activeEmu.name} — {activeEmu.storeLabel}
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>

      {/* Step-by-step guide toggle */}
      <button
        onClick={() => setGuideOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 transition-all text-sm"
      >
        <span className="font-bold">How to load games with {activeEmu.name}</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${guideOpen ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {guideOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-5 rounded-2xl">
              {deviceType === 'ios'
                ? <IOSGuide emulator={activeEmu} serverUrl={serverUrl} />
                : <AndroidGuide emulator={activeEmu} serverUrl={serverUrl} />
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
