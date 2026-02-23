import React, { useState, useEffect } from 'react';

interface TopicScreenProps {
  numTopics: number;
  onComplete: (topics: string[]) => void;
  onBack: () => void;
}

const ALL_CATEGORIES = [
  'Ancient Civilizations', 'Space Exploration', 'World Cuisine', 'Jazz Music', 'Olympic History',
  'Famous Inventors', 'Mythology', 'Classic Literature', 'Marine Biology', 'Architecture',
  'World Wars', 'Philosophy', 'Fashion History', 'Astronomy', 'Economics',
  'Famous Artists', 'Folklore', 'Chemistry', 'Psychology', 'Political Revolutions',
  'Endangered Species', 'Video Games', 'Famous Speeches', 'Volcanoes', 'Theatre',
  'Cryptography', 'Renaissance Art', 'World Religions', 'Neuroscience', 'Jazz Standards',
  'Cold War', 'Photography', 'African History', 'Linguistics', 'Formula 1',
  'Nobel Prizes', 'Fairy Tales', 'Quantum Physics', 'Archaeology', 'Dance Styles',
  'Horror Films', 'Botany', 'The Roman Empire', 'Impressionism', 'Cartography',
  'Martial Arts', 'Opera', 'Genetics', 'Comic Books', 'Culinary Chemistry',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TopicScreen: React.FC<TopicScreenProps> = ({ numTopics, onComplete, onBack }) => {
  const defaultTopics = ['History', 'Science', 'Cinema', 'Literature', 'Geography', 'Sports'];
  const [topics, setTopics] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    setTopics(defaultTopics.slice(0, numTopics));
  }, [numTopics]);

  useEffect(() => {
    setRecommendations(shuffle(ALL_CATEGORIES).slice(0, numTopics));
  }, [numTopics]);

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleRecommendClick = (rec: string) => {
    // Fill the first empty slot, or the last slot if all filled
    const emptyIndex = topics.findIndex(t => !t.trim());
    const targetIndex = emptyIndex !== -1 ? emptyIndex : topics.length - 1;
    const newTopics = [...topics];
    newTopics[targetIndex] = rec;
    setTopics(newTopics);
  };

  const handleRandomize = () => {
    // Exclude currently used topics from recommendations
    const used = new Set(topics.map(t => t.trim().toLowerCase()));
    const available = ALL_CATEGORIES.filter(c => !used.has(c.toLowerCase()));
    setRecommendations(shuffle(available).slice(0, numTopics));
  };

  const handleGenerate = () => {
    if (topics.some(t => !t.trim())) return;
    onComplete(topics);
  };

  const allFilled = topics.every(t => t.trim());

  const handleClearAll = () => {
    setTopics(Array(numTopics).fill(''));
  };

  return (
    <div className="flex gap-6 items-start animate-fade-in">
      {/* Recommendations sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="glass-panel rounded-2xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-[#C0C0C0]/60 uppercase tracking-widest">
              Suggestions
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {recommendations.map((rec, i) => {
              const isSelected = topics.some(t => t.trim().toLowerCase() === rec.toLowerCase());
              return (
                <button
                  key={`${rec}-${i}`}
                  onClick={() => !isSelected && handleRecommendClick(rec)}
                  disabled={isSelected}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all
                    ${isSelected
                      ? 'text-[#C0C0C0]/25 bg-white/3 cursor-default line-through'
                      : 'text-[#C0C0C0]/80 hover:text-white hover:bg-white/10 cursor-pointer border border-white/8 hover:border-white/25 active:scale-[0.98]'
                    }`}
                >
                  {rec}
                </button>
              );
            })}
          </div>

          {/* Randomize button — full width, clearly labelled */}
          <button
            onClick={handleRandomize}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/8 text-[#C0C0C0]/70 hover:text-white transition-all active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"/>
              <line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/>
              <line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest">Randomize</span>
          </button>
        </div>
      </div>

      {/* Main panel */}
      <div className="max-w-md w-full mx-auto p-10 glass-panel rounded-3xl shadow-2xl border border-white/10">
        <h2 className="text-xl font-extrabold text-white mb-2 text-center tracking-[0.2em] uppercase">
          Categories
        </h2>
        <p className="text-gray-500 text-[10px] mb-1 text-center uppercase tracking-widest font-bold">
          Define {numTopics} distinct domains
        </p>
        <p className="text-gray-600 text-[9px] mb-8 text-center">
          Type your own or pick from the suggestions →
        </p>

        <div className="space-y-4 mb-6 max-h-[380px] overflow-y-auto pr-3 custom-scrollbar">
          {topics.map((topic, i) => (
            <div key={i} className="relative">
              <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#C0C0C0]/50 pointer-events-none">
                {String(i + 1).padStart(2, '0')}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => handleTopicChange(i, e.target.value)}
                placeholder="Type any category…"
                className="w-full pl-12 pr-9 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C0C0C0] transition-all placeholder:text-gray-700"
              />
              {topic.trim() && (
                <button
                  onClick={() => handleTopicChange(i, '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Clear all */}
        {topics.some(t => t.trim()) && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleClearAll}
              className="text-[9px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 py-4 text-[10px] font-bold text-gray-500 border border-white/10 rounded-xl hover:bg-white/5 transition-all uppercase tracking-widest"
          >
            Previous
          </button>
          <button
            onClick={handleGenerate}
            disabled={!allFilled}
            className={`flex-[2] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
              ${allFilled
                ? 'bg-[#C0C0C0] text-black hover:scale-[1.02] shadow-[0_10px_30px_rgba(192,192,192,0.2)]'
                : 'bg-white/10 text-gray-600 cursor-not-allowed'
              }`}
          >
            Generate Clues
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicScreen;