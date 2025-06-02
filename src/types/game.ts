import type { Timestamp } from 'firebase/firestore';

export type Player = 1 | 2;
export type GameStatus = "waiting" | "playing" | "gameOver";

export interface Scores {
  player1: number;
  player2: number;
}

export interface GameState {
  id: string;
  board: number[]; // 12 pits, seeds count for each
  currentPlayer: Player;
  player1Id: string | null;
  player2Id: string | null; // Could be 'CPU' or user ID
  playerNames: { player1: string; player2: string };
  scores: Scores;
  status: GameStatus;
  winner: Player | null | "draw"; // null if ongoing or no winner yet, 'draw' for ties
  lastMoveMessage: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const PITS_PER_PLAYER = 6;
export const TOTAL_PITS = PITS_PER_PLAYER * 2;
export const INITIAL_SEEDS_PER_PIT = 4;
