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
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[128px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-teal-600/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQwIDBIMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex flex-col">
          {appState === AppState.WELCOME && (
            <>
              <WelcomeScreen onStart={handleStart} />
              {error && (
                 <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-500/10 border border-red-500/30 text-red-200 px-8 py-4 rounded-full backdrop-blur-xl shadow-2xl animate-fade-in-up flex items-center space-x-3 z-50">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>{error}</span>
                 </div>
              )}
            </>
          )}

          {appState === AppState.LOADING && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in min-h-[500px]">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-8 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                </div>
              </div>
              <div className="text-center space-y-2 z-10 px-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Constructing Exam</h2>
                  <p className="text-zinc-400 font-light max-w-md mx-auto">Using Gemini 3 Pro to analyze content architecture and generate assessment vectors...</p>
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