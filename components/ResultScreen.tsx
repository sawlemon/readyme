import React, { useState } from 'react';
import { Question, QuizResult } from '../types';

interface ResultScreenProps {
  questions: Question[];
  result: QuizResult;
  onRetake: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ questions, result, onRetake }) => {
  const [filter, setFilter] = useState<'ALL' | 'WRONG'>('ALL');
  
  const percentage = Math.round((result.score / result.total) * 100);
  
  let colorClass = 'text-red-400';
  let strokeColor = '#f87171'; // red-400
  if (percentage >= 80) { colorClass = 'text-emerald-400'; strokeColor = '#34d399'; }
  else if (percentage >= 60) { colorClass = 'text-amber-400'; strokeColor = '#fbbf24'; }

  const filteredQuestions = questions.map((q, i) => ({ q, i })).filter(({ i }) => {
      if (filter === 'ALL') return true;
      const userAns = result.answers.get(i);
      const isCorrect = userAns === questions[i].correctIndex;
      return !isCorrect;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in relative z-10 pb-24">
      <div className="text-center mb-12">
        <div className="inline-block relative p-6 glass-panel rounded-[2.5rem] mb-6">
            {/* Glowing Score Ring */}
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <circle cx="80" cy="80" r="70" className="text-white/5" strokeWidth="6" fill="none" stroke="currentColor" />
                    <circle 
                        cx="80" cy="80" r="70" 
                        stroke={strokeColor}
                        strokeWidth="6" 
                        fill="none" 
                        strokeDasharray={440} 
                        strokeDashoffset={440 - (440 * percentage) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_15px_currentColor]"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold tracking-tighter ${colorClass} drop-shadow-md`}>{percentage}%</span>
                    <span className="text-white/40 font-medium tracking-widest text-[9px] uppercase mt-1">Efficiency</span>
                </div>
            </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Session Complete</h1>
        <p className="text-white/50 text-base">Performance Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="glass-panel p-6 rounded-[2rem] flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-white/60">Total Items</p>
            <p className="text-4xl font-bold text-white tracking-tight">{result.total}</p>
        </div>
        <div className="glass-panel p-6 rounded-[2rem] flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-white/60">Correct</p>
            <p className="text-4xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] tracking-tight">{result.score}</p>
        </div>
        <div className="glass-panel p-6 rounded-[2rem] flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 group-hover:text-white/60">Time</p>
            <p className="text-4xl font-bold text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)] tracking-tight">
                {Math.floor(result.timeSpentSeconds / 60)}<span className="text-lg text-white/30 font-light mx-0.5">m</span>{String(result.timeSpentSeconds % 60).padStart(2, '0')}<span className="text-lg text-white/30 font-light mx-0.5">s</span>
            </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-4 mb-6 px-1 gap-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Review</h2>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-white/50">
                    {filteredQuestions.length} Items
                </div>
            </div>

            {/* Filter Toggle */}
            <div className="bg-white/5 p-1 rounded-full flex border border-white/5 relative">
                 <button
                    onClick={() => setFilter('ALL')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 
                    ${filter === 'ALL' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                >
                    All Questions
                </button>
                <button
                    onClick={() => setFilter('WRONG')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 
                    ${filter === 'WRONG' ? 'bg-red-500/20 text-red-200 border border-red-500/20 shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                >
                    Incorrect Only
                </button>
            </div>
        </div>
        
        {filteredQuestions.length === 0 && (
             <div className="py-12 text-center text-white/30 font-medium border border-dashed border-white/10 rounded-[2rem]">
                 No questions match this filter.
             </div>
        )}

        {filteredQuestions.map(({ q, i }) => {
            const idx = i; // Original index
            const userAns = result.answers.get(idx);
            const isCorrect = userAns === q.correctIndex;
            return (
                <div key={idx} className={`p-6 rounded-[2rem] border transition-all ${isCorrect ? 'border-white/5 bg-white/5' : 'border-red-500/20 bg-red-500/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start">
                            <span className="text-white/30 font-mono text-xs mr-4 mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                            <h3 className="text-lg font-medium text-zinc-100 leading-snug pr-4">
                                {q.question}
                            </h3>
                        </div>
                        {isCorrect ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 mb-6 pl-8">
                        {q.options.map((opt, optIdx) => {
                            let style = "text-zinc-500";
                            let marker = <span className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-[10px] mr-3 opacity-50 bg-white/5">{String.fromCharCode(65 + optIdx)}</span>;
                            
                            if (optIdx === q.correctIndex) {
                                style = "text-white font-medium";
                                marker = <span className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-bold mr-3 shadow-[0_0_8px_rgba(16,185,129,0.5)]">✓</span>;
                            } else if (optIdx === userAns && !isCorrect) {
                                style = "text-red-400";
                                marker = <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold mr-3 shadow-[0_0_8px_rgba(248,113,113,0.5)]">✕</span>;
                            }

                            return (
                                <div key={optIdx} className={`text-sm flex items-center ${style}`}>
                                    {marker}
                                    {opt}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="glass-panel p-5 rounded-2xl text-sm text-zinc-300 border border-white/5 ml-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-white/20"></div>
                        <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest block mb-1">Rationale</span>
                        <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="mt-16 text-center">
        <button 
            onClick={onRetake}
            className="px-10 py-4 bg-white text-black font-bold text-base rounded-[1.5rem] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/50"
        >
            Start New Session
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;