import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  QrCode,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Twitter,
  Download,
  Sparkles,
} from 'lucide-react';
import { generateShareLinks } from '../utils/scoring';
import { getQuizOgImageUrl, canUseWebShare } from '../utils/share';
import { QRCodeModal } from './QRCodeModal';

interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortId: string;
  title: string;
  creatorName: string;
  onNavigateToQuiz: (shortId: string) => void;
  onNavigateToDashboard: (shortId: string) => void;
}

export const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({
  isOpen,
  onClose,
  shortId,
  title,
  creatorName,
  onNavigateToQuiz,
  onNavigateToDashboard,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [downloadingCard, setDownloadingCard] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/q/${shortId}`;
  const ogImageUrl = getQuizOgImageUrl(shortId);
  const shareLinks = generateShareLinks(publicUrl, title, creatorName);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (canUseWebShare()) {
      try {
        await navigator.share({
          title: `How well do you know ${creatorName}?`,
          text: `Take my interactive test "${title}" on Knowly! Discover who knows me best 🔮`,
          url: publicUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadOgCard = async () => {
    try {
      setDownloadingCard(true);
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `knowly-${creatorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-card.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download card:', e);
    } finally {
      setDownloadingCard(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
          {/* Header celebration */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 text-2xl font-bold shadow-inner">
              🎉
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
              Your test is ready!
            </h2>
            <p className="text-sm text-stone-600">
              Share your link with friends, group chats, or post the social card to your stories.
            </p>
          </div>

          {/* Dynamic Social Card (OG Image Preview) */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold px-1">
              <span className="flex items-center gap-1.5 text-stone-800">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Live Dynamic Social Share Card</span>
              </span>
              <button
                onClick={handleDownloadOgCard}
                disabled={downloadingCard}
                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadingCard ? 'Saving...' : 'Save Card'}</span>
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
                  onClick={handleDownloadOgCard}
                  className="px-4 py-2 rounded-xl bg-white/95 text-stone-900 text-xs font-bold shadow-lg flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-orange-600" />
                  <span>Download Image</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 italic px-1">
              This card automatically appears when shared on WhatsApp, Twitter, iMessage, and Slack.
            </p>
          </div>

          {/* Primary Share Result Action */}
          <div className="mb-6 space-y-2">
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold text-base shadow-lg shadow-orange-600/30 transition-all group"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{copied ? 'Link Copied to Clipboard!' : 'Share Result'}</span>
            </button>
            <p className="text-center text-[11px] text-stone-500">
              Uses the native Web Share API to send directly to WhatsApp, Messages, or social apps
            </p>
          </div>

          {/* Link box */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl mb-6">
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
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social share channels */}
          <div className="space-y-3 mb-6">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Quick Share Channels
            </label>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-100 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-semibold border border-sky-100 transition-all"
              >
                <Twitter className="w-4 h-4 text-sky-600" />
                <span>X / Twitter</span>
              </a>

              <button
                onClick={() => setShowQR(true)}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all"
              >
                <QrCode className="w-4 h-4 text-stone-700" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* Direct navigation actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-stone-100">
            <button
              onClick={() => {
                onClose();
                onNavigateToQuiz(shortId);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-800 text-sm font-semibold rounded-xl transition-all"
            >
              <ExternalLink className="w-4 h-4 text-stone-500" />
              <span>Preview Quiz</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToDashboard(shortId);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={publicUrl}
        title={title}
      />
    </>
  );
};
