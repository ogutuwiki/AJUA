import React from 'react';
import type { GameState } from '@/types/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStatsProps {
  gameState: GameState;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ gameState }) => {
  const { scores, currentPlayer, playerNames, status } = gameState;

  const PlayerDisplay: React.FC<{playerNum: 1 | 2}> = ({ playerNum }) => {
    const name = playerNames[`player${playerNum}`];
    const score = scores[`player${playerNum}`];
    const isTurn = currentPlayer === playerNum && status === "playing";

    return (
      <div className={cn("flex flex-col items-center p-4 rounded-lg", isTurn ? "bg-accent/20 ring-2 ring-accent" : "bg-card")}>
        <h3 className={cn("text-lg font-headline mb-1", isTurn ? "text-accent-foreground" : "text-foreground")}>{name}</h3>
        <p className={cn("text-2xl font-bold font-body", isTurn ? "text-accent-foreground" : "text-primary")}>{score}</p>
        {isTurn && <ChevronRight className="w-6 h-6 text-accent animate-pulse mt-1" />}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-headline text-center flex items-center justify-center">
          <Users className="w-6 h-6 mr-2 text-primary" />
          Player Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-around items-start pt-2">
        <PlayerDisplay playerNum={1} />
        <div className="text-4xl font-headline text-muted-foreground self-center mx-2 vs-text">vs</div>
        <PlayerDisplay playerNum={2} />
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
