
import React from 'react';

interface InstructionsModalProps {
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="max-w-2xl w-full glass-panel border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C0C0C0] to-transparent opacity-50" />
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Game Protocol</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Operational Guidelines</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <i className="fas fa-times text-gray-400"></i>
          </button>
        </div>

        <div className="space-y-8 custom-scrollbar max-h-[60vh] overflow-y-auto pr-4">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#C0C0C0]">01</div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Core Objective</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed pl-9">
              Navigate the data grid to extract maximum intelligence. The player with the highest total yield after all categories are cleared wins the session.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#C0C0C0]">02</div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Turn Dynamics</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed pl-9">
              Players rotate turns sequentially. On your turn, select any available clue from the grid. Point values indicate the difficulty level of the decryption.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#C0C0C0]">03</div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Scoring Algorithms</h3>
            </div>
            <ul className="space-y-3 pl-9">
              <li className="flex items-center gap-3 text-sm text-emerald-500">
                <i className="fas fa-check-circle text-[10px]"></i>
                <span><strong className="text-white">Correct:</strong> Earn full clue points + optional Speed Bonus.</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-rose-500">
                <i className="fas fa-times-circle text-[10px]"></i>
                <span><strong className="text-white">Incorrect:</strong> Deduction of 50% clue points.</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <i className="fas fa-minus-circle text-[10px]"></i>
                <span><strong className="text-white">Pass:</strong> Strategic withdrawal costs 25% clue points.</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-yellow-500/80">
                <i className="fas fa-bolt text-[10px]"></i>
                <span><strong className="text-white">Speed Bonus:</strong> Answering within 5s grants +15 bonus points.</span>
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#C0C0C0]">04</div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Available Lifelines</h3>
            </div>
            <p className="text-[10px] text-gray-600 font-bold uppercase mb-4 pl-9">Each player has one-time access to the following:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-9">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <i className="fas fa-snowflake text-cyan-400 mb-2"></i>
                <h4 className="text-[10px] font-black text-white uppercase mb-1">Freeze</h4>
                <p className="text-[10px] text-gray-500">Halts the countdown timer indefinitely.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <i className="fas fa-lightbulb text-purple-400 mb-2"></i>
                <h4 className="text-[10px] font-black text-white uppercase mb-1">Hint</h4>
                <p className="text-[10px] text-gray-500">Generates a cryptic clue via Gemini.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <i className="fas fa-bolt text-yellow-500 mb-2"></i>
                <h4 className="text-[10px] font-black text-white uppercase mb-1">Double</h4>
                <p className="text-[10px] text-gray-500">Multiplies potential gains and losses by 2.</p>
              </div>
            </div>
          </section>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-transform"
        >
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
};

export default InstructionsModal;
