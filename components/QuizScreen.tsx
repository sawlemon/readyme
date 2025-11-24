import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuizConfig, QuizMode } from '../types';

interface QuizScreenProps {
  questions: Question[];
  config: QuizConfig;
  onFinish: (answers: Map<number, number>, timeSpent: number) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, config, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  
  const [timeLeft, setTimeLeft] = useState(config.durationMinutes * 60);
  const [timeSpent, setTimeSpent] = useState(0);

  const [showFeedback, setShowFeedback] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = useCallback(() => {
    onFinish(answers, timeSpent);
  }, [answers, timeSpent, onFinish]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [handleFinish]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = selectedOptionIndex !== null;

  const handleOptionSelect = (index: number) => {
    if (config.mode === QuizMode.GUIDED && showFeedback) return;
    
    setSelectedOptionIndex(index);
    
    if (config.mode === QuizMode.TEST) {
       const newAnswers = new Map(answers);
       newAnswers.set(currentQuestionIndex, index);
       setAnswers(newAnswers);
    }
  };

  const handleNext = () => {
    if (config.mode === QuizMode.GUIDED) {
        if (!showFeedback && hasAnsweredCurrent) {
            const newAnswers = new Map(answers);
            newAnswers.set(currentQuestionIndex, selectedOptionIndex!);
            setAnswers(newAnswers);
            setShowFeedback(true);
            return;
        } else if (showFeedback) {
             if (isLastQuestion) {
                 handleFinish();
             } else {
                 setCurrentQuestionIndex(prev => prev + 1);
                 setSelectedOptionIndex(null);
                 setShowFeedback(false);
             }
             return;
        }
    }

    if (isLastQuestion) {
      handleFinish();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
    }
  };

  let primaryButtonText = "Next Question";
  if (config.mode === QuizMode.GUIDED) {
      if (!showFeedback) primaryButtonText = "Check Answer";
      else primaryButtonText = isLastQuestion ? "Finish Session" : "Next Question";
  } else {
      primaryButtonText = isLastQuestion ? "Submit Exam" : "Next Question";
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 min-h-full flex flex-col relative z-10">
      {/* Glass Header */}
      <header className="flex items-center justify-between mb-8 bg-white/5 backdrop-blur-2xl px-6 py-4 rounded-full border border-white/10 shadow-lg sticky top-2 z-20">
        <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center font-mono font-bold text-white border border-white/10 text-sm shadow-inner">
                {currentQuestionIndex + 1}
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="text-sm font-medium text-white/70 tracking-wide">
                Question <span className="text-white">{(currentQuestionIndex + 1).toString().padStart(2, '0')}</span> <span className="text-white/30">/ {questions.length}</span>
            </span>
        </div>

        <div className="flex items-center space-x-3 bg-black/20 px-4 py-1.5 rounded-full border border-white/5">
             <div className={`w-2 h-2 rounded-full ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.6)]'}`}></div>
            <span className={`text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white/90'}`}>
                {formatTime(timeLeft)}
            </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 rounded-full mb-10 overflow-hidden backdrop-blur-sm">
        <div 
            className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            style={{ 
                width: `${((currentQuestionIndex) / questions.length) * 100}%`,
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)'
            }}
        ></div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <div className="space-y-10 animate-fade-in-up">
            <h2 className="text-2xl md:text-4xl font-bold leading-tight text-white drop-shadow-sm">
                {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOptionIndex === idx;
                    const isCorrect = idx === currentQuestion.correctIndex;
                    
                    let cardStyle = "glass-button hover:bg-white/10";
                    let circleStyle = "border-white/20 text-white/50";
                    
                    if (config.mode === QuizMode.GUIDED && showFeedback) {
                        if (isCorrect) {
                            cardStyle = "bg-green-500/10 border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.1)]";
                            circleStyle = "bg-green-500 border-green-500 text-black font-bold";
                        } else if (isSelected && !isCorrect) {
                            cardStyle = "bg-red-500/10 border-red-500/40";
                            circleStyle = "bg-red-500 border-red-500 text-white";
                        } else {
                            cardStyle = "opacity-50 grayscale bg-black/20 border-transparent";
                        }
                    } else if (isSelected) {
                        cardStyle = "bg-blue-600/20 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.01]";
                        circleStyle = "bg-blue-500 border-blue-500 text-white font-bold shadow-lg";
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={config.mode === QuizMode.GUIDED && showFeedback}
                            className={`w-full p-5 rounded-2xl border text-left flex items-start group transition-all duration-300 ${cardStyle}`}
                        >
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm mr-5 flex-shrink-0 transition-all duration-300 ${circleStyle}`}>
                                {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-lg text-zinc-100 font-light leading-relaxed pt-0.5">{option}</span>
                            
                            {config.mode === QuizMode.GUIDED && showFeedback && isCorrect && (
                                <svg className="w-6 h-6 text-green-400 ml-auto drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Explanation Box (Liquid Glass) */}
            {config.mode === QuizMode.GUIDED && showFeedback && (
                <div className="glass-panel p-8 rounded-3xl animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-blue-400 to-purple-500"></div>
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest">Expert Insight</h3>
                    </div>
                    <p className="text-white/90 leading-relaxed font-light text-lg">
                        {currentQuestion.explanation}
                    </p>
                </div>
            )}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-12 flex justify-end pb-12">
        <button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent && !(config.mode === QuizMode.GUIDED && showFeedback)}
            className={`px-12 py-4 rounded-full font-bold text-lg tracking-wide transition-all duration-300 border
            ${(!hasAnsweredCurrent && !(config.mode === QuizMode.GUIDED && showFeedback))
                ? 'bg-white/5 text-white/30 border-white/5 cursor-not-allowed'
                : 'bg-white text-black border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]'}`}
        >
            {primaryButtonText}
        </button>
      </div>
    </div>
  );
};

export default QuizScreen;