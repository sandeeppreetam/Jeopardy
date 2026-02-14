
export enum GameState {
  SETUP = 'SETUP',
  TOPICS = 'TOPICS',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface Lifelines {
  freezeUsed: boolean;
  hintUsed: boolean;
  doubleUsed: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  correctCount: number;
  wrongCount: number;
  passCount: number;
  lifelines: Lifelines;
}

export interface Question {
  id: string;
  points: number;
  question: string;
  answer: string;
  isAnswered: boolean;
}

export interface Topic {
  id: string;
  title: string;
  questions: Question[];
}

export interface GameSettings {
  numTopics: number;
  numQuestionsPerTopic: number;
  timerSeconds: number;
}

export interface HistoryItem {
  id: string;
  playerName: string;
  playerColor: string;
  topicTitle: string;
  points: number;
  result: 'correct' | 'wrong' | 'pass';
  questionText: string;
  answerText: string;
  speedBonus: boolean;
}
