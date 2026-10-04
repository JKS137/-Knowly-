export type QuizTheme = 'terracotta' | 'sunset' | 'midnight' | 'emerald' | 'minimal' | 'lavender';

export type QuizStatus = 'draft' | 'published' | 'closed';

export type QuestionType = 'multiple_choice' | 'yes_no';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  orderNum: number;
  text: string;
  type: QuestionType;
  imageUrl?: string;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  shortId: string;
  title: string;
  description: string;
  creatorName: string;
  creatorToken?: string;
  theme: QuizTheme;
  status: QuizStatus;
  questionsCount: number;
  createdAt: string;
  updatedAt: string;
  viewsCount: number;
  startsCount: number;
  completionsCount: number;
  questions?: QuizQuestion[];
}

export interface QuizSubmissionAnswer {
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
}

export interface ResultTier {
  title: string;
  subtitle: string;
  badge: string;
  color: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  shortId: string;
  participantName: string;
  participantEmoji: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  resultTier: ResultTier;
  createdAt: string;
  answers: QuizSubmissionAnswer[];
}

export interface QuestionStat {
  questionId: string;
  text: string;
  orderNum: number;
  totalAnswers: number;
  correctAnswers: number;
  correctRate: number;
  isHardest?: boolean;
  isEasiest?: boolean;
}

export interface ScoreDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface CreatorDashboardData {
  quiz: Quiz;
  submissions: QuizSubmission[];
  analytics: {
    totalViews: number;
    totalStarts: number;
    totalCompletions: number;
    completionRate: number;
    averageScore: number;
    averagePercentage: number;
    highestScore: number;
    lowestScore: number;
    scoreDistribution: ScoreDistribution[];
    questionStats: QuestionStat[];
  };
}
