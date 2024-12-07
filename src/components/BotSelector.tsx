import React from 'react';
import { ChevronDown } from 'lucide-react';
import { CHESS_BOTS } from '../types/chess';

interface BotSelectorProps {
  selectedBotIndex: number;
  onBotSelect: (index: number) => void;
}

export function BotSelector({ selectedBotIndex, onBotSelect }: BotSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Opponent
      </label>
      <div className="relative">
        <select
          value={selectedBotIndex}
          onChange={(e) => onBotSelect(Number(e.target.value))}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CHESS_BOTS.map((bot, index) => (
            <option key={index} value={index}>
              {bot.name} (ELO: {bot.elo})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {CHESS_BOTS[selectedBotIndex].description}
      </p>
    </div>
  );
}