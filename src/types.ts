export interface AdvancedQuestion {
  id: number;
  story: string;
  questionA: string;
  questionB: string;
  correctAnswer: number;
  lawOptions: string[];
  lawCorrectIndex: number;
}

export interface EasyQuestion {
  id: number;
  story: string;
  question: string;
  correctAnswer: number;
}

export interface AnswerRecord {
  questionId: number;
  selectedAnswer: number;
  selectedLawIndex?: number;
  isAnswerCorrect: boolean;
  isLawCorrect?: boolean;
  points: number;
}

export interface PlayerRecord {
  id: string;
  fullName: string;
  phone: string;
  score: number;
  stars: number;
  percentage: number;
  title: string;
  heartsLeft: number;
  startedAt: string;
  finishedAt: string;
  duration: number; // in seconds
  answers: AnswerRecord[];
}

export interface AnswerOverride {
  correctAnswer?: number;
  lawCorrectIndex?: number;
}

export type ScreenType =
  | 'home'
  | 'register'
  | 'level-select'
  | 'intro-quiz'
  | 'quiz'
  | 'result'
  | 'certificate'
  | 'admin-login'
  | 'admin-dashboard';
