export type Platform = 'nes' | 'snes' | 'n64' | 'ps1' | 'ps2' | 'gba' | 'mame';

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
}

export interface SystemStatus {
  cpuLoad: number;
  gpuLoad: number;
  controllersLinked: number;
  cloudSyncEnabled: boolean;
  lastSync: string;
}
