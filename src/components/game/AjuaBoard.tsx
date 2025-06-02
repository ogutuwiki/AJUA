import React from 'react';
import Pit from './Pit';
import type { GameState, Player } from '@/types/game';
import { PITS_PER_PLAYER, TOTAL_PITS, isPlayersPit } from '@/types/game';

interface AjuaBoardProps {
  gameState: GameState;
  userId: string | null;
  onPitClick: (pitIndex: number) => void;
  isLoading: boolean;
}

const AjuaBoard: React.FC<AjuaBoardProps> = ({ gameState, userId, onPitClick, isLoading }) => {
  const { board, currentPlayer, player1Id, player2Id, status } = gameState;

  const getEffectivePlayerNumber = (): Player | null => {
    if (userId === player1Id) return 1;
    if (userId === player2Id) return 2; // Assuming player2Id is not "CPU" for this check
    if (player2Id === "CPU" && userId === player1Id) return 1; // If P2 is CPU, user is P1
    return null; // Spectator or game not fully joined
  };
  const userPlayerNumber = getEffectivePlayerNumber();

  const renderPits = (player: Player) => {
    const pitIndices = player === 1 
      ? Array.from({ length: PITS_PER_PLAYER }, (_, i) => i) // Pits 0-5 for Player 1
      : Array.from({ length: PITS_PER_PLAYER }, (_, i) => TOTAL_PITS - 1 - i); // Pits 11-6 (reversed) for Player 2 (top row)
    
    return pitIndices.map((pitIndex) => {
      const seeds = board[pitIndex];
      const owner = isPlayersPit(pitIndex, 1) ? 1 : 2;
      const isCurrentUsersTurn = userPlayerNumber === currentPlayer;
      const pitBelongsToCurrentUser = userPlayerNumber === owner;
      
      const isPlayable = 
        status === "playing" &&
        !isLoading &&
        isCurrentUsersTurn &&
        pitBelongsToCurrentUser &&
        seeds > 0;

      return (
        <Pit
          key={`pit-${pitIndex}`}
          id={`pit-${pitIndex}`}
          index={pitIndex}
          seeds={seeds}
          owner={owner}
          isCurrentPlayerPit={pitBelongsToCurrentUser && currentPlayer === owner}
          isPlayable={isPlayable}
          onClick={() => onPitClick(pitIndex)}
        />
      );
    });
  };

  return (
    <div className="bg-background p-4 rounded-lg shadow-xl border border-primary/20">
      {/* Player 2 Pits (Top Row - rendered visually reversed for typical board layout) */}
      <div className="flex justify-center mb-4 opacity-80 transform scale-95">
        {renderPits(2)}
      </div>
      
      {/* Separator or Middle Area - can be empty or decorative */}
      <div className="h-2 my-4 bg-border rounded-full"></div>

      {/* Player 1 Pits (Bottom Row) */}
      <div className="flex justify-center mt-4">
        {renderPits(1)}
      </div>
    </div>
  );
};

export default AjuaBoard;
