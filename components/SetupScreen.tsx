import React, { useState } from 'react';
import { Player, GameSettings, GameMode } from '../types';
import InstructionsModal from './InstructionsModal';

interface SetupScreenProps {
  onComplete: (players: Player[], settings: GameSettings) => void;
}

const PLAYER_COLORS = [
  '#40E0D0', // Turquoise
  '#FF8C00', // Orange
  '#FF69B4', // Hot Pink
  '#FFFF00', // Yellow
  '#BF00FF', // Purple
  '#FF1493'  // Deep Pink
];

const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [showInstructions, setShowInstructions] = useState(false);
  const [names, setNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6']);
  const [settings, setSettings] = useState<GameSettings>({
    numTopics: 4,
    numQuestionsPerTopic: 4,
    timerSeconds: 30,
    gameMode: 'basic'
  });

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleStart = () => {
    const selectedPlayers: Player[] = names.slice(0, playerCount).map((name, i) => ({
      id: `p-${i}`,
      name: name || `Player ${i + 1}`,
      score: 0,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      correctCount: 0,
      wrongCount: 0,
      passCount: 0,
      lifelines: {
        freezeUsed: false,
        hintUsed: false,
        doubleUsed: false
      }
    }));
    onComplete(selectedPlayers, settings);
  };

  return (
    <div className="max-w-3xl w-full mx-auto p-10 glass-panel rounded-3xl shadow-2xl animate-fade-in flex flex-col md:flex-row gap-12 relative">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h2 className="text-xl font-extrabold text-white tracking-[0.2em] uppercase">
            Players
          </h2>
          <button 
            onClick={() => setShowInstructions(true)}
            className="text-[10px] font-black text-[#C0C0C0] uppercase tracking-widest hover:text-white transition-colors"
          >
            <i className="fas fa-question-circle mr-1"></i> How to Play
          </button>
        </div>
        
        <div className="mb-8">
          <label className="block text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-[0.15em]">Number of Challengers</label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                onClick={() => setPlayerCount(num)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm border ${
                  playerCount === num 
                  ? 'bg-[#C0C0C0] border-[#C0C0C0] text-black shadow-[0_0_20px_rgba(192,192,192,0.3)]' 
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-gray-500'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-3 custom-scrollbar">
          {Array.from({ length: playerCount }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center group">
              <div 
                className="w-1.5 h-10 rounded-full shrink-0" 
                style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
              />
              <input
                type="text"
                value={names[i]}
                onChange={(e) => handleNameChange(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C0C0C0] transition-all placeholder:text-gray-600"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12">
        <h2 className="text-xl font-extrabold text-white mb-8 tracking-[0.2em] uppercase border-b border-white/10 pb-4">
          Settings
        </h2>

        <div className="space-y-8">
          {/* Game Mode Selector */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Game Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSettings({...settings, gameMode: 'basic'})}
                className={`py-4 px-4 rounded-xl font-bold transition-all text-xs border ${
                  settings.gameMode === 'basic'
                  ? 'bg-[#C0C0C0] border-[#C0C0C0] text-black shadow-[0_0_20px_rgba(192,192,192,0.3)]' 
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="mb-1">
                  <i className="fas fa-play-circle"></i> BASIC
                </div>
                <div className="text-[8px] font-normal opacity-70">
                  Simple gameplay
                </div>
              </button>
              <button
                onClick={() => setSettings({...settings, gameMode: 'advanced'})}
                className={`py-4 px-4 rounded-xl font-bold transition-all text-xs border ${
                  settings.gameMode === 'advanced'
                  ? 'bg-[#C0C0C0] border-[#C0C0C0] text-black shadow-[0_0_20px_rgba(192,192,192,0.3)]' 
                  : 'bg-transparent border-white/10 text-gray-400 hover:border-gray-500'
                }`}
              >
                <div className="mb-1">
                  <i className="fas fa-bolt"></i> ADVANCED
                </div>
                <div className="text-[8px] font-normal opacity-70">
                  Power-ups & bonuses
                </div>
              </button>
            </div>
            {/* Mode description */}
            <div className="text-[9px] text-gray-600 leading-relaxed p-3 bg-white/5 rounded-lg border border-white/5">
              {settings.gameMode === 'basic' ? (
                <>
                  <div className="font-bold text-gray-500 mb-1">BASIC MODE:</div>
                  Standard Jeopardy gameplay without time bonuses or power-ups.
                </>
              ) : (
                <>
                  <div className="font-bold text-gray-500 mb-1">ADVANCED MODE:</div>
                  Includes speed bonuses, freeze time, hints, and double stakes power-ups.
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Categories</label>
              <span className="text-xs font-black text-[#C0C0C0]">{settings.numTopics}</span>
            </div>
            <input 
              type="range" min="3" max="6" step="1" 
              value={settings.numTopics}
              onChange={(e) => setSettings({...settings, numTopics: parseInt(e.target.value)})}
              className="w-full accent-[#C0C0C0] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Questions per category</label>
              <span className="text-xs font-black text-[#C0C0C0]">{settings.numQuestionsPerTopic}</span>
            </div>
            <input 
              type="range" min="3" max="5" step="1" 
              value={settings.numQuestionsPerTopic}
              onChange={(e) => setSettings({...settings, numQuestionsPerTopic: parseInt(e.target.value)})}
              className="w-full accent-[#C0C0C0] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em]">Time per question</label>
              <span className="text-xs font-black text-[#C0C0C0]">{settings.timerSeconds}s</span>
            </div>
            <input 
              type="range" min="15" max="60" step="5" 
              value={settings.timerSeconds}
              onChange={(e) => setSettings({...settings, timerSeconds: parseInt(e.target.value)})}
              className="w-full accent-[#C0C0C0] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full mt-12 py-5 bg-gradient-to-br from-[#C0C0C0] to-[#808080] text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_-10px_rgba(192,192,192,0.4)] transition-all"
        >
          Start Game
        </button>
      </div>

      {showInstructions && <InstructionsModal onClose={() => setShowInstructions(false)} />}
    </div>
  );
};

export default SetupScreen;