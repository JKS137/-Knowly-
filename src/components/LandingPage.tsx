import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Share2,
  Users,
  ShieldCheck,
  Zap,
  QrCode,
  CheckCircle2,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Smile,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  onCreateTest: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateTest, onTryDemo }) => {
  // Interactive mini preview widget state
  const [selectedDemoOption, setSelectedDemoOption] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const demoOptions = [
    { text: "Spicy Garlic Ramen", isCorrect: true },
    { text: "Pepperoni Pizza", isCorrect: false },
    { text: "Baja Fish Tacos", isCorrect: false },
    { text: "Cheeseburger & Fries", isCorrect: false },
  ];

  const faqs = [
    {
      q: "Do my friends need to register or download an app to take my quiz?",
      a: "No! There is zero friction. When your friends open your link, they just enter a nickname and avatar emoji to start answering immediately on any mobile phone or browser.",
    },
    {
      q: "Can participants cheat by inspecting the browser network or HTML?",
      a: "No. Unlike naive quiz tools, Knowly evaluates scoring strictly on the server. The public test API completely strips correct answers before sending data to participants.",
    },
    {
      q: "How do I access my quiz results and leaderboard?",
      a: "Whenever you publish a test, a secure private creator token is saved to your browser and dashboard link. You can see real-time completions, average scores, and inspect every friend's individual answers.",
    },
    {
      q: "Can I close or delete my test later?",
      a: "Yes. From your creator dashboard you can close submissions at any time to freeze the leaderboard, or permanently delete the test and all responses.",
    },
    {
      q: "Can I share my quiz as a QR code at parties or gatherings?",
      a: "Yes! Every quiz automatically generates a sharp, scannable QR code that you can display on your screen or save as an image to print or post.",
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-8 sm:pt-20 sm:pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Top subtle kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-700 bg-orange-100/80 px-3.5 py-1.5 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>The Social Friend Quiz Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-stone-900 tracking-tight leading-[1.08]">
            How well do your friends{' '}
            <span className="text-orange-600 underline decoration-orange-300 decoration-wavy decoration-2">
              really
            </span>{' '}
            know you?
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Create your personalized interactive test in two minutes, share the link with friends, and discover who actually knows your true quirks, favorites, and secrets.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onCreateTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-base shadow-lg shadow-orange-600/30 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Your Test</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-stone-50 active:scale-95 text-stone-800 font-bold text-base border border-stone-200 shadow-sm transition-all"
            >
              <Compass className="w-5 h-5 text-orange-600" />
              <span>Try Maya's Demo Test</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-stone-500 pt-2 font-medium">
            <span>⚡️ Zero sign-up for friends</span>
            <span>·</span>
            <span>📱 Mobile-first</span>
            <span>·</span>
            <span>🔒 Anti-cheat scoring</span>
          </div>
        </div>

        {/* HERO INTERACTIVE PREVIEW WIDGET */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: Interactive Question Simulator */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span className="font-semibold text-orange-600 uppercase tracking-wider">
                  Interactive Preview
                </span>
                <span>Question 1 of 6</span>
              </div>

              <h3 className="font-heading font-bold text-xl text-stone-900 leading-snug">
                "What is my go-to comfort food when I've had a long day?"
              </h3>

              <div className="space-y-2.5">
                {demoOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDemoOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                      selectedDemoOption === idx
                        ? 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-500/20 font-semibold'
                        : 'bg-stone-50/70 hover:bg-stone-100 text-stone-800 border-stone-200'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {selectedDemoOption === idx && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-stone-400 italic">
                Try clicking an option above to see how friends interact on their phone!
              </p>
            </div>

            {/* Right: Live Result Card Simulation */}
            <div className="bg-[#faf6f0] rounded-2xl p-6 border border-stone-200/70 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🦊</span>
                <span className="text-xs font-bold text-stone-700">Jordan's Score Card</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs inline-block">
                <span className="font-heading font-black text-4xl text-orange-600">5 / 6</span>
                <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">
                  83% Match
                </span>
              </div>

              <div className="space-y-1">
                <span className="inline-block text-[11px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                  Inner Circle VIP ⭐️
                </span>
                <p className="text-xs text-stone-600 max-w-xs mx-auto">
                  "You know them remarkably well! The bond is strong and genuine."
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onCreateTest}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Create One for Yourself
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP SEQUENCE: CREATE -> SHARE -> DISCOVER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            Simple 3-Step Loop
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-stone-900">
            From idea to friend leaderboard in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-heading font-black text-lg">
                01
              </div>
              <h3 className="font-heading font-bold text-xl text-stone-900">
                1. Create Your Test
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Add questions about your favorite foods, pet peeves, travel dreams, and quirks. Use our built-in suggestion bank or write your own prompts.
              </p>
            </div>
            <div className="text-xs font-semibold text-orange-600">
              Multiple choice · Secret answers
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-heading font-black text-lg">
                02
              </div>
              <h3 className="font-heading font-bold text-xl text-stone-900">
                2. Share Instantly
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Get your unique shareable link or printable QR code. Send it on WhatsApp, Telegram, Discord, or post it directly to your Instagram story.
              </p>
            </div>
            <div className="text-xs font-semibold text-amber-600">
              Web Share API · QR Code · Copy Link
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-heading font-black text-lg">
                03
              </div>
              <h3 className="font-heading font-bold text-xl text-stone-900">
                3. Discover Who Knows You
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Watch scores roll in on your private live leaderboard. Discover your easiest questions, your most missed questions, and your true soulmates.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-600">
              Live leaderboard · Question accuracy
            </div>
          </div>
        </div>
      </section>

      {/* VIRAL FEATURE HIGHLIGHTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-900 rounded-[32px] p-8 sm:p-12 text-white space-y-10">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              Built for virality & trust
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl leading-tight">
              Designed to spread organically across your entire circle
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Every design decision is optimized for quick mobile clicks, high completion rates, and an irresistible loop for friends to make their own test.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-2">
              <Users className="w-5 h-5 text-orange-400" />
              <h4 className="font-heading font-bold text-base text-white">No Account Wall</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Friends never drop off because of sign-up forms. They enter a nickname and immediately play.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-heading font-bold text-base text-white">Anti-Cheat Engine</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                All scoring happens server-side. Correct answers are strictly hidden until after submission.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-2">
              <QrCode className="w-5 h-5 text-sky-400" />
              <h4 className="font-heading font-bold text-base text-white">Real QR Generator</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Display on party screens or print stickers. Scan directly from any smartphone camera.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-stone-800/80 border border-stone-700/60 space-y-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h4 className="font-heading font-bold text-base text-white">Viral Return Loop</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                After seeing their score, every friend is one click away from challenging the creator back.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-stone-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-stone-500">
            Everything you need to know about creating and sharing Knowly tests
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-heading font-bold text-stone-900 text-sm sm:text-base hover:bg-stone-50/50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-orange-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="rounded-[32px] p-8 sm:p-12 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-center space-y-6 shadow-xl">
          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-tight leading-tight">
            Ready to challenge your inner circle?
          </h2>
          <p className="text-sm sm:text-base text-orange-100 max-w-xl mx-auto leading-relaxed">
            Create your personalized quiz now, send the link to your friends, and discover who knows you best.
          </p>
          <div className="pt-2">
            <button
              onClick={onCreateTest}
              className="py-4 px-8 bg-white hover:bg-stone-100 text-orange-700 font-extrabold text-base rounded-2xl shadow-lg transition-all active:scale-95"
            >
              Create Your Test For Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
