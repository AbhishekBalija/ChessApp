import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { PlayerColor, GameState } from '../types/chess';

interface ChessGameContextType {
  game: Chess;
  gameState: GameState;
  playerColor: PlayerColor;
  selectedBotIndex: number;
  setPlayerColor: (color: PlayerColor) => void;
  setSelectedBotIndex: (index: number) => void;
  makeMove: (move: any) => void;
  resetGame: () => void;
}

const ChessGameContext = createContext<ChessGameContextType | undefined>(undefined);

export function ChessGameProvider({ children }: { children: React.ReactNode }) {
  const [game] = useState(new Chess());
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [selectedBotIndex, setSelectedBotIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    fen: game.fen(),
    isGameOver: false,
    result: null,
    turn: 'white',
    moves: [],
  });

  const updateGameState = useCallback(() => {
    const history = game.history();
    setGameState({
      fen: game.fen(),
      isGameOver: game.isGameOver(),
      result: game.isCheckmate() ? `${game.turn() === 'w' ? 'Black' : 'White'} wins!` :
             game.isDraw() ? 'Draw!' : null,
      turn: game.turn() === 'w' ? 'white' : 'black',
      moves: history,
    });
  }, [game]);

  const makeMove = useCallback((move: any) => {
    try {
      game.move(move);
      updateGameState();
    } catch (error) {
      console.error('Invalid move:', error);
    }
  }, [game, updateGameState]);

  const resetGame = useCallback(() => {
    game.reset();
    updateGameState();
  }, [game, updateGameState]);

  // Prevent automatic moves on game start
  useEffect(() => {
    updateGameState();
  }, [updateGameState]);

  return (
    <ChessGameContext.Provider
      value={{
        game,
        gameState,
        playerColor,
        selectedBotIndex,
        setPlayerColor,
        setSelectedBotIndex,
        makeMove,
        resetGame,
      }}
    >
      {children}
    </ChessGameContext.Provider>
  );
}

export function useChessGame() {
  const context = useContext(ChessGameContext);
  if (!context) {
    throw new Error('useChessGame must be used within a ChessGameProvider');
  }
  return context;
}