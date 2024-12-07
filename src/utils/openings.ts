import { Chess, Move } from 'chess.js';

interface OpeningMove {
  move: string;
  weight: number;
  name?: string;
  variations?: OpeningMove[];
}

interface OpeningBook {
  [position: string]: OpeningMove[];
}

// Extended opening book with deeper variations
export const OPENINGS: OpeningBook = {
  'start': [
    { move: 'e4', weight: 45, name: 'King\'s Pawn' },
    { move: 'd4', weight: 35, name: 'Queen\'s Pawn' },
    { move: 'Nf3', weight: 10, name: 'Réti Opening' },
    { move: 'c4', weight: 10, name: 'English Opening' },
  ],
  // Ruy Lopez Line
  'e4 e5': [
    { 
      move: 'Nf3', 
      weight: 60, 
      name: 'Ruy Lopez',
      variations: [
        { move: 'Nc6', weight: 80 },
        { move: 'Bb5', weight: 90 },
        { move: 'a6', weight: 85 },
        { move: 'Ba4', weight: 80 },
        { move: 'Nf6', weight: 75 },
        { move: 'O-O', weight: 70 },
        { move: 'Be7', weight: 65 }
      ]
    }
  ],
  // Sicilian Defense Lines
  'e4 c5': [
    {
      move: 'Nf3',
      weight: 50,
      name: 'Sicilian Defense',
      variations: [
        { move: 'd6', weight: 40 },
        { move: 'Nc3', weight: 45 },
        { move: 'e6', weight: 35 },
        { move: 'd4', weight: 50 },
        { move: 'cxd4', weight: 45 },
        { move: 'Nxd4', weight: 40 },
        { move: 'Nf6', weight: 35 }
      ]
    }
  ],
  // Queen's Gambit Lines
  'd4 d5': [
    {
      move: 'c4',
      weight: 70,
      name: 'Queen\'s Gambit',
      variations: [
        { move: 'e6', weight: 40 },
        { move: 'Nf3', weight: 45 },
        { move: 'Nf6', weight: 40 },
        { move: 'Nc3', weight: 35 },
        { move: 'Be7', weight: 30 },
        { move: 'O-O', weight: 35 },
        { move: 'O-O', weight: 30 }
      ]
    }
  ],
  // King's Indian Defense
  'd4 Nf6': [
    {
      move: 'c4',
      weight: 60,
      name: 'King\'s Indian Defense',
      variations: [
        { move: 'g6', weight: 50 },
        { move: 'Nc3', weight: 45 },
        { move: 'Bg7', weight: 40 },
        { move: 'e4', weight: 35 },
        { move: 'O-O', weight: 30 },
        { move: 'Nf3', weight: 25 },
        { move: 'd6', weight: 20 }
      ]
    }
  ],
  // Add many more opening lines...
};

export function getOpeningMove(game: Chess): Move | null {
  const history = game.history();
  const positionKey = history.join(' ') || 'start';
  
  const openingMoves = OPENINGS[positionKey];
  if (!openingMoves) return null;

  // Weight-based random selection
  const totalWeight = openingMoves.reduce((sum, move) => sum + move.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const openingMove of openingMoves) {
    random -= openingMove.weight;
    if (random <= 0) {
      // Find the corresponding legal move
      const legalMoves = game.moves({ verbose: true });
      return legalMoves.find(move => 
        move.san === openingMove.move || 
        move.lan === openingMove.move
      ) || null;
    }
  }

  return null;
}

export function getOpeningName(moves: string[]): string {
  const movesStr = moves.join(' ');
  for (const [position, openingMoves] of Object.entries(OPENINGS)) {
    if (movesStr.startsWith(position) && openingMoves[0].name) {
      return openingMoves[0].name;
    }
  }
  return '';
}