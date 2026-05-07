import { useState, useEffect, useRef } from 'react';
import { LiveStats } from '../types';

const DEFAULT_STATS: LiveStats = {
  cpu: { load: 0, cores: 1, model: 'Unknown' },
  gpu: { load: -1, model: 'RTX 3060 Ti', available: false },
  memory: { total: 0, used: 0, free: 0, usedPercent: 0 },
  disk: { total: 0, used: 0, free: 0, usedPercent: 0 },
  platform: 'win32',
  uptime: 0,
};

// Detect mobile — no point hammering the server for CPU stats on a phone
const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

export function useTelemetry(intervalMs = 2000) {
  const [stats, setStats] = useState<LiveStats>(DEFAULT_STATS);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mobile use a much slower interval — stats are shown on desktop only
  const effectiveInterval = isMobile ? Math.max(intervalMs, 30_000) : intervalMs;

  function startPolling() {
    if (timerRef.current) return;
    timerRef.current = setInterval(fetchStats, effectiveInterval);
  }
  function stopPolling() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function fetchStats() {
    // Don't fetch when tab is backgrounded
    if (document.hidden) return;
    try {
      const res = await fetch('/api/system/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LiveStats = await res.json();
      setStats(data);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    // Don't even start on mobile until the page becomes visible
    if (!isMobile) fetchStats();

    startPolling();

    const onVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchStats();
        startPolling();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveInterval]);

  return { stats, error };
}
