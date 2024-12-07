import React from 'react';
import { useChessGame } from '../context/ChessGameContext';
import { getOpeningName } from '../utils/openings';

export function MoveHistory() {
  const { gameState } = useChessGame();
  const openingName = getOpeningName(gameState.moves);

  const pairMoves = (moves: string[]): [string, string?][] => {
    const pairs: [string, string?][] = [];
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push([moves[i], moves[i + 1]]);
    }
    return pairs;
  };

  const moveHistory = pairMoves(gameState.moves);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-h-[400px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3">Move History</h3>
      {openingName && (
        <div className="text-sm text-gray-600 mb-2 italic">
          {openingName}
        </div>
      )}
      <div className="space-y-1">
        {moveHistory.map((pair, index) => (
          <div key={index} className="flex text-sm">
            <span className="w-8 text-gray-500">{index + 1}.</span>
            <span className="w-20">{pair[0]}</span>
            {pair[1] && <span className="w-20">{pair[1]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}