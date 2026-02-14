
import React, { useState, useEffect } from 'react';
import { Question, Player } from '../types';
import { getQuestionHint } from '../services/geminiService';

interface QuestionModalProps {
  question: Question;
  currentPlayer: Player;
  timerSeconds: number;
  onCorrect: (points: number, isSpeedBonus: boolean) => void;
  onWrong: (points: number) => void;
  onPass: (points: number) => void;
  onLifelineUsed: (type: 'freeze' | 'hint' | 'double') => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ 
  question, 
  currentPlayer, 
  timerSeconds,
  onCorrect, 
  onWrong, 
  onPass,
  onLifelineUsed
}) => {
  const [phase, setPhase] = useState<'prepare' | 'question' | 'solution'>('prepare');
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [isFrozen, setIsFrozen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [isDoubleUsed, setIsDoubleUsed] = useState(false);

  useEffect(() => {
    if (phase !== 'question' || isFrozen) return;

    if (timeLeft <= 0) {
      setPhase('solution');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, phase, isFrozen]);

  const handleEngage = () => {
    setPhase('question');
  };

  const handleDouble = () => {
    setIsDoubleUsed(true);
    onLifelineUsed('double');
  };

  const handleFreeze = () => {
    setIsFrozen(true);
    onLifelineUsed('freeze');
  };

  const handleHint = async () => {
    setIsLoadingHint(true);
    try {
      const h = await getQuestionHint(question.question, question.answer);
      setHint(h);
      onLifelineUsed('hint');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const currentPoints = isDoubleUsed ? question.points * 2 : question.points;
  const isSpeedBonusActive = (timerSeconds - timeLeft) <= 5;

  const confirmCorrect = () => {
    const finalPoints = isSpeedBonusActive ? currentPoints + 15 : currentPoints;
    onCorrect(finalPoints, isSpeedBonusActive);
  };

  const progress = (timeLeft / timerSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-500">
      <div 
        className="max-w-3xl w-full border rounded-[2.5rem] bg-black p-10 md:p-16 relative overflow-hidden text-center"
        style={{ 
          borderColor: `${currentPlayer.color}33`,
          boxShadow: `0 0 100px ${currentPlayer.color}1a`
        }}
      >
        
        {/* Header Stats */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="text-left">
            <span className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Potential Stakes</span>
            <span className="text-2xl font-black tracking-tight" style={{ color: currentPlayer.color }}>
              {currentPoints}
              {isDoubleUsed && <span className="ml-2 text-[10px] align-middle px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded font-black">2X</span>}
            </span>
          </div>
          {phase === 'question' && (
            <div className="text-right">
              <span className="block text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Time Remaining</span>
              <span className={`text-2xl font-black tracking-tight ${isFrozen ? 'text-cyan-400' : 'text-white'}`}>
                {timeLeft}S {isFrozen && <i className="fas fa-snowflake ml-1 text-sm"></i>}
              </span>
            </div>
          )}
        </div>

        {/* Phase: Preparation */}
        {phase === 'prepare' && (
          <div className="py-12 animate-in zoom-in duration-300">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mb-8">Do you want to double the stakes?</h4>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleEngage}
                className="px-12 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl"
              >
                Reveal Question
              </button>
              {!currentPlayer.lifelines.doubleUsed && (
                <button
                  onClick={handleDouble}
                  className="px-8 py-5 border border-yellow-500/30 text-yellow-500 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-yellow-500 hover:text-black transition-all"
                >
                  <i className="fas fa-bolt mr-2"></i> Activate Double Stakes
                </button>
              )}
            </div>
          </div>
        )}

        {/* Phase: Question / Active */}
        {phase === 'question' && (
          <div className="animate-in fade-in duration-300">
            {/* Timer Progress Bar */}
            {!isFrozen && (
              <div className="absolute top-0 left-0 h-1 w-full bg-white/5">
                <div 
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%`, backgroundColor: currentPlayer.color }}
                />
              </div>
            )}

            <div className="mb-12">
              <h3 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight mb-8">
                "{question.question}"
              </h3>
              
              {hint && (
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mb-8 animate-in slide-in-from-top-4">
                  <span className="block text-[8px] text-cyan-400 font-black uppercase tracking-[0.3em] mb-2">Decrypted Hint</span>
                  <p className="text-sm italic text-cyan-100">{hint}</p>
                </div>
              )}

              {isSpeedBonusActive && (
                <div className="mb-8 inline-block px-4 py-1.5 bg-emerald-500/20 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Speed Bonus Active (+ 15)
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setPhase('solution')}
                className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all"
              >
                Reveal Solution
              </button>
              <div className="flex gap-2">
                {!currentPlayer.lifelines.freezeUsed && !isFrozen && (
                  <button onClick={handleFreeze} className="w-12 h-12 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center justify-center">
                    <i className="fas fa-snowflake"></i>
                  </button>
                )}
                {!currentPlayer.lifelines.hintUsed && !hint && (
                  <button onClick={handleHint} disabled={isLoadingHint} className="w-12 h-12 rounded-xl border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all flex items-center justify-center">
                    {isLoadingHint ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-lightbulb"></i>}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase: Solution / Evaluation */}
        {phase === 'solution' && (
          <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-700">
            <div className="py-8 border-y border-white/5">
              <span className="block text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4">Solution</span>
              <p className="text-2xl md:text-3xl font-black tracking-tight" style={{ color: currentPlayer.color }}>{question.answer}</p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-gray-600 uppercase font-black tracking-[0.3em] mb-6">Validate Challenger: <span style={{ color: currentPlayer.color }}>{currentPlayer.name}</span></span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-xl mx-auto">
                <button
                  onClick={() => onWrong(-(currentPoints / 2))}
                  className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  Incorrect
                </button>
                <button
                  onClick={() => onPass(-(currentPoints / 4))}
                  className="py-5 bg-white/5 border border-white/10 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-gray-500 transition-all flex items-center justify-center gap-2"
                >
                  <span>Pass</span>
                </button>
                <button
                  onClick={confirmCorrect}
                  className="py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <span>Correct</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;