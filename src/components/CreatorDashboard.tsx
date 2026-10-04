import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  CheckCircle2,
  TrendingUp,
  Award,
  Share2,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { CreatorDashboardData, QuizSubmission } from '../types/quiz';
import { api } from '../utils/api';
import { clientStorage } from '../utils/storageClient';
import { PublishSuccessModal } from './PublishSuccessModal';

interface CreatorDashboardProps {
  shortId: string;
  onNavigateHome: () => void;
  onNavigateToQuiz: (shortId: string) => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  shortId,
  onNavigateHome,
  onNavigateToQuiz,
}) => {
  const [data, setData] = useState<CreatorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  // Status toggle & delete confirmation
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboard = (token: string) => {
    setLoading(true);
    setError(null);
    api.getDashboard(shortId, token)
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Unauthorized: Invalid creator token');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Look up token in clientStorage
    const storedToken = clientStorage.getCreatorToken(shortId);
    if (storedToken) {
      setTokenInput(storedToken);
      fetchDashboard(storedToken);
    } else {
      setLoading(false);
      setError('Creator access token required');
    }
  }, [shortId]);

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    clientStorage.saveCreatorToken(shortId, tokenInput.trim(), 'Test');
    fetchDashboard(tokenInput.trim());
  };

  const handleToggleStatus = async () => {
    if (!data) return;
    const token = clientStorage.getCreatorToken(shortId) || tokenInput;
    const newStatus = data.quiz.status === 'published' ? 'closed' : 'published';

    setIsUpdatingStatus(true);
    try {
      const updated = await api.updateQuiz(shortId, token, { status: newStatus });
      setData(prev => (prev ? { ...prev, quiz: updated } : null));
    } catch (err: any) {
      alert(err.message || 'Failed to update quiz status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!data) return;
    const token = clientStorage.getCreatorToken(shortId) || tokenInput;

    setIsDeleting(true);
    try {
      await api.deleteQuiz(shortId, token);
      clientStorage.removeCreatorToken(shortId);
      setShowDeleteModal(false);
      onNavigateHome();
    } catch (err: any) {
      alert(err.message || 'Failed to delete quiz');
      setIsDeleting(false);
    }
  };

  // 1. Loading
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center animate-spin mb-4 text-orange-600">
          <RotateCcw className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-stone-700">Loading creator dashboard...</p>
      </div>
    );
  }

  // 2. Token Input Fallback
  if (!data || error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-black text-2xl text-stone-900">
            Creator Authorization
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            This dashboard is private to the test creator. Enter the creator token you received when creating this quiz.
          </p>

          <form onSubmit={handleManualTokenSubmit} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Creator Token
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="Enter secret token..."
                className="w-full text-sm font-mono px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
              />
            </div>
            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Access Dashboard
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { quiz, submissions, analytics } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-xs text-stone-500 font-medium">
            <span>Quiz ID: <span className="font-mono text-stone-800">{quiz.shortId}</span></span>
            <span aria-hidden="true">·</span>
            <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`font-semibold ${
                quiz.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {quiz.status === 'published' ? 'Active' : 'Closed'}
            </span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            {quiz.title}
          </h1>

          <p className="text-xs text-stone-500">
            Created by <span className="text-stone-800 font-semibold">{quiz.creatorName}</span> · {quiz.questionsCount} Questions
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Quiz</span>
          </button>

          <button
            onClick={() => onNavigateToQuiz(quiz.shortId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-4 h-4 text-stone-500" />
            <span>Open Link</span>
          </button>

          <button
            onClick={handleToggleStatus}
            disabled={isUpdatingStatus}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              quiz.status === 'published'
                ? 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {quiz.status === 'published' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{quiz.status === 'published' ? 'Close Quiz' : 'Re-open Quiz'}</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
            title="Delete Quiz"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards (Zero generic pill slop, clean unboxed typography) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Total Participants</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
            {analytics.totalCompletions}
          </div>
          <div className="text-xs text-stone-500 flex items-center gap-1">
            <span>{analytics.totalStarts} started</span>
            <span>·</span>
            <span className="text-emerald-600 font-semibold">{analytics.completionRate}% completion</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-orange-600">
            {analytics.averageScore} <span className="text-base text-stone-400 font-normal">/ {quiz.questionsCount}</span>
          </div>
          <div className="text-xs text-stone-500">
            {analytics.averagePercentage}% average friend match
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Highest Score</span>
            <Award className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
            {analytics.highestScore} <span className="text-base text-stone-400 font-normal">/ {quiz.questionsCount}</span>
          </div>
          <div className="text-xs text-stone-500">
            Lowest score recorded: {analytics.lowestScore}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold uppercase tracking-wider">
            <span>Total Link Views</span>
            <Eye className="w-4 h-4 text-stone-400" />
          </div>
          <div className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
            {analytics.totalViews}
          </div>
          <div className="text-xs text-stone-500">
            Engagement: {analytics.totalViews > 0 ? Math.round((analytics.totalStarts / analytics.totalViews) * 100) : 0}% click-to-start
          </div>
        </div>
      </div>

      {/* 2-Column: Score Distribution & Question Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-heading font-bold text-lg text-stone-900">
              Score Distribution
            </h3>
            <p className="text-xs text-stone-500">
              How well your friends performed across tiers
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {analytics.scoreDistribution.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                  <span>{item.range}</span>
                  <span className="text-stone-500">
                    {item.count} friends ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Performance */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Question Accuracy
              </h3>
              <p className="text-xs text-stone-500">
                Which questions friends answered correctly
              </p>
            </div>
            <Flame className="w-5 h-5 text-orange-600" />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {analytics.questionStats.map(qStat => (
              <div
                key={qStat.questionId}
                className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-stone-800 leading-snug">
                    <span className="text-stone-400 mr-1.5 font-mono">Q{qStat.orderNum}</span>
                    {qStat.text}
                  </p>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-extrabold text-stone-900 block">
                      {qStat.correctRate}%
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {qStat.correctAnswers}/{qStat.totalAnswers} correct
                    </span>
                  </div>
                </div>

                {qStat.isHardest && (
                  <span className="inline-block text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    Hardest Question (Most Missed)
                  </span>
                )}
                {qStat.isEasiest && (
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Easiest Question (Most Accurate)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Participants Leaderboard Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-heading font-black text-xl text-stone-900">
              Friend Leaderboard ({submissions.length})
            </h3>
            <p className="text-xs text-stone-500">
              Click any participant to inspect their chosen answers and mistakes
            </p>
          </div>

          {submissions.length > 0 && (
            <span className="text-xs font-semibold text-stone-400">
              Sorted by highest score
            </span>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-xl">
              💌
            </div>
            <h4 className="font-heading font-bold text-base text-stone-800">
              No submissions yet!
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Share your test link with friends or group chats to start discovering who knows you best.
            </p>
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Quiz Link</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {submissions.map((sub, idx) => {
              const isExpanded = expandedSubmissionId === sub.id;
              return (
                <div key={sub.id} className="py-3.5">
                  <div
                    onClick={() =>
                      setExpandedSubmissionId(isExpanded ? null : sub.id)
                    }
                    className="flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70 p-2.5 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-xs font-bold text-stone-400 text-center font-mono">
                        #{idx + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl shrink-0">
                        {sub.participantEmoji}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-stone-900">
                          {sub.participantName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500">
                          <span>{sub.resultTier.title}</span>
                          <span>·</span>
                          <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-heading font-black text-base text-stone-900">
                          {sub.score} / {sub.totalQuestions}
                        </span>
                        <span className="block text-[11px] font-bold text-orange-600">
                          {sub.percentage}%
                        </span>
                      </div>
                      <div className="text-stone-400 p-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded answers inspector */}
                  {isExpanded && sub.answers && (
                    <div className="mt-3 p-4 bg-stone-50/80 rounded-2xl border border-stone-200/60 space-y-2.5 animate-in fade-in">
                      <h5 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {sub.participantName}'s Answers Breakdown
                      </h5>
                      <div className="space-y-2">
                        {sub.answers.map((ans, aIdx) => (
                          <div
                            key={aIdx}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                              ans.isCorrect
                                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                                : 'bg-rose-50/60 border-rose-200 text-rose-950'
                            }`}
                          >
                            <div>
                              <p className="font-medium text-stone-800">
                                <span className="font-mono text-stone-400 mr-1.5">
                                  #{aIdx + 1}
                                </span>
                                {ans.questionText}
                              </p>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Selected: <span className="font-semibold text-stone-800">{ans.selectedOptionText}</span>
                                {!ans.isCorrect && (
                                  <span> · Correct answer: <span className="text-emerald-700 font-semibold">{ans.correctOptionText}</span></span>
                                )}
                              </p>
                            </div>
                            <span className="shrink-0 font-bold">
                              {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <PublishSuccessModal
          isOpen={true}
          onClose={() => setShowShareModal(false)}
          shortId={quiz.shortId}
          title={quiz.title}
          creatorName={quiz.creatorName}
          onNavigateToQuiz={onNavigateToQuiz}
          onNavigateToDashboard={() => setShowShareModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center space-y-4 shadow-2xl border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-stone-900">
              Delete this test?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              This action cannot be undone. All collected responses and statistics will be permanently removed.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteQuiz}
                disabled={isDeleting}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
