import { Quiz, QuizSubmission, QuizTheme } from '../types/quiz';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const THEME_COLORS: Record<
  QuizTheme,
  { bg1: string; bg2: string; accent: string; cardBg: string; text: string; subtext: string }
> = {
  terracotta: {
    bg1: '#261b16',
    bg2: '#160e0a',
    accent: '#f97316',
    cardBg: '#35251e',
    text: '#ffffff',
    subtext: '#fdba74',
  },
  sunset: {
    bg1: '#261807',
    bg2: '#140c03',
    accent: '#f59e0b',
    cardBg: '#38250e',
    text: '#ffffff',
    subtext: '#fcd34d',
  },
  midnight: {
    bg1: '#090d16',
    bg2: '#020617',
    accent: '#38bdf8',
    cardBg: '#131e33',
    text: '#ffffff',
    subtext: '#7dd3fc',
  },
  emerald: {
    bg1: '#062016',
    bg2: '#02100a',
    accent: '#10b981',
    cardBg: '#0e3324',
    text: '#ffffff',
    subtext: '#6ee7b7',
  },
  lavender: {
    bg1: '#1b122c',
    bg2: '#0d0718',
    accent: '#a855f7',
    cardBg: '#2d1f47',
    text: '#ffffff',
    subtext: '#d8b4fe',
  },
  minimal: {
    bg1: '#18181b',
    bg2: '#09090b',
    accent: '#e4e4e7',
    cardBg: '#27272a',
    text: '#ffffff',
    subtext: '#a1a1aa',
  },
};

export function generateQuizOgImage(quiz: Quiz): string {
  const theme = THEME_COLORS[quiz.theme] || THEME_COLORS.terracotta;
  const safeTitle = escapeXml(quiz.title);
  const safeCreator = escapeXml(quiz.creatorName);
  const safeDesc = escapeXml(quiz.description || 'Answer questions to discover who knows them best!');
  const questionsCount = quiz.questionsCount || (quiz.questions ? quiz.questions.length : 6);

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}" />
      <stop offset="100%" stop-color="${theme.bg2}" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.accent}" />
      <stop offset="100%" stop-color="#ffedd5" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Ambient glow circles -->
  <circle cx="1050" cy="150" r="320" fill="${theme.accent}" opacity="0.15" filter="blur(60px)" />
  <circle cx="150" cy="550" r="280" fill="${theme.accent}" opacity="0.08" filter="blur(60px)" />

  <!-- Main Card Container -->
  <rect x="70" y="60" width="1060" height="510" rx="36" fill="${theme.cardBg}" stroke="rgba(255,255,255,0.12)" stroke-width="2" filter="url(#shadow)" />

  <!-- Top Brand Row -->
  <g transform="translate(120, 115)">
    <!-- App Logo Icon -->
    <rect width="46" height="46" rx="12" fill="${theme.accent}" />
    <text x="23" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle">K</text>

    <!-- App Name -->
    <text x="62" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="#ffffff" letter-spacing="-0.5">Knowly</text>
    <text x="160" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="${theme.subtext}">· Interactive Friend Quiz</text>

    <!-- Questions Count Badge -->
    <rect x="780" y="4" width="160" height="38" rx="19" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <text x="860" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#ffffff" text-anchor="middle">🎯 ${questionsCount} Questions</text>
  </g>

  <!-- Creator Eyebrow -->
  <g transform="translate(120, 220)">
    <text font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${theme.accent}" letter-spacing="2">
      HOW WELL DO YOU REALLY KNOW
    </text>
    <text y="42" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
      ${safeCreator}?
    </text>
  </g>

  <!-- Quiz Title -->
  <g transform="translate(120, 330)">
    <text font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="-1">
      "${safeTitle}"
    </text>
  </g>

  <!-- Subtitle Description -->
  <g transform="translate(120, 395)">
    <text font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="400" fill="rgba(255,255,255,0.75)">
      ${safeDesc}
    </text>
  </g>

  <!-- Bottom CTA Row -->
  <g transform="translate(120, 480)">
    <!-- Pill button -->
    <rect width="320" height="54" rx="27" fill="${theme.accent}" />
    <text x="160" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">
      Take Test &amp; Match →
    </text>

    <!-- Subtext -->
    <text x="345" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500" fill="rgba(255,255,255,0.5)">
      No app or sign-up needed · Instant live results
    </text>
  </g>
