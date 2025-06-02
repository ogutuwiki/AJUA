// src/ai/flows/validate-move.ts
'use server';

/**
 * @fileOverview A move validation AI agent for the Ajua game.
 *
 * - validateMove - A function that validates a move in the Ajua game using GenAI.
 * - ValidateMoveInput - The input type for the validateMove function.
 * - ValidateMoveOutput - The return type for the validateMove function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateMoveInputSchema = z.object({
  boardState: z.array(z.number()).describe('The current state of the Ajua board, as an array of numbers representing the seeds in each pit.'),
  player: z.number().describe('The current player making the move (1 or 2).'),
  pitIndex: z.number().describe('The index of the pit selected by the player (0-11).'),
});
export type ValidateMoveInput = z.infer<typeof ValidateMoveInputSchema>;

const ValidateMoveOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the move is valid according to Ajua rules.'),
  reason: z.string().describe('The reason why the move is invalid, if applicable.'),
});
export type ValidateMoveOutput = z.infer<typeof ValidateMoveOutputSchema>;

export async function validateMove(input: ValidateMoveInput): Promise<ValidateMoveOutput> {
  return validateMoveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateMovePrompt',
  input: {schema: ValidateMoveInputSchema},
  output: {schema: ValidateMoveOutputSchema},
  prompt: `You are an expert Ajua game referee.  You will be given the current board state,
the player making the move, and the pit index they selected.  Your job is to
determine if the move is valid according to the rules of Ajua.

Here are the rules of Ajua:

*   The game is played on a board with 12 pits, 6 on each side.
*   Each player controls the 6 pits on their side of the board.
*   At the start of the game, each pit has a certain number of seeds.
*   On a player's turn, they select one of their pits and sow the seeds from that pit, distributing one seed into each subsequent pit counter-clockwise around the board.
*   If the last seed lands in an empty pit on the player's side, and the opposite pit on the opponent's side has seeds, the player captures those seeds and their own last seed.
*   The game ends when one player cannot make a valid move.

Board State: {{{boardState}}}
Player: {{{player}}}
Pit Index: {{{pitIndex}}}

Is this a valid move?  Return a JSON object with the isValid field set to true or false.
If the move is invalid, explain why in the reason field.
`,
});

const validateMoveFlow = ai.defineFlow(
  {
    name: 'validateMoveFlow',
    inputSchema: ValidateMoveInputSchema,
    outputSchema: ValidateMoveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
