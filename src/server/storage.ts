import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Quiz, QuizQuestion, QuizSubmission, QuizTheme, CreatorDashboardData, QuestionStat } from '../types/quiz';
import { calculateResultTier } from '../utils/scoring';

interface DatabaseSchema {
  quizzes: Record<string, Quiz>; // key is shortId
  submissions: Record<string, QuizSubmission[]>; // key is shortId
  analytics: Record<string, { views: number; starts: number; completions: number }>;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Generate safe short ID (e.g. "k9z2Wp")
export function generateShortId(length = 6): string {
  const chars = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function generateToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

class StorageEngine {
  private db: DatabaseSchema = {
    quizzes: {},
    submissions: {},
    analytics: {},
  };
  private isLoaded = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        this.isLoaded = true;
      } else {
        this.seedInitialData();
        this.persist();
      }
    } catch (err) {
      console.error('Failed to load storage, initializing fresh:', err);
      this.seedInitialData();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  private seedInitialData() {
    const demoShortId = 'maya77';
    const demoQuiz: Quiz = {
      id: 'quiz_demo_1',
      shortId: demoShortId,
      title: "How Well Do You Really Know Maya?",
      description: "Answer these 6 questions to see if you're in my inner circle or just a friendly stranger!",
      creatorName: "Maya Lin",
      creatorToken: "token_demo_maya",
      theme: 'terracotta',
      status: 'published',
      questionsCount: 6,
      createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 42,
      startsCount: 28,
      completionsCount: 19,
      questions: [
        {
          id: 'q1',
          orderNum: 1,
          text: "What is my absolute favorite comfort food?",
          type: 'multiple_choice',
          options: [
            { id: 'q1_o1', text: "Spicy Garlic Ramen", isCorrect: true },
            { id: 'q1_o2', text: "Thin Crust Margherita Pizza", isCorrect: false },
            { id: 'q1_o3', text: "Baja Fish Tacos", isCorrect: false },
            { id: 'q1_o4', text: "Cheeseburger & Onion Rings", isCorrect: false },
          ],
        },
        {
          id: 'q2',
          orderNum: 2,
          text: "If I could jump on a plane right now, where am I going?",
          type: 'multiple_choice',
          options: [
            { id: 'q2_o1', text: "Kyoto, Japan during autumn", isCorrect: true },
            { id: 'q2_o2', text: "Paris, France for pastries", isCorrect: false },
            { id: 'q2_o3', text: "Reykjavik, Iceland to see auroras", isCorrect: false },
            { id: 'q2_o4', text: "A quiet beach villa in Bali", isCorrect: false },
          ],
        },
        {
          id: 'q3',
          orderNum: 3,
          text: "What is my go-to order at a coffee shop?",
          type: 'multiple_choice',
          options: [
            { id: 'q3_o1', text: "Iced Oat Vanilla Latte", isCorrect: true },
            { id: 'q3_o2', text: "Straight Double Espresso", isCorrect: false },
            { id: 'q3_o3', text: "Hot Matcha with Almond Milk", isCorrect: false },
            { id: 'q3_o4', text: "Cold Brew with sweet cream", isCorrect: false },
          ],
        },
        {
          id: 'q4',
          orderNum: 4,
          text: "Am I a morning lark or a nocturnal night owl?",
          type: 'multiple_choice',
          options: [
            { id: 'q4_o1', text: "Night owl — most creative after 11 PM", isCorrect: true },
            { id: 'q4_o2', text: "Early bird — up with the sun at 6 AM", isCorrect: false },
            { id: 'q4_o3', text: "I sleep 10 hours whenever possible", isCorrect: false },
            { id: 'q4_o4', text: "Perpetually caffeinated at all hours", isCorrect: false },
          ],
        },
        {
          id: 'q5',
          orderNum: 5,
          text: "What is my biggest pet peeve in conversation?",
          type: 'multiple_choice',
          options: [
            { id: 'q5_o1', text: "People checking their phone while talking", isCorrect: true },
            { id: 'q5_o2', text: "Chewing loudly or talking with mouth full", isCorrect: false },
            { id: 'q5_o3', text: "Canceling plans 10 minutes beforehand", isCorrect: false },
            { id: 'q5_o4', text: "Spoilers for TV shows without asking", isCorrect: false },
          ],
        },
        {
          id: 'q6',
          orderNum: 6,
          text: "What's my secret hidden talent?",
          type: 'multiple_choice',
          options: [
            { id: 'q6_o1', text: "Impeccable road-trip playlist curation", isCorrect: true },
            { id: 'q6_o2', text: "Remembering exact birthdays of 100+ people", isCorrect: false },
            { id: 'q6_o3', text: "Solving a Rubik's cube under 1 minute", isCorrect: false },
            { id: 'q6_o4', text: "Identifying songs in 2 seconds flat", isCorrect: false },
          ],
        },
      ],
    };

    this.db.quizzes[demoShortId] = demoQuiz;
    this.db.analytics[demoShortId] = { views: 42, starts: 28, completions: 19 };

    // Seed realistic sample submissions
    const sampleParticipants = [
      { name: "Jordan K.", emoji: "🦊", score: 6 },
      { name: "Samira R.", emoji: "🌸", score: 5 },
      { name: "Leo T.", emoji: "⚡️", score: 5 },
      { name: "Chloe M.", emoji: "🎨", score: 4 },
      { name: "Marcus D.", emoji: "🚀", score: 3 },
      { name: "Aria P.", emoji: "🐼", score: 2 },
    ];

    const submissions: QuizSubmission[] = sampleParticipants.map((p, idx) => {
      const percentage = Math.round((p.score / 6) * 100);
      const tier = calculateResultTier(p.score, 6);
      return {
        id: `sub_${idx + 1}`,
        quizId: demoQuiz.id,
        shortId: demoShortId,
        participantName: p.name,
        participantEmoji: p.emoji,
        score: p.score,
        totalQuestions: 6,
        percentage,
        resultTier: tier,
        createdAt: new Date(Date.now() - 3600 * 1000 * (idx * 4 + 1)).toISOString(),
        answers: demoQuiz.questions!.map((q, qIdx) => {
          const isCorrect = qIdx < p.score;
          const chosenOpt = isCorrect ? q.options.find(o => o.isCorrect)! : q.options.find(o => !o.isCorrect)!;
          const correctOpt = q.options.find(o => o.isCorrect)!;
          return {
            questionId: q.id,
            questionText: q.text,
            selectedOptionId: chosenOpt.id,
            selectedOptionText: chosenOpt.text,
            correctOptionId: correctOpt.id,
            correctOptionText: correctOpt.text,
            isCorrect,
          };
        }),
      };
    });

    this.db.submissions[demoShortId] = submissions;
  }

  // --- Public APIs ---

  public getQuizByShortId(shortId: string): Quiz | null {
    return this.db.quizzes[shortId] || null;
  }

  public getPublicQuiz(shortId: string): Omit<Quiz, 'creatorToken'> | null {
    const quiz = this.db.quizzes[shortId];
    if (!quiz) return null;

    // SECURITY: Strip creatorToken and strip isCorrect from questions
    const sanitizedQuestions = (quiz.questions || []).map(q => ({
      ...q,
      options: q.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        // Notice: isCorrect is omitted!
      })),
    }));

    const { creatorToken, ...publicQuiz } = quiz;
    return {
      ...publicQuiz,
      questions: sanitizedQuestions,
    };
  }

  public getQuizzesByTokens(tokens: string[]): Quiz[] {
    const tokenSet = new Set(tokens);
    return Object.values(this.db.quizzes).filter(
      q => q.creatorToken && tokenSet.has(q.creatorToken)
    );
  }

  public createQuiz(data: {
    title: string;
    description: string;
    creatorName: string;
    theme: QuizTheme;
    questions: Array<{
      text: string;
      type?: 'multiple_choice' | 'yes_no';
      options: Array<{ text: string; isCorrect: boolean }>;
    }>;
  }): { quiz: Quiz; shortId: string; creatorToken: string } {
    let shortId = generateShortId();
    while (this.db.quizzes[shortId]) {
      shortId = generateShortId();
    }

    const creatorToken = generateToken();
    const quizId = `quiz_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const formattedQuestions: QuizQuestion[] = data.questions.map((q, idx) => ({
      id: `q_${Date.now()}_${idx}`,
      orderNum: idx + 1,
      text: q.text.trim(),
      type: q.type || 'multiple_choice',
      options: q.options.map((opt, optIdx) => ({
        id: `opt_${Date.now()}_${idx}_${optIdx}`,
        text: opt.text.trim(),
        isCorrect: Boolean(opt.isCorrect),
      })),
    }));

    const quiz: Quiz = {
      id: quizId,
      shortId,
      title: data.title.trim() || "How Well Do You Know Me?",
      description: data.description.trim() || "",
      creatorName: data.creatorName.trim() || "Anonymous Friend",
      creatorToken,
      theme: data.theme || 'terracotta',
      status: 'published',
      questionsCount: formattedQuestions.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      startsCount: 0,
      completionsCount: 0,
      questions: formattedQuestions,
    };

    this.db.quizzes[shortId] = quiz;
    this.db.submissions[shortId] = [];
    this.db.analytics[shortId] = { views: 0, starts: 0, completions: 0 };
    this.persist();

    return { quiz, shortId, creatorToken };
  }

  public updateQuiz(
    shortId: string,
    token: string,
    data: {
      title?: string;
      description?: string;
      theme?: QuizTheme;
      status?: 'draft' | 'published' | 'closed';
      questions?: Array<{
        id?: string;
        text: string;
        type?: 'multiple_choice' | 'yes_no';
        options: Array<{ id?: string; text: string; isCorrect: boolean }>;
      }>;
    }
  ): Quiz | null {
    const quiz = this.db.quizzes[shortId];
    if (!quiz || quiz.creatorToken !== token) {
      return null;
    }

    if (data.title !== undefined) quiz.title = data.title.trim();
    if (data.description !== undefined) quiz.description = data.description.trim();
    if (data.theme !== undefined) quiz.theme = data.theme;
    if (data.status !== undefined) quiz.status = data.status;

    if (data.questions !== undefined) {
      quiz.questions = data.questions.map((q, idx) => ({
        id: q.id || `q_${Date.now()}_${idx}`,
        orderNum: idx + 1,
        text: q.text.trim(),
        type: q.type || 'multiple_choice',
        options: q.options.map((opt, optIdx) => ({
          id: opt.id || `opt_${Date.now()}_${idx}_${optIdx}`,
          text: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect),
        })),
      }));
      quiz.questionsCount = quiz.questions.length;
    }

    quiz.updatedAt = new Date().toISOString();
    this.persist();
    return quiz;
  }

  public deleteQuiz(shortId: string, token: string): boolean {
    const quiz = this.db.quizzes[shortId];
    if (!quiz || quiz.creatorToken !== token) {
      return false;
    }

    delete this.db.quizzes[shortId];
    delete this.db.submissions[shortId];
    delete this.db.analytics[shortId];
    this.persist();
    return true;
  }

  public duplicateQuiz(shortId: string, token: string): { quiz: Quiz; shortId: string; creatorToken: string } | null {
    const original = this.db.quizzes[shortId];
    if (!original || original.creatorToken !== token) {
      return null;
    }

    let newShortId = generateShortId();
    while (this.db.quizzes[newShortId]) {
      newShortId = generateShortId();
    }

    const newCreatorToken = generateToken();
    const newQuizId = `quiz_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const clonedQuestions: QuizQuestion[] = (original.questions || []).map((q, idx) => ({
      id: `q_${Date.now()}_${idx}`,
      orderNum: idx + 1,
      text: q.text,
      type: q.type,
      options: q.options.map((opt, optIdx) => ({
        id: `opt_${Date.now()}_${idx}_${optIdx}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
    }));

    const newQuiz: Quiz = {
      ...original,
      id: newQuizId,
      shortId: newShortId,
      title: `${original.title} (Copy)`,
      creatorToken: newCreatorToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      startsCount: 0,
      completionsCount: 0,
      questions: clonedQuestions,
    };

    this.db.quizzes[newShortId] = newQuiz;
    this.db.submissions[newShortId] = [];
    this.db.analytics[newShortId] = { views: 0, starts: 0, completions: 0 };
    this.persist();

    return { quiz: newQuiz, shortId: newShortId, creatorToken: newCreatorToken };
  }

  public recordView(shortId: string) {
    const quiz = this.db.quizzes[shortId];
    if (quiz) {
      quiz.viewsCount = (quiz.viewsCount || 0) + 1;
      if (!this.db.analytics[shortId]) this.db.analytics[shortId] = { views: 0, starts: 0, completions: 0 };
      this.db.analytics[shortId].views += 1;
      this.persist();
    }
  }

  public recordStart(shortId: string) {
    const quiz = this.db.quizzes[shortId];
    if (quiz) {
      quiz.startsCount = (quiz.startsCount || 0) + 1;
      if (!this.db.analytics[shortId]) this.db.analytics[shortId] = { views: 0, starts: 0, completions: 0 };
      this.db.analytics[shortId].starts += 1;
      this.persist();
    }
  }

  public submitQuizAnswers(
    shortId: string,
    participantName: string,
    participantEmoji: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>
  ): QuizSubmission | null {
    const quiz = this.db.quizzes[shortId];
    if (!quiz || !quiz.questions || quiz.status !== 'published') {
      return null;
    }

    const cleanName = participantName.trim() || 'Anonymous Friend';
    const cleanEmoji = participantEmoji || '🦊';

    let score = 0;
    const answeredMap = new Map<string, string>();
    answers.forEach(a => answeredMap.set(a.questionId, a.selectedOptionId));

    const evaluatedAnswers = quiz.questions.map(q => {
      const selectedId = answeredMap.get(q.id);
      const chosenOpt = q.options.find(o => o.id === selectedId) || { id: '', text: 'No answer', isCorrect: false };
      const correctOpt = q.options.find(o => o.isCorrect) || q.options[0];
      const isCorrect = Boolean(chosenOpt && chosenOpt.isCorrect);

      if (isCorrect) {
        score++;
      }

      return {
        questionId: q.id,
        questionText: q.text,
        selectedOptionId: chosenOpt.id,
        selectedOptionText: chosenOpt.text,
        correctOptionId: correctOpt.id,
        correctOptionText: correctOpt.text,
        isCorrect,
      };
    });

    const total = quiz.questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const tier = calculateResultTier(score, total);

    const submission: QuizSubmission = {
      id: `sub_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      quizId: quiz.id,
      shortId,
      participantName: cleanName,
      participantEmoji: cleanEmoji,
      score,
      totalQuestions: total,
      percentage,
      resultTier: tier,
      createdAt: new Date().toISOString(),
      answers: evaluatedAnswers,
    };

    if (!this.db.submissions[shortId]) {
      this.db.submissions[shortId] = [];
    }
    this.db.submissions[shortId].unshift(submission);

    quiz.completionsCount = (quiz.completionsCount || 0) + 1;
    if (!this.db.analytics[shortId]) {
      this.db.analytics[shortId] = { views: 0, starts: 0, completions: 0 };
    }
    this.db.analytics[shortId].completions += 1;

    this.persist();
    return submission;
  }

  public getSubmission(shortId: string, submissionId: string): QuizSubmission | null {
    const list = this.db.submissions[shortId];
    if (!list) return null;
    return list.find(s => s.id === submissionId) || null;
  }

  public getDashboardData(shortId: string, token: string): CreatorDashboardData | null {
    const quiz = this.db.quizzes[shortId];
    if (!quiz || quiz.creatorToken !== token) {
      return null;
    }

    const subs = this.db.submissions[shortId] || [];
    const totalViews = quiz.viewsCount || 0;
    const totalStarts = quiz.startsCount || 0;
    const totalCompletions = subs.length;
    const completionRate = totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 0;

    let averageScore = 0;
    let averagePercentage = 0;
    let highestScore = 0;
    let lowestScore = quiz.questionsCount;

    if (subs.length > 0) {
      const sum = subs.reduce((acc, s) => acc + s.score, 0);
      averageScore = Math.round((sum / subs.length) * 10) / 10;
      averagePercentage = Math.round((subs.reduce((acc, s) => acc + s.percentage, 0) / subs.length));
      highestScore = Math.max(...subs.map(s => s.score));
      lowestScore = Math.min(...subs.map(s => s.score));
    } else {
      lowestScore = 0;
    }

    // Score distribution buckets: 90-100%, 70-89%, 50-69%, 25-49%, 0-24%
    const distributionMap: Record<string, number> = {
      '90-100%': 0,
      '70-89%': 0,
      '50-69%': 0,
      '25-49%': 0,
      '0-24%': 0,
    };

    subs.forEach(s => {
      if (s.percentage >= 90) distributionMap['90-100%']++;
      else if (s.percentage >= 70) distributionMap['70-89%']++;
      else if (s.percentage >= 50) distributionMap['50-69%']++;
      else if (s.percentage >= 25) distributionMap['25-49%']++;
      else distributionMap['0-24%']++;
    });

    const scoreDistribution = Object.entries(distributionMap).map(([range, count]) => ({
      range,
      count,
      percentage: subs.length > 0 ? Math.round((count / subs.length) * 100) : 0,
    }));

    // Question stats
    const questionStats: QuestionStat[] = (quiz.questions || []).map((q, idx) => {
      let correctCount = 0;
      let totalAnswers = 0;

      subs.forEach(s => {
        const ans = s.answers?.find(a => a.questionId === q.id);
        if (ans) {
          totalAnswers++;
          if (ans.isCorrect) correctCount++;
        }
      });

      const correctRate = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

      return {
        questionId: q.id,
        text: q.text,
        orderNum: idx + 1,
        totalAnswers,
        correctAnswers: correctCount,
        correctRate,
      };
    });

    if (questionStats.length > 1 && subs.length > 0) {
      const sortedByRate = [...questionStats].sort((a, b) => a.correctRate - b.correctRate);
      const hardestId = sortedByRate[0].questionId;
      const easiestId = sortedByRate[sortedByRate.length - 1].questionId;

      questionStats.forEach(stat => {
        if (stat.questionId === hardestId) stat.isHardest = true;
        if (stat.questionId === easiestId && stat.correctRate > sortedByRate[0].correctRate) stat.isEasiest = true;
      });
    }

    return {
      quiz,
      submissions: subs,
      analytics: {
        totalViews,
        totalStarts,
        totalCompletions,
        completionRate,
        averageScore,
        averagePercentage,
        highestScore,
        lowestScore,
        scoreDistribution,
        questionStats,
      },
    };
  }
}

export const storage = new StorageEngine();
