import React from 'react';
import type { Player } from '@/types/game';
import Pebble from './Pebble';
import { cn } from '@/lib/utils';

interface PitProps {
  id: string;
  index: number;
  seeds: number;
  owner: Player;
  isCurrentPlayerPit: boolean;
  isPlayable: boolean;
  onClick: () => void;
}

const Pit: React.FC<PitProps> = ({ index, seeds, isCurrentPlayerPit, isPlayable, onClick }) => {
  const pitLabel = (index % 6) + 1;

  return (
    <div className="flex flex-col items-center mx-1">
      <button
        onClick={onClick}
        disabled={!isPlayable}
        aria-label={`Pit ${pitLabel}, ${seeds} seeds`}
        className={cn(
          "w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-40 bg-card border-2 rounded-lg shadow-md flex flex-col items-center justify-end p-2 relative overflow-hidden",
          isPlayable ? "border-accent cursor-pointer hover:border-primary transition-colors" : "border-border cursor-not-allowed opacity-70",
          isCurrentPlayerPit ? "border-accent" : "border-muted"
        )}
      >
        <div className="grid grid-cols-3 gap-1 mb-1 items-end justify-center flex-grow">
          {Array.from({ length: Math.min(seeds, 15) }).map((_, i) => ( // Display max 15 pebbles for UI reasons
             <Pebble key={i} delay={i} size={seeds > 9 ? 'sm' : 'default'} />
          ))}
        </div>
         {seeds > 15 && <span className="text-xs font-bold text-primary absolute top-1 right-1 bg-background/70 px-1 rounded">+{seeds - 15}</span>}
        <span className="text-sm font-bold text-foreground mt-auto">{seeds}</span>
      </button>
      <span className="text-xs mt-1 text-muted-foreground font-headline">Pit {pitLabel}</span>
    </div>
  );
};

export default Pit;
