"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { signInAnonymously, type User } from 'firebase/auth';
import { useFirebase } from '@/context/FirebaseContext';
import type { GameState } from '@/types/game';
import { getInitialGameState, processMove } from '@/lib/gameLogic';
import AjuaBoard from './AjuaBoard';
import PlayerStats from './PlayerStats';
import GameMessages from './GameMessages';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { validateMove, type ValidateMoveInput } from '@/ai/flows/validate-move';
import { Loader2, Play, RotateCcw } from 'lucide-react';

const GameContainer: React.FC = () => {
  const { db, auth } = useFirebase();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("Error signing in anonymously:", e);
          setError("Could not sign in. Please try again.");
        }
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!db || !gameId) {
      if (gameState) setGameState(null); // Clear game state if no gameId
      return;
    }
    
    setIsLoading(true);
    const gameRef = doc(db, "games", gameId);
    const unsubscribeGame = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data() as GameState);
        setError(null);
      } else {
        setError("Game not found. Create a new one?");
        setGameState(null);
        setGameId(null); // Reset gameId if game doesn't exist
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error listening to game state:", err);
      setError("Error loading game. Please try again.");
      setIsLoading(false);
    });

    return () => unsubscribeGame();
  }, [db, gameId]);


  const handleCreateGame = useCallback(async () => {
    if (!db || !user) {
      setError("Firebase not ready or user not signed in.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newGameRef = await addDoc(collection(db, "games"), {}); // Create doc to get ID
      const newGameId = newGameRef.id;
      const initialGameState = getInitialGameState(user.uid, newGameId);
      const gameDataWithTimestamps = {
        ...initialGameState,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "games", newGameId), gameDataWithTimestamps);
      setGameId(newGameId); // This will trigger the useEffect to listen to the new game
      toast({ title: "New Game Created!", description: "Good luck!" });
    } catch (e) {
      console.error("Error creating game:", e);
      setError("Failed to create game. Please try again.");
      toast({ title: "Error", description: "Failed to create game.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [db, user, toast]);

  const handlePitClick = async (pitIndex: number) => {
    if (!db || !gameState || gameState.status === "gameOver" || isLoading || !user) return;

    // Basic client-side checks
    if (gameState.currentPlayer === 1 && gameState.player1Id !== user.uid) {
      toast({ title: "Not your turn", description: "It's Player 1's turn.", variant: "default" });
      return;
    }
    if (gameState.currentPlayer === 2 && gameState.player2Id !== user.uid && gameState.player2Id !== "CPU") {
       toast({ title: "Not your turn", description: "It's Player 2's turn.", variant: "default" });
      return;
    }
     if (gameState.currentPlayer === 2 && gameState.player2Id === "CPU" && gameState.player1Id !== user.uid) {
      // This case means P1 is trying to move for CPU P2, which is allowed in this simplified setup.
      // If strict turn enforcement for P1 vs CPU is needed, this condition would change.
    }


    setIsLoading(true);
    setError(null);

    const validationInput: ValidateMoveInput = {
      boardState: gameState.board,
      player: gameState.currentPlayer,
      pitIndex: pitIndex,
    };

    try {
      const validationResult = await validateMove(validationInput);

      if (validationResult.isValid) {
        const newState = processMove(gameState, pitIndex);
        const gameRef = doc(db, "games", gameState.id);
        await setDoc(gameRef, { ...newState, updatedAt: serverTimestamp() });
        // Toast will be shown by GameMessages component based on lastMoveMessage
      } else {
        toast({ title: "Invalid Move", description: validationResult.reason || "This move is not allowed by the rules.", variant: "destructive" });
      }
    } catch (e) {
      console.error("Error processing move:", e);
      setError("An error occurred while making the move.");
      toast({ title: "Error", description: "Could not process move.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetGame = async () => {
    if (!db || !gameState || !user) return;
    setIsLoading(true);
    try {
      const initialGameState = getInitialGameState(user.uid, gameState.id);
      const gameDataWithTimestamps = {
        ...initialGameState,
        playerNames: gameState.playerNames, // Keep original player names if set
        player1Id: gameState.player1Id,
        player2Id: gameState.player2Id,
        createdAt: gameState.createdAt, // Keep original creation time
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "games", gameState.id), gameDataWithTimestamps);
      toast({ title: "Game Reset", description: "The game has been reset." });
    } catch (e) {
      console.error("Error resetting game:", e);
      toast({ title: "Error", description: "Failed to reset game.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  if (!user) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /> <span className="ml-2">Authenticating...</span></div>;
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-8 min-h-screen">
      <h1 className="text-4xl md:text-5xl font-headline text-primary mb-6 text-center">Pebble Pits</h1>
      
      {isLoading && !gameState && <div className="flex items-center justify-center my-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /> <span className="ml-2">Loading Game...</span></div>}

      {gameState ? (
        <>
          <PlayerStats gameState={gameState} />
          <GameMessages gameState={gameState} error={error} />
          <div className="my-6 w-full max-w-3xl">
            <AjuaBoard gameState={gameState} userId={user.uid} onPitClick={handlePitClick} isLoading={isLoading} />
          </div>
           <div className="mt-4 flex gap-4">
            <Button onClick={handleResetGame} variant="outline" disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Current Game
            </Button>
            <Button onClick={() => { setGameId(null); setGameState(null); }} variant="secondary" disabled={isLoading}>
              <Play className="mr-2 h-4 w-4" /> Start New Game Session
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-8 text-center">
          {!isLoading && <p className="mb-4 text-lg text-muted-foreground">{error || "No active game. Create one to start!"}</p>}
          <Button onClick={handleCreateGame} size="lg" disabled={isLoading || !user}>
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
            Create New Game
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameContainer;
