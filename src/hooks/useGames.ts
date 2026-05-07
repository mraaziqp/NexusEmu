import { useState, useEffect, useCallback } from 'react';
import { Game, ScanResult } from '../types';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch('/api/games');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Game[] = await res.json();
      setGames(data);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const scanVault = useCallback(async (rootPath?: string): Promise<ScanResult | null> => {
    setScanning(true);
    try {
      const res = await fetch('/api/vault/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rootPath ? { root_path: rootPath } : {}),
      });
      const result: ScanResult = await res.json();
      if (!res.ok) throw new Error((result as any).error ?? `HTTP ${res.status}`);
      // Refresh library after scan
      await fetchGames();
      return result;
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setScanning(false);
    }
  }, [fetchGames]);

  const launchGame = useCallback(async (gameId: string, gpuProfile?: string) => {
    const res = await fetch('/api/games/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, gpu_profile: gpuProfile ?? 'native' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data;
  }, []);

  const removeGame = useCallback(async (gameId: string) => {
    await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
    setGames(prev => prev.filter(g => g.id !== gameId));
  }, []);

  return { games, loading, scanning, error, fetchGames, scanVault, launchGame, removeGame };
}
