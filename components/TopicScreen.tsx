
import React, { useState, useEffect } from 'react';

interface TopicScreenProps {
  numTopics: number;
  onComplete: (topics: string[]) => void;
  onBack: () => void;
}

const TopicScreen: React.FC<TopicScreenProps> = ({ numTopics, onComplete, onBack }) => {
  const defaultTopics = ['History', 'Science', 'Cinema', 'Literature', 'Geography', 'Sports'];
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    setTopics(defaultTopics.slice(0, numTopics));
  }, [numTopics]);

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleGenerate = () => {
    if (topics.some(t => !t.trim())) return;
    onComplete(topics);
  };

  return (
    <div className="max-w-md w-full mx-auto p-10 glass-panel rounded-3xl shadow-2xl animate-fade-in border border-white/10">
      <h2 className="text-xl font-extrabold text-white mb-2 text-center tracking-[0.2em] uppercase">
        Categories
      </h2>
      <p className="text-gray-500 text-[10px] mb-10 text-center uppercase tracking-widest font-bold">
        Define {numTopics} distinct domains
      </p>

      <div className="space-y-4 mb-12 max-h-[380px] overflow-y-auto pr-3 custom-scrollbar">
        {topics.map((topic, i) => (
          <div key={i} className="relative">
            <label className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#C0C0C0]/50 pointer-events-none">
              {String(i + 1).padStart(2, '0')}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => handleTopicChange(i, e.target.value)}
              placeholder="Category Name"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#C0C0C0] transition-all placeholder:text-gray-700"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-4 text-[10px] font-bold text-gray-500 border border-white/10 rounded-xl hover:bg-white/5 transition-all uppercase tracking-widest"
        >
          Previous
        </button>
        <button
          onClick={handleGenerate}
          className="flex-[2] py-4 bg-[#C0C0C0] text-black rounded-xl font-black text-[10px] hover:scale-[1.02] shadow-[0_10px_30px_rgba(192,192,192,0.2)] transition-all uppercase tracking-widest"
        >
          Generate Clues
        </button>
      </div>
    </div>
  );
};

export default TopicScreen;
