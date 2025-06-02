import type { GameState, Player } from '@/types/game';
import { TOTAL_PITS, PITS_PER_PLAYER, INITIAL_SEEDS_PER_PIT } from '@/types/game';

export const getInitialBoard = (): number[] => {
  return new Array(TOTAL_PITS).fill(INITIAL_SEEDS_PER_PIT);
};

export const getInitialGameState = (player1Id: string, gameId: string): Omit<GameState, 'createdAt' | 'updatedAt'> => {
  return {
    id: gameId,
    board: getInitialBoard(),
    currentPlayer: 1,
    player1Id,
    player2Id: "CPU", // Default to "CPU" for single player start
    playerNames: { player1: "Player 1", player2: "Player 2 (CPU)" },
    scores: { player1: 0, player2: 0 },
    status: "playing",
    winner: null,
    lastMoveMessage: "Game started. Player 1's turn.",
  };
};

// Identifies which pits belong to a player based on their number (1 or 2)
export const getPlayerPitsIndices = (player: Player): number[] => {
  if (player === 1) {
    return Array.from({ length: PITS_PER_PLAYER }, (_, i) => i); // 0-5
  } else {
    return Array.from({ length: PITS_PER_PLAYER }, (_, i) => i + PITS_PER_PLAYER); // 6-11
  }
};

export const isPlayersPit = (pitIndex: number, player: Player): boolean => {
  if (player === 1) {
    return pitIndex >= 0 && pitIndex < PITS_PER_PLAYER;
  } else {
    return pitIndex >= PITS_PER_PLAYER && pitIndex < TOTAL_PITS;
  }
};

// This function processes the move AFTER AI validation confirms the chosen pit is a valid starting point.
// It handles sowing, capturing, turn changes, and game over checks.
export const processMove = (currentState: GameState, pitIndex: number): GameState => {
  const board = [...currentState.board];
  const player = currentState.currentPlayer;
  const scores = { ...currentState.scores };
  let lastMoveMessage = "";

  let seedsToSow = board[pitIndex];
  board[pitIndex] = 0; // Empty the picked pit

  let currentPit = pitIndex;
  for (let i = 0; i < seedsToSow; i++) {
    currentPit = (currentPit + 1) % TOTAL_PITS;
    board[currentPit]++;
  }
  
  lastMoveMessage = `${currentState.playerNames[`player${player}`]} sowed ${seedsToSow} seeds from pit ${pitIndex % PITS_PER_PLAYER + 1}. `;

  // Capture logic: if last seed lands in an empty pit on player's own side,
  // and the opposite pit is not empty, capture seeds from own pit and opposite pit.
  const landedOnPlayersSide = isPlayersPit(currentPit, player);
  if (landedOnPlayersSide && board[currentPit] === 1) { // Was empty before this last seed
    const oppositePitIndex = TOTAL_PITS - 1 - currentPit;
    if (board[oppositePitIndex] > 0) {
      const capturedSeeds = board[oppositePitIndex] + board[currentPit]; // Seeds from opposite + the one just sown
      if (player === 1) {
        scores.player1 += capturedSeeds;
      } else {
        scores.player2 += capturedSeeds;
      }
      board[currentPit] = 0;
      board[oppositePitIndex] = 0;
      lastMoveMessage += `Captured ${capturedSeeds} seeds!`;
    }
  }

  // Determine next player
  const nextPlayer = player === 1 ? 2 : 1;

  // Check game over condition: if the next player has no valid moves
  const nextPlayerPitsIndices = getPlayerPitsIndices(nextPlayer);
  const nextPlayerHasMoves = nextPlayerPitsIndices.some(idx => board[idx] > 0);

  let newStatus = currentState.status;
  let winner = currentState.winner;
  let finalCurrentPlayer = nextPlayer;

  if (!nextPlayerHasMoves) {
    newStatus = "gameOver";
    lastMoveMessage += ` ${currentState.playerNames[`player${nextPlayer}`]} has no moves. Game Over. `;
    
    // Collect remaining seeds for each player
    getPlayerPitsIndices(1).forEach(idx => { scores.player1 += board[idx]; board[idx] = 0; });
    getPlayerPitsIndices(2).forEach(idx => { scores.player2 += board[idx]; board[idx] = 0; });

    if (scores.player1 > scores.player2) {
      winner = 1;
      lastMoveMessage += `${currentState.playerNames.player1} wins!`;
    } else if (scores.player2 > scores.player1) {
      winner = 2;
      lastMoveMessage += `${currentState.playerNames.player2} wins!`;
    } else {
      winner = "draw";
      lastMoveMessage += "It's a draw!";
    }
    finalCurrentPlayer = player; // No next turn if game over
  } else {
     lastMoveMessage += ` ${currentState.playerNames[`player${nextPlayer}`]}'s turn.`;
  }


  return {
    ...currentState,
    board,
    scores,
    currentPlayer: finalCurrentPlayer,
    status: newStatus,
    winner,
    lastMoveMessage,
  };
};
