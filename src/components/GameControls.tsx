import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';
import { useChessGame } from '../context/ChessGameContext';
import { BotSelector } from './BotSelector';
import { MoveHistory } from './MoveHistory';
import type { PlayerColor } from '../types/chess';

export function GameControls() {
  const { 
    resetGame, 
    playerColor, 
    setPlayerColor, 
    gameState,
    selectedBotIndex,
    setSelectedBotIndex
  } = useChessGame();

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlayerColor(e.target.value as PlayerColor);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xs">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Play As
        </label>
        <select
          value={playerColor}
          onChange={handleColorChange}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
        <ChevronDown className="absolute right-3 top-[60%] transform -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      <BotSelector
        selectedBotIndex={selectedBotIndex}
        onBotSelect={setSelectedBotIndex}
      />

      <button
        onClick={resetGame}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <RotateCcw size={18} />
        Restart Game
      </button>

      {gameState.result && (
        <div className="text-center p-4 bg-gray-100 rounded-lg font-semibold">
          {gameState.result}
        </div>
      )}

      <MoveHistory />
    </div>
  );
}