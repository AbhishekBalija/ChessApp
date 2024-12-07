import React from 'react';
import { ChessGameProvider } from './context/ChessGameContext';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';

function App() {
  return (
    <ChessGameProvider>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            React Chess Game
          </h1>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <ChessBoard />
            <GameControls />
          </div>
        </div>
      </div>
    </ChessGameProvider>
  );
}

export default App;