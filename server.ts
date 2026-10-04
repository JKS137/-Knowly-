import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { storage } from './src/server/storage.ts';
import { generateQuizOgImage, generateResultOgImage } from './src/server/ogGenerator.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '1mb' }));

// Simple in-memory rate limiter for submissions
const submissionIpCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimitSubmissions(req: Request, res: Response, next: () => void) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = submissionIpCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    submissionIpCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return next();
  }

  if (entry.count >= 20) {
    return res.status(429).json({ error: 'Too many submissions. Please wait a minute and try again.' });
  }

  entry.count++;
  next();
}

// --- API Routes ---

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Knowly API', time: new Date().toISOString() });
});

// Create a new test
app.post('/api/quizzes', (req, res) => {
  try {
    const { title, description, creatorName, theme, questions } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Quiz title is required' });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'At least one question is required' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || typeof q.text !== 'string' || q.text.trim().length === 0) {
        return res.status(400).json({ error: `Question #${i + 1} cannot be empty` });
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ error: `Question #${i + 1} must have at least 2 options` });
      }
      const hasCorrect = q.options.some((opt: { isCorrect: boolean }) => opt.isCorrect);
      if (!hasCorrect) {
        return res.status(400).json({ error: `Question #${i + 1} must have a marked correct answer` });
      }
    }

    const result = storage.createQuiz({
      title,
      description: description || '',
      creatorName: creatorName || 'Anonymous',
      theme: theme || 'terracotta',
      questions,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Fetch my tests by creator tokens
app.post('/api/quizzes/my-list', (req, res) => {
  try {
    const { tokens } = req.body;
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.json({ quizzes: [] });
    }
    const quizzes = storage.getQuizzesByTokens(tokens);
    res.json({ quizzes });
  } catch (err) {
    console.error('Fetch my quizzes error:', err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Dynamic OG Image for Quiz Links
app.get('/api/og/quiz/:shortId', (req, res) => {
  try {
    const { shortId } = req.params;
    const quiz = storage.getQuizByShortId(shortId);
    if (!quiz) {
      return res.status(404).send('Quiz not found');
    }
    const svg = generateQuizOgImage(quiz);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(svg);
  } catch (err) {
    console.error('OG image quiz error:', err);
    res.status(500).send('Failed to generate OG image');
  }
});

// Dynamic OG Image for Participant Result Scorecards
app.get('/api/og/result/:shortId/:submissionId', (req, res) => {
  try {
    const { shortId, submissionId } = req.params;
    const quiz = storage.getQuizByShortId(shortId);
    if (!quiz) {
      return res.status(404).send('Quiz not found');
    }
    const submission = storage.getSubmission(shortId, submissionId);
    if (!submission) {
      return res.status(404).send('Submission not found');
    }
    const svg = generateResultOgImage(submission, quiz);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(svg);
  } catch (err) {
    console.error('OG image result error:', err);
    res.status(500).send('Failed to generate OG image');
  }
});

// Get public test data (sanitized, no isCorrect!)
app.get('/api/quizzes/:shortId', (req, res) => {
  try {
    const { shortId } = req.params;
    const quiz = storage.getPublicQuiz(shortId);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found or may have been deleted' });
    }

    res.json(quiz);
  } catch (err) {
    console.error('Get public quiz error:', err);
    res.status(500).json({ error: 'Failed to retrieve quiz' });
  }
});

// Record quiz view
app.post('/api/quizzes/:shortId/view', (req, res) => {
  try {
    const { shortId } = req.params;
    storage.recordView(shortId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// Record quiz start
app.post('/api/quizzes/:shortId/start', (req, res) => {
  try {
    const { shortId } = req.params;
    storage.recordStart(shortId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to record start' });
  }
});

// Submit quiz answers (scored server-side)
app.post('/api/quizzes/:shortId/submit', rateLimitSubmissions, (req, res) => {
  try {
    const { shortId } = req.params;
    const { participantName, participantEmoji, answers } = req.body;

    if (!participantName || typeof participantName !== 'string' || participantName.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a nickname' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be provided' });
    }

    const submission = storage.submitQuizAnswers(
      shortId,
      participantName.trim(),
      participantEmoji || '🦊',
      answers
    );

    if (!submission) {
      return res.status(404).json({ error: 'Quiz is either closed, not found, or in draft mode' });
    }

    res.status(201).json(submission);
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Failed to submit quiz answers' });
  }
});

// Get single submission result (for participant results page)
app.get('/api/quizzes/:shortId/submissions/:submissionId', (req, res) => {
  try {
    const { shortId, submissionId } = req.params;
    const submission = storage.getSubmission(shortId, submissionId);

    if (!submission) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Get submission error:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

// Creator private dashboard
app.get('/api/quizzes/:shortId/dashboard', (req, res) => {
  try {
    const { shortId } = req.params;
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Creator access token is required' });
    }

    const data = storage.getDashboardData(shortId, token);
    if (!data) {
      return res.status(403).json({ error: 'Access denied: Invalid creator token or quiz does not exist' });
    }

    res.json(data);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Update quiz (creator only)
app.put('/api/quizzes/:shortId', (req, res) => {
  try {
    const { shortId } = req.params;
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Creator token required' });
    }

    const updated = storage.updateQuiz(shortId, token, req.body);
    if (!updated) {
      return res.status(403).json({ error: 'Quiz not found or unauthorized' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Update quiz error:', err);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Delete quiz (creator only)
app.delete('/api/quizzes/:shortId', (req, res) => {
  try {
    const { shortId } = req.params;
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Creator token required' });
    }

    const deleted = storage.deleteQuiz(shortId, token);
    if (!deleted) {
      return res.status(403).json({ error: 'Unauthorized or quiz not found' });
    }

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// Duplicate quiz (creator only)
app.post('/api/quizzes/:shortId/duplicate', (req, res) => {
  try {
    const { shortId } = req.params;
    const token = (req.query.token as string) || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Creator token required' });
    }

    const duplicated = storage.duplicateQuiz(shortId, token);
    if (!duplicated) {
      return res.status(403).json({ error: 'Unauthorized or quiz not found' });
    }

    res.status(201).json(duplicated);
  } catch (err) {
    console.error('Duplicate quiz error:', err);
    res.status(500).json({ error: 'Failed to duplicate quiz' });
  }
});

// --- Vite Middleware in Dev or Static in Production ---

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Knowly] Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
