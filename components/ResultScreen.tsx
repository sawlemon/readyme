import React from 'react';
import { Question, QuizResult } from '../types';

interface ResultScreenProps {
  questions: Question[];
  result: QuizResult;
  onRetake: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ questions, result, onRetake }) => {
  const percentage = Math.round((result.score / result.total) * 100);
  
  let colorClass = 'text-red-400';
  let strokeColor = '#f87171'; // red-400
  if (percentage >= 80) { colorClass = 'text-green-400'; strokeColor = '#4ade80'; }
  else if (percentage >= 60) { colorClass = 'text-yellow-400'; strokeColor = '#facc15'; }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 animate-fade-in relative z-10 pb-24">
      <div className="text-center mb-16">
        <div className="inline-block relative p-8 glass-panel rounded-[3rem] mb-8">
            {/* Glowing Score Ring */}
            <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <circle cx="96" cy="96" r="88" className="text-white/5" strokeWidth="6" fill="none" stroke="currentColor" />
                    <circle 
                        cx="96" cy="96" r="88" 
                        stroke={strokeColor}
                        strokeWidth="6" 
                        fill="none" 
                        strokeDasharray={552} 
                        strokeDashoffset={552 - (552 * percentage) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_15px_currentColor]"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold tracking-tighter ${colorClass} drop-shadow-md`}>{percentage}%</span>
                    <span className="text-white/40 font-medium tracking-widest text-[10px] uppercase mt-1">Score</span>
                </div>
            </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Session Complete</h1>
        <p className="text-white/50 text-lg">Performance Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-white/60">Total Items</p>
            <p className="text-5xl font-bold text-white tracking-tight">{result.total}</p>
        </div>
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-white/60">Correct</p>
            <p className="text-5xl font-bold text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.3)] tracking-tight">{result.score}</p>
        </div>
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3 group-hover:text-white/60">Duration</p>
            <p className="text-5xl font-bold text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)] tracking-tight">
                {Math.floor(result.timeSpentSeconds / 60)}<span className="text-2xl text-white/30 font-light mx-1">m</span>{String(result.timeSpentSeconds % 60).padStart(2, '0')}<span className="text-2xl text-white/30 font-light mx-1">s</span>
            </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-8 px-2">
            <h2 className="text-2xl font-bold text-white">Detailed Review</h2>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/50">
                {questions.length} Items
            </div>
        </div>

        {questions.map((q, idx) => {
            const userAns = result.answers.get(idx);
            const isCorrect = userAns === q.correctIndex;
            return (
                <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all ${isCorrect ? 'border-white/5 bg-white/5 hover:border-green-500/20' : 'border-red-500/20 bg-red-500/5'}`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-start">
                            <span className="text-white/30 font-mono text-sm mr-6 mt-1.5">{(idx + 1).toString().padStart(2, '0')}</span>
                            <h3 className="text-xl font-medium text-zinc-100 leading-relaxed pr-8">
                                {q.question}
                            </h3>
                        </div>
                        {isCorrect ? (
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 shadow-[0_0_15px_rgba(248,113,113,0.2)]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 mb-8 pl-12">
                        {q.options.map((opt, optIdx) => {
                            let style = "text-zinc-500";
                            let marker = <span className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs mr-4 opacity-50 bg-white/5">{String.fromCharCode(65 + optIdx)}</span>;
                            
                            if (optIdx === q.correctIndex) {
                                style = "text-white font-medium";
                                marker = <span className="w-8 h-8 rounded-full bg-green-500 text-black flex items-center justify-center text-xs font-bold mr-4 shadow-[0_0_10px_rgba(74,222,128,0.5)]">✓</span>;
                            } else if (optIdx === userAns && !isCorrect) {
                                style = "text-red-400";
                                marker = <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold mr-4 shadow-[0_0_10px_rgba(248,113,113,0.5)]">✕</span>;
                            }

                            return (
                                <div key={optIdx} className={`text-base flex items-center ${style}`}>
                                    {marker}
                                    {opt}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="glass-panel p-6 rounded-3xl text-sm text-zinc-300 border border-white/5 ml-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2">Rationale</span>
                        <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="mt-20 text-center">
        <button 
            onClick={onRetake}
            className="px-12 py-5 bg-white text-black font-bold text-lg rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/50"
        >
            Start New Session
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;