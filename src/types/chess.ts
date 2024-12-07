export type PlayerColor = 'white' | 'black';

export interface GameState {
  fen: string;
  isGameOver: boolean;
  result: string | null;
  turn: PlayerColor;
  moves: string[];
}

export interface ChessBot {
  name: string;
  elo: number;
  description: string;
}

export const CHESS_BOTS: ChessBot[] = [
  {
    name: 'Rookie Bot',
    elo: 800,
    description: 'Makes basic moves, suitable for beginners',
  },
  {
    name: 'Club Player',
    elo: 1200,
    description: 'Plays like an average club player',
  },
  {
    name: 'Expert Bot',
    elo: 1800,
    description: 'Strong tactical player with solid strategy',
  },
  {
    name: 'Master Bot',
    elo: 2200,
    description: 'Plays at master level with deep calculations',
  },
];