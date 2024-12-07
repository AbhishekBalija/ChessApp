import { Chess, Move, Square } from 'chess.js';
import { evaluatePosition } from './evaluator';
import { getCachedEvaluation, cacheEvaluation } from './moveCache';
import { getOpeningMove } from './openings';

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

export function getBestMove(game: Chess, maxDepth: number = 3, elo: number = 1200): Move | null {
  console.log('Engine thinking...', { maxDepth, elo });
  
  const moveCount = game.moveNumber();
  const isEndgame = isEndgamePhase(game);
  
  // Higher rated bots use deeper search and better opening knowledge
  if (elo >= 2000) {
    if (moveCount <= 20) {
      const openingMove = getOpeningMove(game);
      if (openingMove) {
        console.log('Playing opening move:', openingMove);
        return openingMove;
      }
    }
    maxDepth = Math.min(6 + (isEndgame ? 2 : 0), 8);
  } else if (elo >= 1800) {
    if (moveCount <= 15) {
      const openingMove = getOpeningMove(game);
      if (openingMove) return openingMove;
    }
    maxDepth = Math.min(5 + (isEndgame ? 1 : 0), 6);
  } else {
    if (moveCount <= 10) {
      const openingMove = getOpeningMove(game);
      if (openingMove) return openingMove;
    }
    maxDepth = Math.min(4 + (isEndgame ? 1 : 0), 5);
  }

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) {
    console.log('No legal moves available');
    return null;
  }

  console.log('Legal moves:', moves.length);

  const startTime = Date.now();
  const timeLimit = elo >= 2000 ? 5000 : (elo >= 1800 ? 3000 : 2000);
  
  let bestMove = null;
  let bestScore = -Infinity;

  // Search for best move
  for (const move of moves) {
    game.move(move);
    
    const score = -negamax(
      game,
      maxDepth - 1,
      -Infinity,
      Infinity,
      false,
      elo,
      startTime,
      timeLimit
    );

    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // Safety check for higher rated bots
  if (elo >= 1800 && bestMove) {
    game.move(bestMove);
    const isSafe = !isPositionLoss(game, -200);
    game.undo();

    if (!isSafe) {
      const safeMoves = moves.filter(move => {
        game.move(move);
        const safe = !isPositionLoss(game, -200);
        game.undo();
        return safe;
      });

      if (safeMoves.length > 0) {
        bestMove = safeMoves[0];
      }
    }
  }

  console.log('Selected move:', bestMove);
  return bestMove || moves[0];
}

function negamax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  elo: number,
  startTime: number,
  timeLimit: number
): number {
  if (Date.now() - startTime > timeLimit) {
    return evaluatePosition(game);
  }

  if (depth === 0 || game.isGameOver()) {
    return quiescenceSearch(game, alpha, beta, isMaximizing, elo, 4);
  }

  const moves = orderMoves(game, game.moves({ verbose: true }), elo);
  let bestScore = -Infinity;

  for (const move of moves) {
    game.move(move);
    const score = -negamax(
      game,
      depth - 1,
      -beta,
      -alpha,
      !isMaximizing,
      elo,
      startTime,
      timeLimit
    );
    game.undo();

    bestScore = Math.max(bestScore, score);
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }

  return bestScore;
}

function quiescenceSearch(
  game: Chess,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  elo: number,
  depth: number
): number {
  const standPat = evaluatePosition(game);
  
  if (depth === 0) return standPat;
  
  if (standPat >= beta) return beta;
  alpha = Math.max(alpha, standPat);

  const moves = game.moves({ verbose: true }).filter(move => 
    move.captured || move.promotion || move.san.includes('+')
  );

  for (const move of moves) {
    game.move(move);
    const score = -quiescenceSearch(
      game,
      -beta,
      -alpha,
      !isMaximizing,
      elo,
      depth - 1
    );
    game.undo();

    if (score >= beta) return beta;
    alpha = Math.max(alpha, score);
  }

  return alpha;
}

function orderMoves(game: Chess, moves: Move[], elo: number): Move[] {
  return moves.sort((a, b) => {
    const scoreA = getMoveScore(game, a, elo);
    const scoreB = getMoveScore(game, b, elo);
    return scoreB - scoreA;
  });
}

function getMoveScore(game: Chess, move: Move, elo: number): number {
  let score = 0;
  
  if (move.captured) {
    score += PIECE_VALUES[move.captured] - PIECE_VALUES[move.piece]/10;
  }
  
  if (move.promotion) {
    score += PIECE_VALUES[move.promotion];
  }
  
  if (elo >= 2000) {
    const centralSquares = ['e4', 'd4', 'e5', 'd5'];
    if (centralSquares.includes(move.to)) score += 30;
    
    if (move.piece === 'n' || move.piece === 'b') {
      if (move.from[1] === '1' || move.from[1] === '8') score += 25;
    }
    
    if (move.san === 'O-O' || move.san === 'O-O-O') score += 40;
    
    if (move.piece === 'p') {
      if (move.to[1] === '4' || move.to[1] === '5') score += 15;
      if (isPawnChain(game, move)) score += 20;
    }
  }

  return score;
}

function isPawnChain(game: Chess, move: Move): boolean {
  const file = move.to[0];
  const rank = parseInt(move.to[1]);
  const adjacentFiles = [
    String.fromCharCode(file.charCodeAt(0) - 1),
    String.fromCharCode(file.charCodeAt(0) + 1)
  ];
  
  return adjacentFiles.some(adjFile => {
    const square = `${adjFile}${rank - 1}` as Square;
    const piece = game.get(square);
    return piece && piece.type === 'p' && piece.color === game.turn();
  });
}

function isEndgamePhase(game: Chess): boolean {
  const board = game.board();
  let pieceCount = 0;
  let queens = 0;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        pieceCount++;
        if (piece.type === 'q') queens++;
      }
    }
  }

  return pieceCount <= 12 || (queens === 0 && pieceCount <= 14);
}

function isPositionLoss(game: Chess, threshold: number): boolean {
  const score = evaluatePosition(game);
  return score < threshold;
}