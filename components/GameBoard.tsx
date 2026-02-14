
import React from 'react';
import { Topic, Question } from '../types';

interface GameBoardProps {
  topics: Topic[];
  onSelectQuestion: (topicIndex: number, questionIndex: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ topics, onSelectQuestion }) => {
  if (topics.length === 0) return null;

  const numQuestions = topics[0].questions.length;
  const pointLevels = Array.from({ length: numQuestions }, (_, i) => (i + 1) * 50);

  return (
    <div 
      className="grid gap-6 max-w-7xl mx-auto w-full px-4"
      style={{ gridTemplateColumns: `repeat(${topics.length}, minmax(140px, 1fr))` }}
    >
      {topics.map((topic) => (
        <div 
          key={topic.id} 
          className="text-white font-extrabold px-3 py-4 rounded-xl text-center flex items-center justify-center h-20 uppercase tracking-[0.15em] text-[10px] border border-white/10 bg-white/5 shadow-lg"
        >
          {topic.title}
        </div>
      ))}

      {pointLevels.map((points, rowIndex) => (
        <React.Fragment key={`row-${points}`}>
          {topics.map((topic, colIndex) => {
            const question = topic.questions[rowIndex];
            return (
              <button
                key={question.id}
                disabled={question.isAnswered}
                onClick={() => onSelectQuestion(colIndex, rowIndex)}
                className={`
                  h-24 md:h-32 flex flex-col items-center justify-center rounded-2xl shadow-xl border jeopardy-tile
                  ${question.isAnswered 
                    ? 'bg-black/40 text-transparent border-transparent cursor-not-allowed grayscale' 
                    : 'bg-white/5 text-[#C0C0C0] border-white/10'
                  }
                `}
              >
                {!question.isAnswered ? (
                  <>
                    <span className="text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-widest">T-{rowIndex+1}</span>
                    <span className="text-2xl md:text-3xl font-black tracking-tighter">{points}</span>
                  </>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C0C0C0]/20" />
                )}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default GameBoard;