import React from 'react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-stone-200/80 bg-[#faf9f5] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center text-white font-extrabold text-sm">
                K
              </div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-stone-900">
                Knowly
              </span>
            </div>
            <p className="text-sm text-stone-600 max-w-sm leading-relaxed">
              The lightweight, mobile-first social quiz platform. Build personalized friend tests, challenge your circle, and discover who knows you best.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li>
                <button onClick={() => onNavigate('create')} className="hover:text-stone-950 transition-colors">
                  Create a Test
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('demo')} className="hover:text-stone-950 transition-colors">
                  Sample Quiz
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-quizzes')} className="hover:text-stone-950 transition-colors">
                  My Tests Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">Privacy & Trust</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              No account required for friends taking quizzes. Minimal data collected. Scores verified server-side with zero answer exposure in client payloads.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Knowly. An original social quiz platform.</p>
          <div className="flex items-center gap-4">
            <span>Server-side scored</span>
            <span>·</span>
            <span>Mobile-optimized</span>
            <span>·</span>
            <span>Zero cookies required</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
