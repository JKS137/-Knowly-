import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Circle,
  Eye,
  Settings,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Palette,
  Share2,
  Check,
  ExternalLink,
  MessageCircle,
  Twitter,
  QrCode,
  Download,
} from 'lucide-react';
import { QuizTheme, QuizQuestion } from '../types/quiz';
import { QUIZ_THEMES } from '../utils/theme';
import { QUESTION_SUGGESTIONS, QuestionTemplate } from '../utils/questionBank';
import { api } from '../utils/api';
import { clientStorage } from '../utils/storageClient';
import { shareQuiz, canUseWebShare, getQuizOgImageUrl } from '../utils/share';
import { generateShareLinks } from '../utils/scoring';
import { QRCodeModal } from './QRCodeModal';
import { PublishSuccessModal } from './PublishSuccessModal';

interface TestBuilderProps {
  onPublishSuccess: (shortId: string) => void;
  onNavigateToQuiz: (shortId: string) => void;
  onNavigateToDashboard: (shortId: string) => void;
}

interface BuilderQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
}

export const TestBuilder: React.FC<TestBuilderProps> = ({
  onPublishSuccess,
  onNavigateToQuiz,
  onNavigateToDashboard,
}) => {
  // Form State
  const [activeTab, setActiveTab] = useState<'basics' | 'questions' | 'preview'>('basics');
  const [title, setTitle] = useState("How Well Do You Know Me?");
  const [creatorName, setCreatorName] = useState("");
  const [description, setDescription] = useState("Let's see who my real best friends are! No guessing allowed 😉");
  const [selectedTheme, setSelectedTheme] = useState<QuizTheme>('terracotta');

  // Questions State
  const [questions, setQuestions] = useState<BuilderQuestion[]>([
    {
      id: 'q_1',
      text: "What is my absolute favorite comfort food?",
      options: [
        { id: 'opt_1_1', text: "Spicy Garlic Ramen", isCorrect: true },
        { id: 'opt_1_2', text: "Crispy Pepperoni Pizza", isCorrect: false },
        { id: 'opt_1_3', text: "Loaded Street Tacos", isCorrect: false },
        { id: 'opt_1_4', text: "Cheeseburger & Fries", isCorrect: false },
      ],
    },
    {
      id: 'q_2',
      text: "If I could fly anywhere tomorrow, where am I heading?",
      options: [
        { id: 'opt_2_1', text: "Kyoto, Japan", isCorrect: true },
        { id: 'opt_2_2', text: "Amalfi Coast, Italy", isCorrect: false },
        { id: 'opt_2_3', text: "Reykjavik, Iceland", isCorrect: false },
        { id: 'opt_2_4', text: "Overwater bungalow in Bali", isCorrect: false },
      ],
    },
    {
      id: 'q_3',
      text: "Am I more of a morning person or a chaotic night owl?",
      options: [
        { id: 'opt_3_1', text: "Night owl — awake past midnight", isCorrect: true },
        { id: 'opt_3_2', text: "Early bird — up with the sunrise", isCorrect: false },
        { id: 'opt_3_3', text: "Constantly exhausted regardless of hour", isCorrect: false },
      ],
    },
  ]);

  // UI state
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [publishedResult, setPublishedResult] = useState<{ shortId: string; title: string; creatorName: string } | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showQRSuccess, setShowQRSuccess] = useState(false);
  const [downloadingCardSuccess, setDownloadingCardSuccess] = useState(false);

  const handleSharePublishedTest = async () => {
    if (!publishedResult) return;
    const res = await shareQuiz({
      shortId: publishedResult.shortId,
      title: publishedResult.title,
      creatorName: publishedResult.creatorName,
    } as any);

    if (res.method === 'clipboard' && res.success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2500);
    }
  };

  const handleDownloadCardSuccess = async () => {
    if (!publishedResult) return;
    setDownloadingCardSuccess(true);
    try {
      const ogUrl = getQuizOgImageUrl(publishedResult.shortId);
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowly-${publishedResult.creatorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-card.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download card:', e);
    } finally {
      setDownloadingCardSuccess(false);
    }
  };

  // Question editing handlers
  const handleAddQuestion = (template?: QuestionTemplate) => {
    const newId = `q_${Date.now()}`;
    const newQ: BuilderQuestion = template
      ? {
          id: newId,
          text: template.text,
          options: template.options.map((optText, idx) => ({
            id: `opt_${Date.now()}_${idx}`,
            text: optText,
            isCorrect: idx === 0, // First option marked as default correct, creator can toggle
          })),
        }
      : {
          id: newId,
          text: "",
          options: [
            { id: `opt_${Date.now()}_1`, text: "", isCorrect: true },
            { id: `opt_${Date.now()}_2`, text: "", isCorrect: false },
            { id: `opt_${Date.now()}_3`, text: "", isCorrect: false },
          ],
        };

    setQuestions([...questions, newQ]);
    setShowQuestionBank(false);
  };

  const handleUpdateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, text } : q)));
  };

  const handleUpdateOptionText = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map(opt => (opt.id === optionId ? { ...opt, text } : opt)),
        };
      })
    );
  };

  const handleSetCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options.map(opt => ({
            ...opt,
            isCorrect: opt.id === optionId,
          })),
        };
      })
    );
  };

  const handleAddOption = (questionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id !== questionId) return q;
        if (q.options.length >= 6) return q;
        return {
          ...q,
          options: [
            ...q.options,
            { id: `opt_${Date.now()}_${q.options.length + 1}`, text: "", isCorrect: false },
          ],
        };
      })
    );
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map(q => {
        if (q.id !== questionId) return q;
        if (q.options.length <= 2) return q; // Keep at least 2 options
        const filtered = q.options.filter(opt => opt.id !== optionId);
        // Ensure at least one remains correct
        if (!filtered.some(opt => opt.isCorrect) && filtered.length > 0) {
          filtered[0].isCorrect = true;
        }
        return { ...q, options: filtered };
      })
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      setValidationError("You must have at least one question in your test.");
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleDuplicateQuestion = (id: string) => {
    const target = questions.find(q => q.id === id);
    if (!target) return;
    const duplicated: BuilderQuestion = {
      id: `q_${Date.now()}`,
      text: `${target.text} (Copy)`,
      options: target.options.map(opt => ({
        id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
    };
    const targetIdx = questions.findIndex(q => q.id === id);
    const updated = [...questions];
    updated.splice(targetIdx + 1, 0, duplicated);
    setQuestions(updated);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setQuestions(updated);
  };

  // Validation
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setValidationError("Please enter a title for your test.");
      setActiveTab('basics');
      return false;
    }

    if (!creatorName.trim()) {
      setValidationError("Please enter your name or nickname so friends know whose test it is.");
      setActiveTab('basics');
      return false;
    }

    if (questions.length === 0) {
      setValidationError("Please add at least one question.");
      setActiveTab('questions');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setValidationError(`Question #${i + 1} needs a question prompt.`);
        setActiveTab('questions');
        return false;
      }

      if (q.options.length < 2) {
        setValidationError(`Question #${i + 1} needs at least 2 answer options.`);
        setActiveTab('questions');
        return false;
      }

      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          setValidationError(`Question #${i + 1} has an empty option. Please fill in all answers.`);
          setActiveTab('questions');
          return false;
        }
      }

      const hasCorrect = q.options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        setValidationError(`Please mark the correct answer for Question #${i + 1}.`);
        setActiveTab('questions');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setIsPublishing(true);
    setValidationError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        creatorName: creatorName.trim(),
        theme: selectedTheme,
        questions: questions.map(q => ({
          text: q.text.trim(),
          type: 'multiple_choice',
          options: q.options.map(opt => ({
            text: opt.text.trim(),
            isCorrect: opt.isCorrect,
          })),
        })),
      };

      const result = await api.createQuiz(payload);

      // Save creator token to client localStorage so creator can view dashboard & edit
      clientStorage.saveCreatorToken(result.shortId, result.creatorToken, result.quiz.title);

      setPublishedResult({
        shortId: result.shortId,
        title: result.quiz.title,
        creatorName: result.quiz.creatorName,
      });

      onPublishSuccess(result.shortId);
    } catch (err: any) {
      console.error('Publish error:', err);
      setValidationError(err.message || 'Failed to publish test. Please check connection.');
    } finally {
      setIsPublishing(false);
    }
  };

  const currentTheme = QUIZ_THEMES[selectedTheme];

  // Dedicated TestBuilder Success Page
  if (publishedResult) {
    const publicUrl = `${window.location.origin}/q/${publishedResult.shortId}`;
    const ogImageUrl = getQuizOgImageUrl(publishedResult.shortId);
    const shareLinks = generateShareLinks(publicUrl, publishedResult.title, publishedResult.creatorName);

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl text-center space-y-6 animate-in fade-in">
          {/* Header celebration */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 text-3xl font-bold shadow-inner">
              🎉
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
              Your test is ready!
            </h1>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              "{publishedResult.title}" is published. Share it with friends to see who actually knows you best.
            </p>
          </div>

          {/* Primary Share Result Action */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleSharePublishedTest}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold text-base shadow-lg shadow-orange-600/30 transition-all group"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{copiedSuccess ? 'Link Copied to Clipboard!' : 'Share Result'}</span>
            </button>
            <p className="text-xs text-stone-500">
              Uses the native Web Share API to send directly to WhatsApp, Messages, or social apps
            </p>
          </div>

          {/* Dynamic Social Card (OG Image Preview) */}
          <div className="text-left space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-stone-800">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Live Dynamic Social Share Card</span>
              </span>
              <button
                onClick={handleDownloadCardSuccess}
                disabled={downloadingCardSuccess}
                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingCardSuccess ? 'Saving...' : 'Save Card'}</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-950 aspect-[1200/630] relative group">
              <img
                src={ogImageUrl}
                alt="Social share preview"
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={handleDownloadCardSuccess}
                  className="px-4 py-2 rounded-xl bg-white/95 text-stone-900 text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>Download Image</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 italic px-1">
              Automatically previewed when shared across WhatsApp, iMessage, Twitter, and Slack.
            </p>
          </div>

          {/* Link box */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-left">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2 font-medium">
              <span>Public Share Link</span>
              <span className="text-orange-600 font-semibold">Active &amp; Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full text-sm font-mono text-stone-800 bg-white border border-stone-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  setCopiedSuccess(true);
                  setTimeout(() => setCopiedSuccess(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0"
              >
                {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSuccess ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social share channels */}
          <div className="space-y-3 text-left">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Quick Share Channels
            </label>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-100 transition-all text-center"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-semibold border border-sky-100 transition-all text-center"
              >
                <Twitter className="w-4 h-4 text-sky-600" />
                <span>X / Twitter</span>
              </a>

              <button
                onClick={() => setShowQRSuccess(true)}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all text-center"
              >
                <QrCode className="w-4 h-4 text-stone-700" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* Direct navigation actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={() => onNavigateToQuiz(publishedResult.shortId)}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-800 text-xs font-semibold rounded-xl transition-all"
            >
              <ExternalLink className="w-4 h-4 text-stone-500" />
              <span>Preview Quiz</span>
            </button>

            <button
              onClick={() => onNavigateToDashboard(publishedResult.shortId)}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setPublishedResult(null);
                setTitle("How Well Do You Know Me?");
                setDescription("");
                setActiveTab('basics');
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-50 hover:bg-orange-100 active:scale-98 text-orange-950 text-xs font-semibold rounded-xl transition-all"
            >
              <Plus className="w-4 h-4 text-orange-600" />
              <span>New Quiz</span>
            </button>
          </div>
        </div>

        <QRCodeModal
          isOpen={showQRSuccess}
          onClose={() => setShowQRSuccess(false)}
          url={publicUrl}
          title={publishedResult.title}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Create Your Test
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Build your personalized questions, pick your secret answers, and challenge your friends.
          </p>
        </div>

        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-orange-600/25 transition-all disabled:opacity-50 shrink-0"
        >
          {isPublishing ? (
            <span>Publishing...</span>
          ) : (
            <>
              <span>Publish Test</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Check your test before publishing</p>
            <p className="text-xs text-rose-700 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-200/70 rounded-2xl mb-8">
        <button
          onClick={() => setActiveTab('basics')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'basics'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Settings className="w-4 h-4 text-orange-600" />
          <span>1. Test Basics</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'questions'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-orange-600" />
          <span>2. Questions ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'preview'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Eye className="w-4 h-4 text-orange-600" />
          <span>3. Live Preview</span>
        </button>
      </div>

      {/* TAB 1: BASICS */}
      {activeTab === 'basics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Your Name or Nickname *
              </label>
              <input
                type="text"
                value={creatorName}
                onChange={e => setCreatorName(e.target.value)}
                placeholder="e.g. Alex, Maya, Jordan"
                maxLength={40}
                className="w-full text-base px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
              />
              <p className="text-xs text-stone-500 mt-1.5">
                Friends will see "Created by {creatorName || 'Your Name'}" when taking the quiz.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="How Well Do You Really Know Me?"
                maxLength={70}
                className="w-full text-lg font-heading font-bold px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Description / Subtitle
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                maxLength={200}
                placeholder="Add a fun note or challenge for your friends..."
                className="w-full text-sm px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-800 resize-none"
              />
            </div>

            {/* Visual Theme Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="w-4 h-4 text-orange-600" />
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Color Theme
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.values(QUIZ_THEMES).map(theme => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-stone-300/50 shadow-xs"
                          style={{ backgroundColor: theme.previewAccent }}
                        />
                        <span className="text-xs font-bold text-stone-900">{theme.name}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1">{theme.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveTab('questions')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold transition-all"
            >
              <span>Next: Customize Questions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS BUILDER */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Question bank helper bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-orange-50/80 border border-orange-200/80 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-orange-950">Need inspiration?</p>
                <p className="text-[11px] text-orange-800">
                  Pick from our bank of fun, revealing questions about quirks, food, and lifestyle.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuestionBank(!showQuestionBank)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-orange-200 hover:bg-orange-100 text-orange-900 text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <span>{showQuestionBank ? 'Hide Ideas' : 'Browse Question Bank'}</span>
            </button>
          </div>

          {/* Question Bank Suggestions Drawer */}
          {showQuestionBank && (
            <div className="p-5 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Popular Question Prompts
                </h4>
                <span className="text-xs text-stone-400">Click any prompt to add</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {QUESTION_SUGGESTIONS.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddQuestion(template)}
                    className="p-3 text-left rounded-xl bg-stone-50 hover:bg-orange-50 hover:border-orange-300 border border-stone-200/70 transition-all group"
                  >
                    <span className="text-[10px] font-semibold text-orange-600 block mb-1 uppercase tracking-wide">
                      {template.category}
                    </span>
                    <p className="text-xs font-medium text-stone-800 group-hover:text-stone-950">
                      {template.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List of questions */}
          <div className="space-y-6">
            {questions.map((question, qIdx) => (
              <div
                key={question.id}
                className="bg-white rounded-2xl p-5 sm:p-7 border border-stone-200 shadow-sm space-y-5 relative transition-all"
              >
                {/* Question Header & Controls */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                      Question {String(qIdx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-stone-400">Multiple Choice</span>
                  </div>

                  <div className="flex items-center gap-1 text-stone-400">
                    <button
                      onClick={() => handleMoveQuestion(qIdx, 'up')}
                      disabled={qIdx === 0}
                      title="Move Up"
                      className="p-1.5 hover:text-stone-800 hover:bg-stone-100 rounded-lg disabled:opacity-25 transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(qIdx, 'down')}
                      disabled={qIdx === questions.length - 1}
                      title="Move Down"
                      className="p-1.5 hover:text-stone-800 hover:bg-stone-100 rounded-lg disabled:opacity-25 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicateQuestion(question.id)}
                      title="Duplicate Question"
                      className="p-1.5 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      title="Delete Question"
                      className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text Input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Question Prompt
                  </label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={e => handleUpdateQuestionText(question.id, e.target.value)}
                    placeholder="e.g. What is my favorite food?"
                    className="w-full text-base font-semibold px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                  />
                </div>

                {/* Options List with radio to mark correct answer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                    <span>Answer Options (Select the bubble to mark your correct answer)</span>
                    <span className="text-[11px] text-stone-400">Green = Correct</span>
                  </div>

                  <div className="space-y-2.5">
                    {question.options.map((opt, optIdx) => (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-3 p-2.5 sm:px-3 rounded-xl border transition-all ${
                          opt.isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30'
                            : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSetCorrectOption(question.id, opt.id)}
                          className="shrink-0 p-1 text-emerald-600 focus:outline-none"
                          title={opt.isCorrect ? 'Correct Answer' : 'Click to make correct answer'}
                        >
                          {opt.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                          )}
                        </button>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={e =>
                            handleUpdateOptionText(question.id, opt.id, e.target.value)
                          }
                          placeholder={`Option ${optIdx + 1}`}
                          className="w-full text-sm font-medium bg-transparent focus:outline-none text-stone-800"
                        />

                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(question.id, opt.id)}
                            className="p-1 text-stone-300 hover:text-rose-500 rounded transition-colors"
                            title="Remove option"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {question.options.length < 5 && (
                    <button
                      type="button"
                      onClick={() => handleAddOption(question.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 py-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add another answer option</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleAddQuestion()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-98 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Question</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuestionBank(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-100/70 hover:bg-orange-100 text-orange-950 text-sm font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Choose from Bank</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="p-4 bg-stone-100 border border-stone-200 rounded-2xl flex items-center justify-between text-xs text-stone-600">
            <span className="font-semibold">Participant View Simulator</span>
            <span>Theme: {currentTheme.name}</span>
          </div>

          {/* Mobile phone mockup frame */}
          <div className="max-w-md mx-auto rounded-[32px] p-4 bg-stone-900 shadow-2xl border-4 border-stone-800">
            <div className={`rounded-[24px] p-6 min-h-[520px] flex flex-col ${currentTheme.bgClass}`}>
              {/* Header simulation */}
              <div className="text-center pb-4 border-b border-stone-200/50 mb-6">
                <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  Created by {creatorName || 'Your Name'}
                </span>
                <h3 className={`font-heading font-extrabold text-xl mt-1 ${currentTheme.headingClass}`}>
                  {title || "Quiz Title"}
                </h3>
                <p className="text-xs opacity-75 mt-1">
                  {description || "No description provided."}
                </p>
              </div>

              {/* Sample question simulation */}
              {questions.length > 0 && (
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs opacity-60 font-semibold">
                    <span>Question 1 of {questions.length}</span>
                    <span>100%</span>
                  </div>

                  <div className="h-1.5 w-full bg-stone-200/60 rounded-full overflow-hidden">
                    <div className={`h-full w-1/3 rounded-full ${currentTheme.progressBarClass}`} />
                  </div>

                  <h4 className={`font-heading font-bold text-lg leading-snug ${currentTheme.headingClass}`}>
                    {questions[0].text || "Your question will appear here"}
                  </h4>

                  <div className="space-y-2.5 pt-2">
                    {questions[0].options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-sm font-medium transition-all ${
                          idx === 0
                            ? currentTheme.optionSelectedClass
                            : currentTheme.optionBaseClass
                        }`}
                      >
                        {opt.text || `Option ${idx + 1}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom footer simulation */}
              <div className="pt-6 text-center text-[11px] opacity-50">
                Live preview · Correct answers are never revealed to participants
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-lg shadow-orange-600/30 transition-all active:scale-95"
            >
              <span>Looks great, publish now!</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
