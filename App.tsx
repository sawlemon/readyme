import React, { useState } from 'react';
import { AppState, QuizConfig, Question, QuizResult } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { generateQuiz } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (newConfig: QuizConfig) => {
    setConfig(newConfig);
    setAppState(AppState.LOADING);
    setError(null);

    try {
      const generatedQuestions = await generateQuiz(newConfig);
      setQuestions(generatedQuestions);
      setAppState(AppState.QUIZ);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate exam. Please check your topic or file and try again. " + (err.message || ''));
      setAppState(AppState.WELCOME);
    }
  };

  const handleFinishQuiz = (answers: Map<number, number>, timeSpentSeconds: number) => {
    let score = 0;
    answers.forEach((selectedOption, questionIndex) => {
      if (questions[questionIndex].correctIndex === selectedOption) {
        score++;
      }
    });

    setResult({
      score,
      total: questions.length,
      answers,
      timeSpentSeconds
    });
    setAppState(AppState.RESULTS);
  };

  const handleRetake = () => {
    setAppState(AppState.WELCOME);
    setConfig(null);
    setQuestions([]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="relative w-full h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Liquid Background Mesh - Fixed position */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-teal-600/15 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar">
        {/* Container for centering logic if needed, but allowing scroll */}
        <div className="w-full min-h-full">
          {appState === AppState.WELCOME && (
            <>
              <WelcomeScreen onStart={handleStart} />
              {error && (
                 <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl animate-fade-in-up flex items-center space-x-3 z-50 max-w-[90%]">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="text-sm font-medium">{error}</span>
                 </div>
              )}
            </>
          )}

          {appState === AppState.LOADING && (
            <div className="w-full h-full min-h-screen flex flex-col items-center justify-center space-y-8 animate-fade-in p-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>
              <div className="text-center space-y-2 z-10">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Constructing Exam</h2>
                  <p className="text-zinc-400 font-light text-sm max-w-xs mx-auto">Using Gemini 3 Pro to analyze content architecture...</p>
              </div>
            </div>
          )}

          {appState === AppState.QUIZ && config && (
            <QuizScreen 
              questions={questions} 
              config={config} 
              onFinish={handleFinishQuiz} 
            />
          )}

          {appState === AppState.RESULTS && result && (
            <ResultScreen 
              questions={questions} 
              result={result} 
              onRetake={handleRetake} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;