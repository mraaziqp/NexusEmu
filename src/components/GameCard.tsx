import React, { memo, useState } from 'react';
import { Game } from '../types';
import { Play, Clock, Cloud, Gamepad2 } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  index: number;
  focused?: boolean;
}

const PLATFORM_COLORS: Record<string, string> = {
  ps2: '#003791', ps1: '#003087', psp: '#00439c',
  nes: '#e4000f', snes: '#8b0000', n64: '#009ac7',
  gba: '#8b4513', gbc: '#4a90d9', gb: '#8e8e8e',
  nds: '#c40000', genesis: '#1a6b9b', megadrive: '#1a6b9b',
  dreamcast: '#f05e23', saturn: '#6c4a9a', gamegear: '#e8151b',
  mame: '#2d2d2d', unknown: '#1a1a2e',
};

export const GameCard: React.FC<GameCardProps> = memo(({ game, onSelect, focused }) => {
  const [imgError, setImgError] = useState(false);
  const accentColor = PLATFORM_COLORS[game.platform] ?? PLATFORM_COLORS.unknown;
  const showPlaceholder = !game.boxArt || imgError;

  return (
    <div
      onClick={() => onSelect(game)}
      data-gpnav
      className={`group relative aspect-[3/4] bg-nexus-surface rounded-2xl overflow-hidden cursor-pointer border shadow-2xl transition-transform duration-200 hover:scale-[1.04] active:scale-[0.97] ${
        focused ? 'border-nexus-accent shadow-[0_0_0_2px_#3b82f6]' : 'border-white/5'
      }`}
    >
      {showPlaceholder ? (
        <div
          className="w-full h-full flex flex-col items-center justify-center gap-3 p-4"
          style={{ background: `linear-gradient(135deg, ${accentColor}33 0%, #0d0d1a 100%)` }}
        >
          <div className="p-3 rounded-2xl" style={{ backgroundColor: `${accentColor}40`, border: `1px solid ${accentColor}60` }}>
            <Gamepad2 className="w-8 h-8 opacity-70" style={{ color: accentColor }} />
          </div>
          <p className="text-center text-[10px] font-bold text-white/60 leading-tight line-clamp-3 px-1">
            {game.title}
          </p>
        </div>
      ) : (
        <img
          src={game.boxArt!}
          alt={game.title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      )}

      {/* Hover overlay — pure CSS, no Framer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
        <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-200 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold bg-nexus-accent px-2 py-0.5 rounded text-white tracking-widest">
              {game.platform}
            </span>
            {game.syncStatus === 'synced' && <Cloud className="w-3 h-3 text-green-400" />}
          </div>
          <h3 className="font-bold text-sm leading-tight line-clamp-2">{game.title}</h3>
          <div className="flex items-center gap-3 text-[10px] text-nexus-muted pt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {(game.playtime / 60).toFixed(1)}h
            </div>
            <div className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              RESUME
            </div>
          </div>
        </div>
      </div>

      {/* Platform badge */}
      <div className="absolute top-3 right-3 group-hover:opacity-0 transition-opacity duration-200">
        <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
          <span className="text-[8px] font-black uppercase text-nexus-muted tracking-tighter">
            {game.platform.slice(0, 4)}
          </span>
        </div>
      </div>
    </div>
  );
});

GameCard.displayName = 'GameCard';

