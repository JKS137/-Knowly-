import { QuizTheme } from '../types/quiz';

export interface ThemeConfig {
  id: QuizTheme;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  bgClass: string;
  cardBgClass: string;
  textClass: string;
  headingClass: string;
  mutedTextClass: string;
  borderClass: string;
  primaryButtonClass: string;
  secondaryButtonClass: string;
  accentClass: string;
  optionBaseClass: string;
  optionSelectedClass: string;
  progressBarClass: string;
}

export const QUIZ_THEMES: Record<QuizTheme, ThemeConfig> = {
  terracotta: {
    id: 'terracotta',
    name: 'Warm Clay',
    description: 'Earthy terracotta, warm sand, and editorial accents',
    previewBg: '#fef3ee',
    previewAccent: '#ea580c',
    bgClass: 'bg-[#faf6f0] text-stone-900',
    cardBgClass: 'bg-white border-stone-200/80 shadow-sm',
    textClass: 'text-stone-800',
    headingClass: 'text-stone-950',
    mutedTextClass: 'text-stone-500',
    borderClass: 'border-stone-200',
    primaryButtonClass: 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 shadow-md',
    secondaryButtonClass: 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200',
    accentClass: 'text-orange-600',
    optionBaseClass: 'bg-stone-50/70 hover:bg-stone-100/90 text-stone-800 border-stone-200/90',
    optionSelectedClass: 'bg-orange-50 border-orange-500 text-orange-950 font-semibold ring-2 ring-orange-500/20',
    progressBarClass: 'bg-orange-600',
  },
  sunset: {
    id: 'sunset',
    name: 'Amber Glow',
    description: 'Golden hour amber and vibrant dusk tones',
    previewBg: '#fff7ed',
    previewAccent: '#d97706',
    bgClass: 'bg-[#fffbf5] text-amber-950',
    cardBgClass: 'bg-white border-amber-200/70 shadow-sm',
    textClass: 'text-amber-900',
    headingClass: 'text-amber-950',
    mutedTextClass: 'text-amber-700/70',
    borderClass: 'border-amber-200/80',
    primaryButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25 shadow-md',
    secondaryButtonClass: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200',
    accentClass: 'text-amber-600',
    optionBaseClass: 'bg-amber-50/50 hover:bg-amber-100/60 text-amber-950 border-amber-200/70',
    optionSelectedClass: 'bg-amber-100/80 border-amber-500 text-amber-950 font-semibold ring-2 ring-amber-500/20',
    progressBarClass: 'bg-amber-600',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Ink',
    description: 'Deep navy charcoal with luminous cyan highlights',
    previewBg: '#0f172a',
    previewAccent: '#38bdf8',
    bgClass: 'bg-slate-950 text-slate-100',
    cardBgClass: 'bg-slate-900 border-slate-800 shadow-xl',
    textClass: 'text-slate-200',
    headingClass: 'text-white',
    mutedTextClass: 'text-slate-400',
    borderClass: 'border-slate-800',
    primaryButtonClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-cyan-500/20 shadow-md',
    secondaryButtonClass: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
    accentClass: 'text-cyan-400',
    optionBaseClass: 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700',
    optionSelectedClass: 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-semibold ring-2 ring-cyan-500/20',
    progressBarClass: 'bg-cyan-400',
  },
  emerald: {
    id: 'emerald',
    name: 'Forest Moss',
    description: 'Fresh botanical greens with refined sage tones',
    previewBg: '#ecfdf5',
    previewAccent: '#059669',
    bgClass: 'bg-[#f4faf6] text-emerald-950',
    cardBgClass: 'bg-white border-emerald-100 shadow-sm',
    textClass: 'text-emerald-950',
    headingClass: 'text-emerald-950',
    mutedTextClass: 'text-emerald-700/75',
    borderClass: 'border-emerald-200/80',
    primaryButtonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-md',
    secondaryButtonClass: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200',
    accentClass: 'text-emerald-600',
    optionBaseClass: 'bg-emerald-50/40 hover:bg-emerald-50/80 text-emerald-950 border-emerald-200/70',
    optionSelectedClass: 'bg-emerald-100/90 border-emerald-600 text-emerald-950 font-semibold ring-2 ring-emerald-500/20',
    progressBarClass: 'bg-emerald-600',
  },
  lavender: {
    id: 'lavender',
    name: 'Lilac Mist',
    description: 'Soft lavender, modern violet, and crisp slate',
    previewBg: '#f5f3ff',
    previewAccent: '#7c3aed',
    bgClass: 'bg-[#fbf9fe] text-violet-950',
    cardBgClass: 'bg-white border-violet-100 shadow-sm',
    textClass: 'text-violet-950',
    headingClass: 'text-violet-950',
    mutedTextClass: 'text-violet-700/70',
    borderClass: 'border-violet-200/80',
    primaryButtonClass: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20 shadow-md',
    secondaryButtonClass: 'bg-violet-50 hover:bg-violet-100 text-violet-900 border-violet-200',
    accentClass: 'text-violet-600',
    optionBaseClass: 'bg-violet-50/40 hover:bg-violet-50/80 text-violet-950 border-violet-200/70',
    optionSelectedClass: 'bg-violet-100/90 border-violet-600 text-violet-950 font-semibold ring-2 ring-violet-500/20',
    progressBarClass: 'bg-violet-600',
  },
  minimal: {
    id: 'minimal',
    name: 'Editorial Monochrome',
    description: 'High contrast crisp black, off-white, and razor typography',
    previewBg: '#f4f4f5',
    previewAccent: '#18181b',
    bgClass: 'bg-[#fcfcfc] text-zinc-900',
    cardBgClass: 'bg-white border-zinc-200 shadow-sm',
    textClass: 'text-zinc-800',
    headingClass: 'text-zinc-950',
    mutedTextClass: 'text-zinc-500',
    borderClass: 'border-zinc-200',
    primaryButtonClass: 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm',
    secondaryButtonClass: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-300',
    accentClass: 'text-zinc-900',
    optionBaseClass: 'bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border-zinc-200',
    optionSelectedClass: 'bg-zinc-900 border-zinc-900 text-white font-semibold ring-2 ring-zinc-900/10',
    progressBarClass: 'bg-zinc-900',
  },
};
