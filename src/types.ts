export type Platform = 'nes' | 'snes' | 'n64' | 'ps1' | 'ps2' | 'gba' | 'gbc' | 'gb' | 'mame' | 'nds' | '3ds' | 'psp' | 'genesis' | 'megadrive' | 'gamegear' | 'mastersystem' | 'dreamcast' | 'saturn' | 'pce' | 'neogeo' | 'atari2600' | 'atari7800' | 'wonderswan' | 'lynx' | 'unknown';

export interface GameMetadata {
  description: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  genre: string[];
  players: string;
  rating: number;
}

export interface Game {
  id: string;
  title: string;
  platform: Platform;
  boxArt: string;
  heroImage: string;
  playtime: number; // in minutes
  lastPlayed: string;
  metadata: GameMetadata;
  dominantColor?: string;
  syncStatus: 'synced' | 'pending' | 'error';
  relativePath?: string;
  coreId?: string;
}

export interface CoreMapping {
  coreId: string;
  coreName: string;
  standalone?: string;
}

export interface SystemStatus {
  cpuLoad: number;
  gpuLoad: number;
  controllersLinked: number;
  cloudSyncEnabled: boolean;
  lastSync: string;
}

export interface LiveStats {
  cpu: { load: number; cores: number; model: string };
  gpu: { load: number; model: string; available: boolean };
  memory: { total: number; used: number; free: number; usedPercent: number };
  disk: { total: number; used: number; free: number; usedPercent: number };
  platform: string;
  uptime: number;
}

export interface VaultConfig {
  root_path: string;
  bios_path: string;
  emulator_path: string;
  vault_id: string;
}

export interface BiosFile {
  filename: string;
  name: string;
  status: 'VERIFIED' | 'MISSING' | 'HASH_MISMATCH' | 'UNVERIFIED' | 'UNREADABLE';
  size: string;
  hash?: string;
}

export interface DaemonLog {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
  created_at: string;
}

export interface ScanResult {
  scanned: number;
  added: number;
  games: Game[];
}

export interface Playlist {
  id: string;
  name: string;
  game_ids: string[];
  is_portable: boolean;
  created_at: string;
}

export interface NetworkInfo {
  addresses: string[];
  port: number;
  urls: string[];
  labels: Record<string, 'tailscale' | 'lan' | 'vpn'>;
  qrDataUrl: string | null;
}

export interface WatcherStatus {
  active: boolean;
  watchingPath: string;
  pendingDebounce: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  game?: Game;
}


export interface GameMetadata {
  description: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  genre: string[];
  players: string;
  rating: number;
}

export interface Game {
  id: string;
  title: string;
  platform: Platform;
  boxArt: string;
  heroImage: string;
  playtime: number; // in minutes
  lastPlayed: string;
  metadata: GameMetadata;
  dominantColor?: string;
  syncStatus: 'synced' | 'pending' | 'error';
  relativePath?: string;
}

export interface SystemStatus {
  cpuLoad: number;
  gpuLoad: number;
  controllersLinked: number;
  cloudSyncEnabled: boolean;
  lastSync: string;
}

export interface LiveStats {
  cpu: { load: number; cores: number; model: string };
  gpu: { load: number; model: string; available: boolean };
  memory: { total: number; used: number; free: number; usedPercent: number };
  disk: { total: number; used: number; free: number; usedPercent: number };
  platform: string;
  uptime: number;
}

export interface VaultConfig {
  root_path: string;
  bios_path: string;
  emulator_path: string;
  vault_id: string;
}

export interface BiosFile {
  filename: string;
  name: string;
  status: 'VERIFIED' | 'MISSING' | 'HASH_MISMATCH' | 'UNVERIFIED' | 'UNREADABLE';
  size: string;
  hash?: string;
}

export interface DaemonLog {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: string;
  created_at: string;
}

export interface ScanResult {
  scanned: number;
  added: number;
  games: Game[];
}

export interface Playlist {
  id: string;
  name: string;
  game_ids: string[];
  is_portable: boolean;
  created_at: string;
}
