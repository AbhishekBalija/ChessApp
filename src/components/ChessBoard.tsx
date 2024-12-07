import React, { useCallback, useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useChessGame } from '../context/ChessGameContext';
import { CHESS_BOTS } from '../types/chess';
import { getBestMove } from '../utils/chessEngine';

export function ChessBoard() {
  const { game, gameState, playerColor, selectedBotIndex, makeMove } = useChessGame();
  const [computerThinking, setComputerThinking] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);

  const isPlayerTurn = gameState.turn === playerColor;

  const makeComputerMove = useCallback(async () => {
    if (gameState.isGameOver || computerThinking) return;

    setComputerThinking(true);
    
    try {
      const bot = CHESS_BOTS[selectedBotIndex];
      const thinkingTime = Math.max(500, Math.min(2000, bot.elo / 2));
      await new Promise(resolve => setTimeout(resolve, thinkingTime));

      const bestMove = getBestMove(game, Math.floor(bot.elo / 400), bot.elo);
      
      if (bestMove) {
        const moveObject = {
          from: bestMove.from,
          to: bestMove.to,
          promotion: bestMove.promotion || undefined
        };
        makeMove(moveObject);
      }
    } catch (error) {
      console.error('Error making computer move:', error);
    } finally {
      setComputerThinking(false);
    }
  }, [game, gameState.isGameOver, makeMove, computerThinking, selectedBotIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPlayerTurn && !gameState.isGameOver && !computerThinking) {
        makeComputerMove();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [gameState.turn, isPlayerTurn, makeComputerMove, gameState.isGameOver, computerThinking]);

  const onSquareClick = (square: Square) => {
    if (!isPlayerTurn || computerThinking || gameState.isGameOver) {
      return;
    }

    const piece = game.get(square);
    
    if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
      setSelectedSquare(square);
      setLegalMoves(
        game.moves({ 
          square, 
          verbose: true 
        }).map(move => move.to as Square)
      );
      return;
    }

    if (selectedSquare) {
      const moveObject = {
        from: selectedSquare,
        to: square,
        promotion: 'q'
      };

      try {
        const validMove = game.move(moveObject);
        game.undo(); // Undo the test move
        
        if (validMove) {
          makeMove(moveObject);
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      } catch (error) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const customSquareStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
    }

    legalMoves.forEach(square => {
      styles[square] = {
        backgroundColor: 'rgba(0, 255, 0, 0.2)'
      };
    });

    return styles;
  };

  return (
    <div className="w-full max-w-[600px] aspect-square relative">
      {computerThinking && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm z-10">
          Thinking...
        </div>
      )}
      <Chessboard
        position={gameState.fen}
        boardOrientation={playerColor}
        onSquareClick={onSquareClick}
        customSquareStyles={customSquareStyles()}
        areArrowsAllowed={true}
      />
    </div>
  );
}