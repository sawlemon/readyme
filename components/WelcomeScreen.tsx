import React, { useState, useRef } from 'react';
import { QuizConfig, QuizMode } from '../types';

interface WelcomeScreenProps {
  onStart: (config: QuizConfig) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [topic, setTopic] = useState('');
  // Use strings to allow for empty inputs while typing
  const [duration, setDuration] = useState<string>("90");
  const [questionCount, setQuestionCount] = useState<string>("10");
  const [mode, setMode] = useState<QuizMode>(QuizMode.TEST);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!topic && !file) return;

    let fileData: string | undefined = undefined;
    let mimeType: string | undefined = undefined;

    if (file) {
      fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      mimeType = file.type;
    }

    // Default values if empty
    const finalDuration = parseInt(duration) || 90;
    const finalCount = parseInt(questionCount) || 10;

    onStart({
      topic,
      fileData,
      mimeType,
      durationMinutes: finalDuration,
      questionCount: finalCount,
      mode
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 animate-fade-in flex flex-col items-center">
      
      {/* Header */}
      <div className="text-center mb-12 relative w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-xl backdrop-blur-2xl mb-6 relative z-10 hover:scale-105 transition-transform duration-500">
          <svg className="w-12 h-12 text-blue-300 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white drop-shadow-sm">
          ReadyMe
        </h1>
        <p className="text-lg text-white/60 font-medium tracking-wide max-w-lg mx-auto">
          Liquid-smooth AI certification engine
        </p>
      </div>

      {/* Glass Card */}
      <div className="w-full glass-panel rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden">
        {/* Decorative sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>
        
        {/* Input Section */}
        <div className="space-y-8 mb-10">
          <div className="flex items-center space-x-3 mb-2 px-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
            <label className="text-xs font-bold text-blue-200/80 uppercase tracking-widest">Source Material</label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
               <textarea
                className="w-full h-48 glass-input rounded-3xl p-6 resize-none text-lg placeholder-white/30 transition-all focus:bg-white/10 border-transparent focus:border-blue-400/30"
                placeholder="What topic should we test you on?"
                value={topic}
                onChange={(e) => {
                    setTopic(e.target.value);
                    if(e.target.value) setFile(null);
                }}
              />
              <div className="absolute bottom-4 right-4 text-[10px] font-bold text-white/40 pointer-events-none uppercase tracking-wider">
                 Prompt
              </div>
            </div>

            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-48 rounded-3xl border border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                ${file 
                    ? 'border-green-500/40 bg-green-500/10' 
                    : 'border-white/10 hover:border-white/30 hover:bg-white/5 bg-black/20'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="z-10 text-center px-6 animate-fade-in w-full">
                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-2xl flex items-center justify-center mb-4 text-green-400 shadow-lg shadow-green-900/20 border border-green-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-sm font-medium text-green-100 truncate block w-full">{file.name}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="mt-3 text-xs text-white/60 hover:text-white transition-colors bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20"
                    >
                        Remove
                    </button>
                </div>
              ) : (
                <div className="z-10 text-center">
                    <div className="w-14 h-14 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-white/40 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-inner border border-white/5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    <span className="text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors">Upload PDF Guide</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Mode Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 px-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                <label className="text-xs font-bold text-purple-200/80 uppercase tracking-widest">Experience Mode</label>
              </div>
              <div className="bg-black/30 p-1.5 rounded-full flex space-x-1 border border-white/10 relative overflow-hidden">
                  <button
                      onClick={() => setMode(QuizMode.GUIDED)}
                      className={`flex-1 py-3.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 relative z-10
                      ${mode === QuizMode.GUIDED 
                          ? 'text-white shadow-lg' 
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                  >
                      Guided
                  </button>
                  <button
                      onClick={() => setMode(QuizMode.TEST)}
                      className={`flex-1 py-3.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 relative z-10
                      ${mode === QuizMode.TEST 
                          ? 'text-white shadow-lg' 
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                  >
                      Exam
                  </button>
                  {/* Sliding Background */}
                  <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-transform duration-300 ease-out ${mode === QuizMode.TEST ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}></div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
                <div className="flex items-center space-x-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"></div>
                    <label className="text-xs font-bold text-orange-200/80 uppercase tracking-widest">Parameters</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-3xl p-4 border border-white/10 flex flex-col relative group hover:border-white/20 transition-all hover:bg-black/40">
                        <span className="text-[10px] text-white/40 font-bold uppercase mb-1">Duration</span>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={duration} 
                            onChange={(e) => {
                                // Allow only numbers
                                if (/^\d*$/.test(e.target.value)) {
                                    setDuration(e.target.value);
                                }
                            }}
                            onBlur={() => {
                                let val = parseInt(duration) || 90;
                                if (val < 1) val = 1;
                                if (val > 180) val = 180;
                                setDuration(val.toString());
                            }}
                            className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full placeholder-white/20"
                            placeholder="90"
                        />
                        <span className="absolute right-5 bottom-5 text-xs text-white/40 font-medium pointer-events-none">MIN</span>
                    </div>
                    <div className="bg-black/30 rounded-3xl p-4 border border-white/10 flex flex-col relative group hover:border-white/20 transition-all hover:bg-black/40">
                        <span className="text-[10px] text-white/40 font-bold uppercase mb-1">Items</span>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={questionCount} 
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) {
                                    setQuestionCount(e.target.value);
                                }
                            }}
                            onBlur={() => {
                                let val = parseInt(questionCount) || 10;
                                if (val < 1) val = 1;
                                if (val > 50) val = 50;
                                setQuestionCount(val.toString());
                            }}
                            className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full placeholder-white/20"
                            placeholder="10"
                        />
                        <span className="absolute right-5 bottom-5 text-xs text-white/40 font-medium pointer-events-none">QTY</span>
                    </div>
                </div>
            </div>
        </div>

        <button
            onClick={handleSubmit}
            disabled={!topic && !file}
            className={`w-full py-5 rounded-full text-lg font-bold tracking-wide transition-all duration-300 relative overflow-hidden group border
            ${!topic && !file 
                ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-white text-black border-white/50 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:scale-[1.01] active:scale-[0.99]'}`}
        >
            <span className="relative z-10 flex items-center justify-center space-x-3">
                <span>Begin Analysis</span>
                {!(!topic && !file) && (
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                )}
            </span>
            {(!topic && !file) ? null : <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
        </button>
      </div>
      
      {/* Spacer for bottom scrolling */}
      <div className="h-20 w-full"></div>
    </div>
  );
};

export default WelcomeScreen;