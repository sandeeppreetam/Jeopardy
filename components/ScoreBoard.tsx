
import React from 'react';
import { Player } from '../types';

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ players, currentPlayerIndex }) => {
  return (
    <div className="flex flex-wrap justify-center gap-6 py-8 px-4 mb-8">
      {players.map((player, index) => (
        <div 
          key={player.id}
          className={`relative min-w-[200px] p-5 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center ${
            currentPlayerIndex === index 
            ? 'bg-white/5 shadow-2xl scale-105' 
            : 'bg-transparent border-white/5 opacity-40'
          }`}
          style={{ 
            borderColor: currentPlayerIndex === index ? player.color : 'rgba(255,255,255,0.05)',
            boxShadow: currentPlayerIndex === index ? `0 0 30px ${player.color}26` : 'none'
          }}
        >
          {currentPlayerIndex === index && (
            <div 
              className="absolute -top-2 text-black text-[8px] px-3 py-0.5 rounded-full font-black uppercase tracking-tighter"
              style={{ backgroundColor: player.color }}
            >
              ACTIVE
            </div>
          )}
          
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
            {player.name}
          </span>
          <span className={`text-2xl font-black tracking-tighter mb-3 ${
            player.score >= 0 ? 'text-white' : 'text-red-500'
          }`}>
            {player.score >= 0 ? player.score : `-${Math.abs(player.score)}`}
          </span>

          <div className="flex gap-2 w-full border-t border-white/5 pt-3 mt-auto">
            <div className="flex-1 flex flex-col items-center">
              <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Hits</span>
              <span className="text-[10px] font-black text-emerald-500">{player.correctCount}</span>
            </div>
            <div className="flex-1 flex flex-col items-center border-l border-white/5">
              <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Miss</span>
              <span className="text-[10px] font-black text-rose-500">{player.wrongCount}</span>
            </div>
            <div className="flex-1 flex flex-col items-center border-l border-white/5">
              <span className="text-[7px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Pass</span>
              <span className="text-[10px] font-black text-gray-500">{player.passCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScoreBoard;