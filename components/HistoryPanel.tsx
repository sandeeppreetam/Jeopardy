
import React, { useState } from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full lg:w-80 glass-panel rounded-3xl flex flex-col h-[400px] lg:h-[650px] overflow-hidden animate-fade-in border border-white/10 shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">
          History
        </h3>
        <span className="text-[8px] border border-white/10 text-gray-500 px-2 py-0.5 rounded-full font-black">
          {history.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-700 italic text-[10px] text-center px-6 uppercase tracking-widest font-bold opacity-30">
            Awaiting Action
          </div>
        ) : (
          [...history].reverse().map((item) => {
            const isExpanded = expandedId === item.id;
            const resultColor = 
              item.result === 'correct' ? '#10b981' : 
              item.result === 'wrong' ? '#ef4444' : 
              '#4b5563';

            const pointsDisplay = item.points > 0 ? `+${item.points}` : item.points < 0 ? `-${Math.abs(item.points)}` : '0';
            const displayColor = item.result === 'correct' ? item.playerColor : (item.result === 'wrong' || item.points < 0 ? '#ef4444' : '#4b5563');

            return (
              <div 
                key={item.id} 
                onClick={() => toggleExpand(item.id)}
                className={`p-4 bg-white/5 rounded-2xl border transition-all cursor-pointer animate-in slide-in-from-right-4 hover:bg-white/10 ${
                  isExpanded ? 'border-white/20 scale-[1.02] shadow-lg' : 'border-white/5'
                }`}
                style={{ 
                  borderLeft: `4px solid ${isExpanded ? item.playerColor : 'transparent'}`
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="font-black text-white text-[10px] uppercase tracking-tighter truncate max-w-[120px]">
                      {item.playerName}
                    </span>
                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest truncate">
                      {item.topicTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black block" style={{ color: displayColor }}>
                      {pointsDisplay}
                    </span>
                    <span 
                      className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm mt-1 inline-block"
                      style={{ backgroundColor: `${resultColor}22`, color: resultColor }}
                    >
                      {item.result}
                    </span>
                  </div>
                </div>

                {item.speedBonus && !isExpanded && (
                  <div className="text-[7px] text-emerald-500 font-black uppercase tracking-tighter mt-1">
                    <i className="fas fa-bolt mr-1"></i> Speed Bonus Applied
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <span className="block text-[7px] text-gray-600 font-black uppercase tracking-[0.3em] mb-1">Clue</span>
                      <p className="text-[10px] text-gray-300 leading-relaxed italic">"{item.questionText}"</p>
                    </div>
                    <div>
                      <span className="block text-[7px] text-gray-600 font-black uppercase tracking-[0.3em] mb-1">Solution</span>
                      <p className="text-[10px] font-black" style={{ color: item.playerColor }}>{item.answerText}</p>
                    </div>
                    {item.speedBonus && (
                      <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 text-[8px] font-black uppercase tracking-widest text-center">
                        Speed Bonus Protocol Confirmed (+ 15)
                      </div>
                    )}
                  </div>
                )}
                
                {!isExpanded && (
                  <div className="flex justify-center mt-2 opacity-20 group-hover:opacity-40 transition-opacity">
                    <i className="fas fa-chevron-down text-[8px]"></i>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;