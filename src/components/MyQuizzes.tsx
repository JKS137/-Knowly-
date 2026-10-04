import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  PlusCircle,
  Copy,
  Check,
  ExternalLink,
  Users,
  Eye,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Quiz } from '../types/quiz';
import { api } from '../utils/api';
import { clientStorage } from '../utils/storageClient';

interface MyQuizzesProps {
  onNavigateToDashboard: (shortId: string) => void;
  onNavigateToQuiz: (shortId: string) => void;
  onCreateNewQuiz: () => void;
  onTryDemo: () => void;
}

export const MyQuizzes: React.FC<MyQuizzesProps> = ({
  onNavigateToDashboard,
  onNavigateToQuiz,
  onCreateNewQuiz,
  onTryDemo,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const tokens = clientStorage.getCreatorTokens().map(entry => entry.token);

    // Also include demo token so user can always inspect demo dashboard if wanted
    const fullTokens = Array.from(new Set([...tokens, 'token_demo_maya']));

    api.getMyQuizzes(fullTokens)
      .then(list => setQuizzes(list))
      .catch(err => console.error('Failed to fetch my quizzes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = (shortId: string) => {
    const url = `${window.location.origin}/q/${shortId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold text-stone-500">Loading your tests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            My Tests & Dashboards
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Manage your tests, view live leaderboards, and check how friends scored.
          </p>
        </div>

        <button
          onClick={onCreateNewQuiz}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Test</span>
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-2xl">
            📝
          </div>
          <h3 className="font-heading font-black text-xl text-stone-900">
            No tests created yet
          </h3>
          <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Create your first personalized test in under 2 minutes, get your private shareable link, and send it to your friends.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onCreateNewQuiz}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Create a Test Now
            </button>
            <button
              onClick={onTryDemo}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all"
            >
              Explore Maya's Demo Test
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {quizzes.map(quiz => (
            <div
              key={quiz.shortId}
              className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-sm hover:border-stone-300 transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className="font-mono text-stone-700">/q/{quiz.shortId}</span>
                  <span
                    className={`font-semibold ${
                      quiz.status === 'published' ? 'text-emerald-600' : 'text-stone-500'
                    }`}
                  >
                    {quiz.status === 'published' ? 'Active' : 'Closed'}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-stone-900 leading-snug">
                  {quiz.title}
                </h3>

                {quiz.description && (
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                    {quiz.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-stone-500 pt-3">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                    <span>{quiz.questionsCount} Questions</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{quiz.completionsCount} Responses</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-stone-400" />
                    <span>{quiz.viewsCount} Views</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                <button
                  onClick={() => onNavigateToDashboard(quiz.shortId)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleCopyLink(quiz.shortId)}
                  className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                  title="Copy Share Link"
                >
                  {copiedId === quiz.shortId ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => onNavigateToQuiz(quiz.shortId)}
                  className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                  title="Open Quiz"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
