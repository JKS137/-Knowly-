import React from 'react';
import { Sparkles, PlusCircle, Compass, ListOrdered } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  myQuizzesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, myQuizzesCount = 0 }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf9f5]/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-sm shadow-orange-600/30 group-hover:scale-105 transition-transform">
            K
          </div>
          <div>
            <span className="font-heading font-extrabold text-xl tracking-tight text-stone-900">
              Knowly
            </span>
          </div>
        </button>

        {/* Navigation links & actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigate('demo')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentView === 'demo'
                ? 'text-stone-900 bg-stone-200/60'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Compass className="w-4 h-4 text-orange-600" />
            <span>Try Demo</span>
          </button>

          <button
            onClick={() => onNavigate('my-quizzes')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              currentView === 'my-quizzes'
                ? 'text-stone-900 bg-stone-200/60'
                : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-stone-500" />
            <span>My Tests</span>
            {myQuizzesCount > 0 && (
              <span className="text-xs bg-stone-200 text-stone-800 font-semibold px-1.5 py-0.5 rounded-full">
                {myQuizzesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl bg-orange-600 text-white shadow-sm shadow-orange-600/25 hover:bg-orange-700 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Create Test</span>
            <span className="xs:hidden">Create</span>
          </button>
        </div>
      </div>
    </header>
  );
};
