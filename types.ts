export enum AppState {
  WELCOME = 'WELCOME',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULTS = 'RESULTS'
}

export enum QuizMode {
  GUIDED = 'GUIDED', // Reveals answer immediately
  TEST = 'TEST'      // Reveals answers at the end
}

export interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FileData {
  name: string;
  data: string; // Base64 for PDF, text content for others
  mimeType: string;
}

export interface QuizConfig {
  topic: string;
  files: FileData[]; 
  durationMinutes: number;
  questionCount: number;
  mode: QuizMode;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: Map<number, number>; // QuestionIndex -> SelectedOptionIndex
  timeSpentSeconds: number;
}