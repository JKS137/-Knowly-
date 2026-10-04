import { Quiz, QuizSubmission, CreatorDashboardData } from '../types/quiz';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      if (data && data.error) errorMsg = data.error;
    } catch {}
    throw new ApiError(errorMsg, res.status);
  }
  return res.json();
}

export const api = {
  async createQuiz(payload: {
    title: string;
    description: string;
    creatorName: string;
    theme: string;
    questions: Array<{
      text: string;
      type: string;
      options: Array<{ text: string; isCorrect: boolean }>;
    }>;
  }): Promise<{ quiz: Quiz; shortId: string; creatorToken: string }> {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMyQuizzes(tokens: string[]): Promise<Quiz[]> {
    if (tokens.length === 0) return [];
    const res = await fetch('/api/quizzes/my-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokens }),
    });
    const data = await handleResponse<{ quizzes: Quiz[] }>(res);
    return data.quizzes || [];
  },

  async getPublicQuiz(shortId: string): Promise<Quiz> {
    const res = await fetch(`/api/quizzes/${encodeURIComponent(shortId)}`);
    return handleResponse(res);
  },

  async recordView(shortId: string): Promise<void> {
    try {
      await fetch(`/api/quizzes/${encodeURIComponent(shortId)}/view`, { method: 'POST' });
    } catch {}
  },

  async recordStart(shortId: string): Promise<void> {
    try {
      await fetch(`/api/quizzes/${encodeURIComponent(shortId)}/start`, { method: 'POST' });
    } catch {}
  },

  async submitQuiz(
    shortId: string,
    participantName: string,
    participantEmoji: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>
  ): Promise<QuizSubmission> {
    const res = await fetch(`/api/quizzes/${encodeURIComponent(shortId)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantName, participantEmoji, answers }),
    });
    return handleResponse(res);
  },

  async getSubmissionResult(shortId: string, submissionId: string): Promise<QuizSubmission> {
    const res = await fetch(
      `/api/quizzes/${encodeURIComponent(shortId)}/submissions/${encodeURIComponent(submissionId)}`
    );
    return handleResponse(res);
  },

  async getDashboard(shortId: string, token: string): Promise<CreatorDashboardData> {
    const res = await fetch(
      `/api/quizzes/${encodeURIComponent(shortId)}/dashboard?token=${encodeURIComponent(token)}`
    );
    return handleResponse(res);
  },

  async updateQuiz(
    shortId: string,
    token: string,
    payload: Partial<Quiz>
  ): Promise<Quiz> {
    const res = await fetch(
      `/api/quizzes/${encodeURIComponent(shortId)}?token=${encodeURIComponent(token)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    return handleResponse(res);
  },

  async deleteQuiz(shortId: string, token: string): Promise<void> {
    const res = await fetch(
      `/api/quizzes/${encodeURIComponent(shortId)}?token=${encodeURIComponent(token)}`,
      {
        method: 'DELETE',
      }
    );
    await handleResponse(res);
  },

  async duplicateQuiz(shortId: string, token: string): Promise<{ quiz: Quiz; shortId: string; creatorToken: string }> {
    const res = await fetch(
      `/api/quizzes/${encodeURIComponent(shortId)}/duplicate?token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
      }
    );
    return handleResponse(res);
  },
};
