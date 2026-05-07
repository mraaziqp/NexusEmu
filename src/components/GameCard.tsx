import React from 'react';
import { motion } from 'motion/react';
import { Game } from '../types';
import { Play, Clock, Cloud } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
  index: number;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      layoutId={`card-${game.id}`}
      onClick={() => onSelect(game)}
      className="group relative aspect-[3/4] bg-nexus-surface rounded-2xl overflow-hidden cursor-pointer border border-white/5 shadow-2xl"
    >
      <motion.img
        layoutId={`image-${game.id}`}
        src={game.boxArt}
        alt={game.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold bg-nexus-accent px-2 py-0.5 rounded text-white tracking-widest">
              {game.platform}
            </span>
            {game.syncStatus === 'synced' && (
              <Cloud className="w-3 h-3 text-green-400" />
            )}
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
        </motion.div>
      </div>
      
      {/* Minimal platform badge when not hovered */}
      <div className="absolute top-3 right-3 group-hover:opacity-0 transition-opacity">
        <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
          <span className="text-[8px] font-black uppercase text-nexus-muted tracking-tighter">
            {game.platform}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
