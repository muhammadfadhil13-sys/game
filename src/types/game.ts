export type GradeLevel = 'Semua' | 'Kelas 3' | 'Kelas 4' | 'Kelas 5' | 'Kelas 6';

export interface QuestionOption {
  id: string;
  label: string; // e.g. "A", "B", "C", "D", "E"
  text: string;
  image?: string; // base64 or data URL
}

export interface QuestionItem {
  id: string;
  questionNumber?: number;
  grade: GradeLevel;
  title: string;
  questionText: string;
  questionImage?: string; // base64 or data URL
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface GameStats {
  score: number;
  maxScore: number;
  answeredStarsCount: number;
  totalStarsCount: number;
  lives: number;
  maxLives: number;
  firstTryCorrectCount: number;
}

export type GameScreen = 'start' | 'playing' | 'question' | 'paused' | 'gameover' | 'victory' | 'question_bank';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  type: 'sparkle' | 'star' | 'confetti' | 'dust' | 'ring';
  rotation?: number;
  vRot?: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'grass' | 'stone' | 'wood' | 'cloud' | 'floating';
  passThrough?: boolean; // can jump up through it
}

export interface StarCollectible {
  id: string;
  questionIndex: number;
  x: number;
  y: number;
  baseY: number;
  radius: number;
  isCollected: boolean;
  isAnswered: boolean;
  glowOffset: number;
  numberLabel: number;
}

export interface Checkpoint {
  x: number;
  y: number;
}
