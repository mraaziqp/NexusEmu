import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad, Activity, ShieldCheck, Zap, Cpu, Terminal, RefreshCw, Radio } from 'lucide-react';

interface DetectedGamepad {
  index: number;
  id: string;
  axes: number;
  buttons: number;
  connected: boolean;
  mapping: string;
  buttonStates: boolean[];
  axisValues: number[];
}

function parseGamepadId(raw: string): { name: string; vid: string; pid: string } {
  const vidPid = raw.match(/Vendor:\s*([\da-f]{4}).*Product:\s*([\da-f]{4})/i) ??
                 raw.match(/([\da-f]{4})-([\da-f]{4})/i);
  const name = raw.split('(')[0].trim() || raw.slice(0, 40);
  return {
    name,
    vid: vidPid ? `0x${vidPid[1].toUpperCase()}` : 'â€”',
    pid: vidPid ? `0x${vidPid[2].toUpperCase()}` : 'â€”',
  };
}

export const ControllerSettings: React.FC = () => {
  const [gamepads, setGamepads] = useState<DetectedGamepad[]>([]);
  const [isAutoDetect, setIsAutoDetect] = useState(true);
  const rafRef = useRef<number>(0);

  function readGamepads() {
    const raw = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    const connected = raw.filter(Boolean) as Gamepad[];
    setGamepads(connected.map(gp => ({
      index: gp.index,
      id: gp.id,
      axes: gp.axes.length,
      buttons: gp.buttons.length,
      connected: gp.connected,
      mapping: gp.mapping,
      buttonStates: Array.from(gp.buttons).map(b => b.pressed),
      axisValues: Array.from(gp.axes).map(a => Math.round(a * 100) / 100),
    })));
  }

  // Poll gamepad state at ~60fps for live button visualization
  useEffect(() => {
    if (!isAutoDetect) { cancelAnimationFrame(rafRef.current); return; }
    function tick() { readGamepads(); rafRef.current = requestAnimationFrame(tick); }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isAutoDetect]);

  useEffect(() => {
    window.addEventListener('gamepadconnected', readGamepads);
    window.addEventListener('gamepaddisconnected', readGamepads);
    return () => {
      window.removeEventListener('gamepadconnected', readGamepads);
      window.removeEventListener('gamepaddisconnected', readGamepads);
    };
  }, []);

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-nexus-accent flex items-center gap-2">
            <Terminal className="w-3 h-3" /> Hardware_IO_Manager
          </h3>
          <h2 className="text-2xl font-black italic tracking-tight">Controller Diagnostics</h2>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 bg-nexus-accent/10 border border-nexus-accent/20 rounded-xl">
          <div className={`w-2 h-2 rounded-full ${gamepads.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-nexus-muted'}`} />
          <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${gamepads.length > 0 ? 'text-green-500' : 'text-nexus-muted'}`}>
            {gamepads.length > 0 ? `${gamepads.length} CONTROLLER${gamepads.length > 1 ? 'S' : ''} LIVE` : 'NO INPUT'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Detected Controllers */}
        <div className="md:col-span-2 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Detected Input Nodes</h4>
              <span className="text-[10px] font-mono text-nexus-muted">Devices: {String(gamepads.length).padStart(2, '0')}</span>
            </div>

            <AnimatePresence mode="popLayout">
              {gamepads.map((gp) => {
                const { name, vid, pid } = parseGamepadId(gp.id);
                return (
                  <motion.div
                    key={gp.index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="p-6 glass-panel rounded-2xl relative overflow-hidden border-white/10"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-nexus-accent" />
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Gamepad className="w-24 h-24 rotate-12" />
                    </div>
                    <div className="relative z-10 flex items-start justify-between mb-6">
                      <div className="flex gap-6">
                        <div className="w-16 h-16 bg-nexus-accent/10 rounded-2xl flex items-center justify-center border border-nexus-accent/20">
                          <Gamepad className="w-8 h-8 text-nexus-accent" />
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-lg font-bold tracking-tight line-clamp-1 max-w-[240px]">{name}</h5>
                          <div className="flex gap-4 font-mono text-[10px]">
                            <span className="px-2 py-0.5 bg-white/5 rounded text-nexus-muted">VID: <span className="text-white">{vid}</span></span>
                            <span className="px-2 py-0.5 bg-white/5 rounded text-nexus-muted">PID: <span className="text-white">{pid}</span></span>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] font-bold text-green-500/80 uppercase">
                              {gp.mapping === 'standard' ? 'Standard Mapping Â· ' : ''}{gp.buttons} Buttons Â· {gp.axes} Axes
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold rounded-lg flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        LIVE
                      </div>
                    </div>

                    {/* Live Button Grid */}
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <p className="text-[9px] font-black text-nexus-muted uppercase tracking-widest">Live Button State</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gp.buttonStates.map((pressed, bi) => (
                          <div
                            key={bi}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-black transition-all duration-75 ${
                              pressed
                                ? 'bg-nexus-accent text-black scale-110 shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                                : 'bg-white/5 text-nexus-muted'
                            }`}
                          >
                            {bi}
                          </div>
                        ))}
                      </div>

                      {/* Axis Values */}
                      {gp.axisValues.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {gp.axisValues.map((val, ai) => (
                            <div key={ai} className="space-y-1">
                              <div className="flex justify-between text-[8px] font-mono">
                                <span className="text-nexus-muted">AXIS_{ai}</span>
                                <span className={Math.abs(val) > 0.1 ? 'text-nexus-accent' : 'text-nexus-muted'}>{val.toFixed(2)}</span>
                              </div>
                              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-nexus-accent/60 rounded-full transition-all duration-75"
                                  style={{ width: `${((val + 1) / 2) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {gamepads.length === 0 && (
              <div className="p-10 glass-panel rounded-2xl border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-nexus-muted opacity-60">
                <Gamepad className="w-12 h-12" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest italic">No controllers detected</p>
                  <p className="text-[10px]">Plug in or connect a controller, then press any button to activate it.</p>
                </div>
              </div>
            )}
          </section>

          {/* Auto-Detect Toggle */}
          <section className="glass-panel p-6 rounded-2xl border-white/5 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl transition-colors ${isAutoDetect ? 'bg-nexus-accent/20' : 'bg-white/5'}`}>
                  <RefreshCw className={`w-5 h-5 ${isAutoDetect ? 'text-nexus-accent' : 'text-nexus-muted'}`} style={isAutoDetect ? { animation: 'spin 3s linear infinite' } : {}} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold flex items-center gap-2">
                    Zero-Config Auto-Detection
                    {isAutoDetect && <span className="inline-block w-2 h-2 rounded-full bg-nexus-accent animate-pulse" />}
                  </h4>
                  <p className="text-xs text-nexus-muted max-w-sm">
                    Uses the Web Gamepad API to detect HID devices in real time. Plug in a controller and press any button.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAutoDetect(v => !v)}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${isAutoDetect ? 'bg-nexus-accent' : 'bg-white/10'}`}
              >
                <motion.div animate={{ x: isAutoDetect ? 26 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg" />
              </button>
            </div>
            <AnimatePresence>
              {isAutoDetect && gamepads.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 font-mono text-[9px] text-nexus-accent/60 space-y-1 border-t border-white/5 pt-4"
                >
                  {gamepads.map(gp => (
                    <p key={gp.index}>[ACTIVE] Gamepad {gp.index}: {gp.id.slice(0, 50)}</p>
                  ))}
                  <p className="flex items-center gap-1"><span className="text-green-500">LIVE</span> Polling Gamepad API @ 60fps</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Right: Metrics */}
        <div className="space-y-6">
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-nexus-muted px-1">Runtime Info</h4>
            <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
              <div className="space-y-3 font-mono text-[9px] text-nexus-accent/80">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-nexus-muted">GAMEPAD_API</span>
                  <span className="text-green-500">{typeof navigator.getGamepads === 'function' ? 'SUPPORTED' : 'UNAVAILABLE'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-nexus-muted">CONNECTED</span>
                  <span className="text-white">{gamepads.length} / 4</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-nexus-muted">POLL_RATE</span>
                  <span className="text-white">{isAutoDetect ? '~60fps' : 'IDLE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-nexus-muted">HAPTIC</span>
                  <span className="text-nexus-muted">{gamepads[0]?.id.toLowerCase().includes('dual') ? 'DualSense Ready' : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Axis Visualizer for first controller */}
            {gamepads[0] && (
              <div className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-nexus-muted">Stick Visualization</p>
                <div className="grid grid-cols-2 gap-4">
                  {[0, 2].map((startAxis) => {
                    const x = gamepads[0].axisValues[startAxis] ?? 0;
                    const y = gamepads[0].axisValues[startAxis + 1] ?? 0;
                    return (
                      <div key={startAxis} className="aspect-square bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <div className="w-full h-px bg-white" />
                          <div className="absolute w-px h-full bg-white" />
                        </div>
                        <motion.div
                          animate={{ x: x * 40, y: y * 40 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-nexus-accent rounded-full shadow-[0_0_12px_rgba(0,240,255,0.8)]"
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="text-[8px] font-mono text-nexus-muted text-center">L-Stick Â· R-Stick</p>
              </div>
            )}

            <div className="p-4 bg-nexus-accent/5 rounded-2xl border border-nexus-accent/10">
              <p className="text-[9px] text-nexus-muted leading-relaxed">
                <span className="text-nexus-accent font-black">Tip:</span> Nexus routes all controller input through RetroArch's SDL2 layer. Controllers are automatically mapped to the correct core for each platform â€” no manual setup required.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