</svg>`;
}

export function generateResultOgImage(submission: QuizSubmission, quiz: Quiz): string {
  const theme = THEME_COLORS[quiz.theme] || THEME_COLORS.terracotta;
  const safeParticipant = escapeXml(submission.participantName);
  const safeCreator = escapeXml(quiz.creatorName);
  const safeTier = escapeXml(submission.resultTier.title);
  const safeBadge = escapeXml(submission.resultTier.badge);

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="resBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bg1}" />
      <stop offset="100%" stop-color="${theme.bg2}" />
    </linearGradient>
    <filter id="resShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#resBgGrad)" />

  <circle cx="200" cy="180" r="300" fill="${theme.accent}" opacity="0.16" filter="blur(60px)" />
  <circle cx="1000" cy="450" r="300" fill="${theme.accent}" opacity="0.12" filter="blur(60px)" />

  <!-- Main Card Container -->
  <rect x="70" y="60" width="1060" height="510" rx="36" fill="${theme.cardBg}" stroke="rgba(255,255,255,0.12)" stroke-width="2" filter="url(#resShadow)" />

  <!-- Top Brand Row -->
  <g transform="translate(120, 115)">
    <rect width="44" height="44" rx="12" fill="${theme.accent}" />
    <text x="22" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle">K</text>
    <text x="58" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="800" fill="#ffffff">Knowly</text>
    <text x="145" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="${theme.subtext}">· Verified Scorecard</text>
  </g>

  <!-- Left Column: Big Score Ring/Box -->
  <g transform="translate(120, 190)">
    <rect width="280" height="310" rx="28" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />

    <!-- Participant Avatar -->
    <text x="140" y="70" font-size="48" text-anchor="middle">${submission.participantEmoji}</text>

    <!-- Score number -->
    <text x="140" y="160" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900" fill="${theme.accent}" text-anchor="middle" letter-spacing="-2">
      ${submission.score}<tspan font-size="36" fill="rgba(255,255,255,0.5)"> / ${submission.totalQuestions}</tspan>
    </text>

    <!-- Match Percentage -->
    <rect x="70" y="195" width="140" height="34" rx="17" fill="rgba(255,255,255,0.1)" />
    <text x="140" y="218" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">
      ${submission.percentage}% MATCH
    </text>

    <text x="140" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="middle">
      Server-Scored &amp; Verified
    </text>
  </g>

  <!-- Right Column: Participant & Challenge Details -->
  <g transform="translate(440, 205)">
    <!-- Badge -->
    <rect width="180" height="34" rx="17" fill="${theme.accent}" opacity="0.25" />
    <text x="90" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="${theme.subtext}" text-anchor="middle">
      ${safeBadge}
    </text>

    <!-- Participant Announcement -->
    <text y="80" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="900" fill="#ffffff" letter-spacing="-1">
      ${safeParticipant}'s Result
    </text>

    <!-- Tier title -->
    <text y="130" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="${theme.accent}">
      ${safeTier}
    </text>

    <!-- Quiz Attribution -->
    <text y="175" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="rgba(255,255,255,0.7)">
      on <tspan font-weight="800" fill="#ffffff">${safeCreator}&apos;s</tspan> quiz: "${escapeXml(quiz.title)}"
    </text>

    <!-- Challenge CTA Box -->
    <g transform="translate(0, 215)">
      <rect width="600" height="74" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <text x="24" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#ffffff">
        Think you know ${safeCreator} better?
      </text>
      <text x="24" y="56" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="400" fill="rgba(255,255,255,0.6)">
        Tap link to challenge ${safeParticipant}&apos;s score on the leaderboard!
      </text>

      <rect x="420" y="16" width="160" height="42" rx="21" fill="${theme.accent}" />
      <text x="500" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle">
        Play Now →
      </text>
    </g>
  </g>
</svg>`;
}
