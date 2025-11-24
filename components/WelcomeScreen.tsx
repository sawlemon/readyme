import React, { useState, useRef } from 'react';
import { QuizConfig, QuizMode, FileData } from '../types';

interface WelcomeScreenProps {
  onStart: (config: QuizConfig) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<string>("90");
  const [questionCount, setQuestionCount] = useState<string>("10");
  const [mode, setMode] = useState<QuizMode>(QuizMode.TEST);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!topic && files.length === 0) return;

    const processedFiles: FileData[] = [];

    if (files.length > 0) {
      await Promise.all(files.map(async (file) => {
        let data = '';
        let mimeType = '';

        if (file.type === 'application/pdf') {
            data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove Data URL prefix for inlineData
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            mimeType = 'application/pdf';
        } else {
            // Assume text/markdown/etc
            data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
            });
            mimeType = 'text/plain'; // Internal flag for service to know it's text
        }

        processedFiles.push({
            name: file.name,
            data: data,
            mimeType: mimeType
        });
      }));
    }

    const finalDuration = parseInt(duration) || 90;
    const finalCount = parseInt(questionCount) || 10;

    onStart({
      topic,
      files: processedFiles,
      durationMinutes: finalDuration,
      questionCount: finalCount,
      mode
    });
  };

  const hasFiles = files.length > 0;

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-start pt-12 pb-32 px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center mb-10 relative w-full animate-fade-in-up">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-gradient-to-b from-white/10 to-transparent border border-white/20 shadow-2xl backdrop-blur-xl mb-6 relative z-10">
          <svg className="w-10 h-10 text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/60">
          ReadyMe
        </h1>
        <p className="text-base text-blue-200/60 font-medium tracking-wide">
          Intelligence-Grade Assessment Platform
        </p>
      </div>

      {/* Main Glass Panel */}
      <div className="w-full max-w-3xl glass-panel rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Input Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between px-2">
             <label className="text-[10px] font-bold text-blue-300/80 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,1)]"></span>
                Input Source
             </label>
             <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
               {hasFiles ? `${files.length} File${files.length > 1 ? 's' : ''} Attached` : 'Content & Prompt'}
             </span>
          </div>
          
          <div className="grid grid-cols-1 gap-5">
            {/* Prompt Area */}
            <div className="relative group">
               <textarea
                className="w-full h-32 glass-input rounded-3xl p-5 resize-none text-base placeholder-white/20 transition-all opacity-100"
                placeholder="Enter a topic, paste study notes, or add instructions for the uploaded files..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
                <div className="h-px bg-white/5 flex-1"></div>
                <span className="text-[10px] uppercase text-white/20 font-bold tracking-widest">+</span>
                <div className="h-px bg-white/5 flex-1"></div>
            </div>

            {/* File Upload */}
            <div className="flex flex-col gap-3">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-24 rounded-2xl border border-dashed transition-all cursor-pointer flex items-center justify-center overflow-hidden
                    ${hasFiles
                        ? 'border-emerald-500/30 bg-emerald-500/5' 
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5 bg-black/20'}`}
                >
                  <input 
                    type="file" 
                    multiple
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.txt,.md,text/plain,application/pdf"
                    onChange={handleFileChange}
                  />
                  
                  <div className="flex items-center space-x-3 text-white/40 group-hover:text-white/60 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-sm font-medium">Upload Files (PDF, Markdown, Text)</span>
                  </div>
                </div>

                {/* File List */}
                {hasFiles && (
                    <div className="grid grid-cols-1 gap-2 animate-fade-in">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center space-x-4 px-4 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className="text-sm font-medium text-emerald-100 truncate">{file.name}</p>
                                    <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider font-bold">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Mode Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-purple-300/80 uppercase tracking-widest flex items-center gap-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,1)]"></span>
                Mode
              </label>
              <div className="bg-black/20 p-1 rounded-[1.2rem] flex border border-white/5 relative isolate">
                  <div 
                    className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-[0.9rem] border border-white/10 shadow-lg backdrop-blur-md transition-all duration-300 ease-out z-[-1]
                    ${mode === QuizMode.TEST ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'}`}
                  ></div>
                  <button
                      onClick={() => setMode(QuizMode.GUIDED)}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${mode === QuizMode.GUIDED ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                      Guided
                  </button>
                  <button
                      onClick={() => setMode(QuizMode.TEST)}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${mode === QuizMode.TEST ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                  >
                      Exam
                  </button>
              </div>
            </div>

            {/* Config Inputs */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-orange-300/80 uppercase tracking-widest flex items-center gap-2 px-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,1)]"></span>
                    Settings
                </label>
                <div className="flex gap-3">
                    <div className="flex-1 glass-input rounded-2xl p-3 relative group focus-within:bg-black/40 transition-colors">
                        <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">Time (Min)</label>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={duration} 
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) setDuration(e.target.value);
                            }}
                            onBlur={() => {
                                let val = parseInt(duration);
                                if (isNaN(val) || val < 1) val = 1;
                                if (val > 180) val = 180;
                                setDuration(val.toString());
                            }}
                            className="bg-transparent text-xl font-bold text-white w-full outline-none placeholder-white/20"
                            placeholder="90"
                        />
                    </div>
                    <div className="flex-1 glass-input rounded-2xl p-3 relative group focus-within:bg-black/40 transition-colors">
                        <label className="text-[9px] text-white/40 font-bold uppercase block mb-1">Questions</label>
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={questionCount} 
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) setQuestionCount(e.target.value);
                            }}
                            onBlur={() => {
                                let val = parseInt(questionCount);
                                if (isNaN(val) || val < 1) val = 1;
                                if (val > 100) val = 100;
                                setQuestionCount(val.toString());
                            }}
                            className="bg-transparent text-xl font-bold text-white w-full outline-none placeholder-white/20"
                            placeholder="10"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <button
            onClick={handleSubmit}
            disabled={!topic && !hasFiles}
            className={`w-full py-4 rounded-[1.5rem] text-base font-bold tracking-wide transition-all duration-300 relative overflow-hidden group border
            ${!topic && !hasFiles 
                ? 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-white text-black border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:scale-[1.01] active:scale-[0.99]'}`}
        >
            <span className="relative z-10 flex items-center justify-center space-x-2">
                <span>Generate Assessment</span>
                {!(!topic && !hasFiles) && (
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                )}
            </span>
            {(!topic && !hasFiles) ? null : <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;