import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Share2,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  Lock,
  Download,
  MessageCircle,
  Twitter,
} from 'lucide-react';
import { Quiz, QuizSubmission, QuizQuestion } from '../types/quiz';
import { QUIZ_THEMES } from '../utils/theme';
import { api } from '../utils/api';
import { clientStorage } from '../utils/storageClient';
import { generateShareLinks } from '../utils/scoring';
import {
  shareSubmissionResult,
  canUseWebShare,
  getResultOgImageUrl,
  downloadScorecardImage,
} from '../utils/share';

interface ParticipantQuizProps {
  shortId: string;
  onNavigateHome: () => void;
  onCreateNewQuiz: () => void;
}

const AVATAR_OPTIONS = [
  '🦊', '🐼', '⚡️', '🍕', '🚀', '🌸', '🎸', '🎮',
  '☕️', '🥑', '🦁', '🦄', '🏄', '🎧', '🍦', '🏀',
];

export const ParticipantQuiz: React.FC<ParticipantQuizProps> = ({
  shortId,
  onNavigateHome,
  onCreateNewQuiz,
}) => {
  // Loading & quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Participant details
  const [step, setStep] = useState<'welcome' | 'answering' | 'submitting' | 'results'>('welcome');
  const [nickname, setNickname] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🦊');

  // Answering state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Submission results
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);

  useEffect(() => {
    // Load stored profile if available
    const profile = clientStorage.getParticipantProfile();
    if (profile.nickname) setNickname(profile.nickname);
    if (profile.emoji) setSelectedEmoji(profile.emoji);

    // Fetch quiz data
    setLoading(true);
    setError(null);

    api.getPublicQuiz(shortId)
      .then(data => {
        setQuiz(data);
        // Record public view
        api.recordView(shortId);
      })
      .catch(err => {
        console.error('Quiz fetch error:', err);
        setError(err.message || 'Quiz could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, [shortId]);

  // Handle start test
  const handleStartTest = () => {
    if (!nickname.trim()) {
      setValidationMsg('Please enter a nickname before starting.');
      return;
    }
    setValidationMsg(null);
    clientStorage.saveParticipantProfile(nickname, selectedEmoji);
    api.recordStart(shortId);
    setStep('answering');
  };

  // Option selection
  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Next question
  const handleNext = () => {
    if (!quiz || !quiz.questions) return;
    const currentQ = quiz.questions[currentQuestionIndex];
    if (!selectedAnswers[currentQ.id]) {
      setValidationMsg('Please choose an answer to proceed.');
      return;
    }
    setValidationMsg(null);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  // Previous question
  const handlePrev = () => {
    setValidationMsg(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit test to backend
  const handleSubmit = async () => {
    if (!quiz || !quiz.questions) return;
    setShowConfirmSubmit(false);
    setStep('submitting');

    try {
      const answersPayload = quiz.questions.map(q => ({
        questionId: q.id,
        selectedOptionId: selectedAnswers[q.id] || '',
      }));

      const result = await api.submitQuiz(
        shortId,
        nickname.trim(),
        selectedEmoji,
        answersPayload
      );

      setSubmissionResult(result);
      setStep('results');

      // Trigger celebratory confetti if score is decent
      if (result.percentage >= 50) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setValidationMsg(err.message || 'Failed to submit answers. Please try again.');
      setStep('answering');
    }
  };

  const [downloadingCard, setDownloadingCard] = useState(false);

  const handleShareResult = async () => {
    if (!submissionResult || !quiz) return;
    const res = await shareSubmissionResult(submissionResult, quiz);
    if (res.method === 'clipboard' && res.success) {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2500);
    }
  };

  const handleDownloadCard = async () => {
    if (!submissionResult || !quiz) return;
    setDownloadingCard(true);
    try {
      await downloadScorecardImage(submissionResult, quiz);
    } catch (e) {
      console.error('Failed to download card:', e);
    } finally {
      setDownloadingCard(false);
    }
  };

  const themeConfig = quiz ? QUIZ_THEMES[quiz.theme] || QUIZ_THEMES.terracotta : QUIZ_THEMES.terracotta;

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center animate-bounce mb-4 text-orange-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-stone-700">Loading test...</p>
      </div>
    );
  }

  // 2. Error State
  if (error || !quiz) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-stone-900">
          Test Not Available
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          {error || 'This test could not be found. It may have been closed or deleted by its creator.'}
        </p>
        <div className="pt-4">
          <button
            onClick={onNavigateHome}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Go to Knowly Home
          </button>
        </div>
      </div>
    );
  }

  // 3. Quiz Closed State
  if (quiz.status === 'closed') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-stone-900">
          This Test is Closed
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          The creator has closed submissions for "{quiz.title}". You can create your own test or explore others!
        </p>
        <div className="pt-4">
          <button
            onClick={onCreateNewQuiz}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            Create Your Own Test
          </button>
        </div>
      </div>
    );
  }

  // 4. STEP 1: WELCOME & NICKNAME
  if (step === 'welcome') {
    return (
      <div className={`min-h-[85vh] flex items-center justify-center p-4 sm:p-6 ${themeConfig.bgClass}`}>
        <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-xl ${themeConfig.cardBgClass}`}>
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <span className="text-xs uppercase tracking-wider font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              Created by {quiz.creatorName}
            </span>
            <h1 className={`font-heading font-black text-2xl sm:text-3xl leading-tight ${themeConfig.headingClass}`}>
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className={`text-sm leading-relaxed ${themeConfig.mutedTextClass}`}>
                {quiz.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 text-xs opacity-75 pt-1">
              <span>{quiz.questions?.length || quiz.questionsCount} Questions</span>
              <span>·</span>
              <span>Takes ~2 mins</span>
              <span>·</span>
              <span>Instant Score</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Choose an Avatar Emoji
              </label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-stone-100/70 rounded-2xl">
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`h-9 flex items-center justify-center text-lg rounded-xl transition-transform active:scale-90 ${
                      selectedEmoji === emoji
                        ? 'bg-white shadow-sm ring-2 ring-orange-500 scale-110'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Your Nickname *
              </label>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-xl shrink-0 border border-stone-200">
                  {selectedEmoji}
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Enter your name or handle..."
                  maxLength={30}
                  className="w-full text-base font-semibold px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                No sign-up or email required. Your score will appear on {quiz.creatorName}'s leaderboard!
              </p>
            </div>

            {validationMsg && (
              <p className="text-xs text-rose-600 font-medium">{validationMsg}</p>
            )}

            <button
              onClick={handleStartTest}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base transition-all active:scale-[0.98] ${themeConfig.primaryButtonClass}`}
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. STEP 2: ANSWERING QUESTIONS
  if (step === 'answering' && quiz.questions) {
    const currentQ = quiz.questions[currentQuestionIndex];
    const totalQ = quiz.questions.length;
    const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQ) * 100);
    const selectedOptionId = selectedAnswers[currentQ.id];

    return (
      <div className={`min-h-[85vh] flex items-center justify-center p-4 sm:p-6 ${themeConfig.bgClass}`}>
        <div className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-xl flex flex-col justify-between min-h-[500px] ${themeConfig.cardBgClass}`}>
          {/* Top Progress */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold opacity-70 mb-2">
              <span>Question {currentQuestionIndex + 1} of {totalQ}</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="h-2 w-full bg-stone-200/60 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full rounded-full transition-all duration-300 ${themeConfig.progressBarClass}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="mb-6">
              <span className="text-xs font-bold text-orange-600 tracking-wide uppercase block mb-1">
                Question {String(currentQuestionIndex + 1).padStart(2, '0')}
              </span>
              <h2 className={`font-heading font-extrabold text-xl sm:text-2xl leading-snug ${themeConfig.headingClass}`}>
                {currentQ.text}
              </h2>
            </div>

            {/* Options list */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-medium transition-all active:scale-[0.99] flex items-center justify-between ${
                      isSelected
                        ? themeConfig.optionSelectedClass
                        : themeConfig.optionBaseClass
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-stone-200/50 flex items-center justify-center text-xs font-bold opacity-70 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {validationMsg && (
              <p className="text-xs text-rose-600 font-semibold mb-4">{validationMsg}</p>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 disabled:opacity-30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${themeConfig.primaryButtonClass}`}
            >
              <span>{currentQuestionIndex === totalQ - 1 ? 'Finish & Submit' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center space-y-4 shadow-2xl border border-stone-200">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl">
                🏁
              </div>
              <h3 className="font-heading font-bold text-xl text-stone-900">
                Ready to submit?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                You've answered all questions for {quiz.creatorName}. Ready to see your final score and ranking?
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all"
                >
                  Review Answers
                </button>
                <button
                  onClick={handleSubmit}
                  className="py-2.5 px-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. SUBMITTING STATE
  if (step === 'submitting') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center animate-spin text-orange-600 mb-4">
          <RotateCcw className="w-7 h-7" />
        </div>
        <h3 className="font-heading font-bold text-xl text-stone-900 mb-1">
          Calculating your score...
        </h3>
        <p className="text-xs text-stone-500">Checking answers securely on the server</p>
      </div>
    );
  }

  // 7. STEP 3: RESULTS & CELEBRATION
  if (step === 'results' && submissionResult) {
    return (
      <div className={`min-h-[85vh] py-8 px-4 sm:px-6 ${themeConfig.bgClass}`}>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Score Card */}
          <div className={`rounded-3xl p-6 sm:p-8 border shadow-xl text-center space-y-5 ${themeConfig.cardBgClass}`}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{submissionResult.participantEmoji}</span>
              <span className="font-heading font-bold text-lg text-stone-800">
                {submissionResult.participantName}'s Result
              </span>
            </div>

            {/* Score Ring / Hero */}
            <div className="py-2">
              <div className="inline-block p-6 rounded-3xl bg-stone-50 border border-stone-200/80 shadow-inner">
                <div className="font-heading font-black text-5xl sm:text-6xl text-orange-600 tracking-tight">
                  {submissionResult.score} / {submissionResult.totalQuestions}
                </div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest mt-1">
                  {submissionResult.percentage}% Match
                </div>
              </div>
            </div>

            {/* Tier feedback */}
            <div className="space-y-2 max-w-md mx-auto">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${submissionResult.resultTier.color}`}>
                {submissionResult.resultTier.badge}
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-stone-900">
                {submissionResult.resultTier.title}
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                {submissionResult.resultTier.subtitle}
              </p>
            </div>

            {/* Dynamic Social Scorecard (OG Image) Preview */}
            <div className="pt-2 text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
                <span className="flex items-center gap-1.5 text-stone-800">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Your Shareable Scorecard</span>
                </span>
                <button
                  onClick={handleDownloadCard}
                  disabled={downloadingCard}
                  className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingCard ? 'Generating...' : 'Save Image'}</span>
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-950 aspect-[1200/630] relative group">
                <img
                  src={getResultOgImageUrl(shortId, submissionResult.id)}
                  alt="Scorecard preview"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadCard}
                    className="px-4 py-2 rounded-xl bg-white/95 text-stone-900 text-xs font-bold shadow-lg flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-orange-600" />
                    <span>Download Scorecard</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Share / Social Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={handleShareResult}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
                >
                  {copiedResult ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedResult ? 'Result Link Copied!' : canUseWebShare() ? 'Share Result' : 'Copy Result Link'}</span>
                </button>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `I just scored ${submissionResult.score}/${submissionResult.totalQuestions} (${submissionResult.percentage}%) on ${quiz.creatorName}'s quiz on Knowly! ⭐️ ${submissionResult.resultTier.title}. Think you know them better? Try it here: ${window.location.origin}/q/${quiz.shortId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `I scored ${submissionResult.score}/${submissionResult.totalQuestions} on ${quiz.creatorName}'s quiz on Knowly! ⭐️ Can you beat me?`
                  )}&url=${encodeURIComponent(`${window.location.origin}/q/${quiz.shortId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold border border-sky-200 transition-all"
                >
                  <Twitter className="w-4 h-4 text-sky-600" />
                  <span>X / Tweet</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={onCreateNewQuiz}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold shadow-sm active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Your Own Test to Challenge {quiz.creatorName}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Question Answers Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-heading font-bold text-lg text-stone-900">
                Answer Breakdown
              </h3>
              <span className="text-xs text-stone-500">
                Revealing {quiz.creatorName}'s true answers
              </span>
            </div>

            <div className="space-y-3">
              {submissionResult.answers.map((ans, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-sm space-y-2 transition-all ${
                    ans.isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-stone-900 text-sm">
                      <span className="text-stone-400 mr-2 font-mono text-xs">
                        #{idx + 1}
                      </span>
                      {ans.questionText}
                    </p>
                    {ans.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200/60">
                      <span className="text-stone-500 block text-[11px] mb-0.5">You Chose:</span>
                      <span className={ans.isCorrect ? 'text-emerald-800 font-semibold' : 'text-rose-800 font-semibold'}>
                        {ans.selectedOptionText || 'No answer'}
                      </span>
                    </div>

                    {!ans.isCorrect && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200/60">
                        <span className="text-stone-500 block text-[11px] mb-0.5">{quiz.creatorName}'s Answer:</span>
                        <span className="text-emerald-800 font-semibold">
                          {ans.correctOptionText}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Viral CTA Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg space-y-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-heading font-black text-xl">
                Now it's your turn!
              </h4>
              <p className="text-xs text-orange-100 max-w-sm mt-0.5">
                Build a test about yourself, send it to {quiz.creatorName} and your other friends, and see who scores highest!
              </p>
            </div>
            <button
              onClick={onCreateNewQuiz}
              className="py-3 px-6 bg-white text-orange-700 hover:bg-orange-50 font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              Start My Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
