
import React from 'react';
import { Player } from '../types';

interface GameOverScreenProps {
  players: Player[];
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ players, onRestart }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="max-w-lg w-full mx-auto p-10 glass-panel rounded-3xl shadow-2xl animate-in zoom-in duration-500 text-center">
      <div className="mb-10">
        <i className="fas fa-trophy text-6xl mb-6" style={{ color: winner.color }}></i>
        <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-2">Operation Complete</h2>
        <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">Final Tally Finalized</p>
      </div>

      <div className="mb-12 space-y-4">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id}
            className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
              index === 0 
              ? 'bg-white/5 scale-105 shadow-xl' 
              : 'bg-black/20 border-white/5'
            }`}
            style={{ 
              borderColor: index === 0 ? player.color : 'rgba(255,255,255,0.05)',
              boxShadow: index === 0 ? `0 0 40px ${player.color}1a` : 'none'
            }}
          >
            <div className="flex items-center gap-4">
              <span className={`text-xl font-black w-8`} style={{ color: index === 0 ? player.color : '#374151' }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col text-left">
                <span className={`font-black text-xs uppercase tracking-wider ${index === 0 ? 'text-white' : 'text-gray-500'}`}>
                  {player.name}
                  {index === 0 && <i className="fas fa-crown ml-2" style={{ color: player.color }}></i>}
                </span>
              </div>
            </div>
            <span className={`text-xl font-black tracking-tighter ${player.score >= 0 ? 'text-white' : 'text-red-500'}`}>
              {player.score}
            </span>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-3xl mb-12 border border-white/5 bg-white/5" style={{ borderColor: `${winner.color}33` }}>
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mb-2">Grand Champion</p>
        <p className="text-3xl font-black mb-2" style={{ color: winner.color }}>{winner.name}</p>
        <p className="text-white text-xs font-bold tracking-widest uppercase">Total Yield: {winner.score}</p>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] shadow-xl transition-all"
      >
        Initiate New Session
      </button>
    </div>
  );
};

export default GameOverScreen;