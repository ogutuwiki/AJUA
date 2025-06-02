import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { GameState } from '@/types/game';

interface GameMessagesProps {
  gameState: GameState | null;
  error?: string | null;
}

const GameMessages: React.FC<GameMessagesProps> = ({ gameState, error }) => {
  if (error) {
    return (
      <Card className="mt-4 border-destructive bg-destructive/10">
        <CardContent className="p-3">
          <div className="flex items-center text-destructive">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p className="font-medium">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gameState) {
    return null;
  }
  
  const { lastMoveMessage, status, winner, playerNames } = gameState;

  let message = lastMoveMessage;
  let Icon = Info;
  let cardClass = "border-primary/30 bg-primary/5";
  let textClass = "text-primary-foreground";

  if (status === 'gameOver') {
    Icon = CheckCircle2;
    cardClass = "border-accent/50 bg-accent/10";
    textClass = "text-accent-foreground";
    if (winner && winner !== "draw") {
      message = `${playerNames[`player${winner}`]} wins! Final Scores: ${playerNames.player1} - ${gameState.scores.player1}, ${playerNames.player2} - ${gameState.scores.player2}.`;
    } else if (winner === "draw") {
      message = `It's a draw! Final Scores: ${playerNames.player1} - ${gameState.scores.player1}, ${playerNames.player2} - ${gameState.scores.player2}.`;
    } else {
      message = `Game Over. Final Scores: ${playerNames.player1} - ${gameState.scores.player1}, ${playerNames.player2} - ${gameState.scores.player2}.`;
    }
  }


  return (
    <Card className={`mt-4 ${cardClass} shadow`}>
      <CardContent className="p-3">
        <div className={`flex items-center ${textClass}`}>
          <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="font-medium text-sm">{message || "Welcome to Pebble Pits!"}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameMessages;
