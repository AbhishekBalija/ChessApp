import { Chess } from 'chess.js';
import { PIECE_VALUES, PIECE_SQUARE_TABLES } from './tables';

export function evaluatePosition(game: Chess): number {
  let score = 0;
  const board = game.board();

  // Quick evaluation for terminal positions
  if (game.isCheckmate()) return game.turn() === 'w' ? -Infinity : Infinity;
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) return 0;

  // Material and position evaluation
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type.toLowerCase() as keyof typeof PIECE_VALUES];
        const positionValue = PIECE_SQUARE_TABLES[piece.type.toLowerCase() as keyof typeof PIECE_SQUARE_TABLES]
          [piece.color === 'w' ? i : 7 - i][j];
        score += (piece.color === 'w' ? 1 : -1) * (pieceValue + positionValue);
      }
    }
  }

  // Quick mobility evaluation (simplified)
  score += (game.moves().length * (game.turn() === 'w' ? 1 : -1) * 5);
  
  return score;
}