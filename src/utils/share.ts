import { Quiz, QuizSubmission } from '../types/quiz';
import { QUIZ_THEMES } from './theme';

export interface ShareResult {
  success: boolean;
  method: 'web-share' | 'clipboard' | 'file-share';
  error?: any;
}

export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function canShareFiles(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    typeof File !== 'undefined'
  );
}

// Format the dynamic OG image URL
export function getQuizOgImageUrl(shortId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/api/og/quiz/${encodeURIComponent(shortId)}`;
}

export function getResultOgImageUrl(shortId: string, submissionId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/api/og/result/${encodeURIComponent(shortId)}/${encodeURIComponent(submissionId)}`;
}

// Web Share API for Quiz Links
export async function shareQuiz(quiz: Quiz, customUrl?: string): Promise<ShareResult> {
  const url = customUrl || `${window.location.origin}/q/${quiz.shortId}`;
  const title = `How well do you really know ${quiz.creatorName}?`;
  const text = `Take my interactive test "${quiz.title}" on Knowly! Discover who knows me best 🔮`;

  if (canUseWebShare()) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'web-share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'web-share', error: 'User canceled' };
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return { success: true, method: 'clipboard' };
  } catch (err) {
    return { success: false, method: 'clipboard', error: err };
  }
}

// Web Share API for Participant Results
export async function shareSubmissionResult(
  submission: QuizSubmission,
  quiz: Quiz
): Promise<ShareResult> {
  const url = `${window.location.origin}/q/${quiz.shortId}`;
  const title = `${submission.participantName}'s Score on ${quiz.creatorName}'s Quiz`;
  const text = `I just scored ${submission.score}/${submission.totalQuestions} (${submission.percentage}%) on ${quiz.creatorName}'s quiz on Knowly! ⭐️ ${submission.resultTier.title}. Think you know them better? Try it here:`;

  if (canUseWebShare()) {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'web-share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'web-share', error: 'User canceled' };
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return { success: true, method: 'clipboard' };
  } catch (err) {
    return { success: false, method: 'clipboard', error: err };
  }
}

// Offscreen Canvas PNG Generator for direct image download or file-share
export async function generateScorecardCanvasBlob(
  submission: QuizSubmission,
  quiz: Quiz
): Promise<Blob | null> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    const theme = QUIZ_THEMES[quiz.theme] || QUIZ_THEMES.terracotta;
    const accentColor = theme.previewAccent || '#f97316';

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, '#1c1917');
    bgGradient.addColorStop(1, '#0c0a09');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Accent glow circle
    const glowGradient = ctx.createRadialGradient(250, 200, 20, 250, 200, 400);
    glowGradient.addColorStop(0, `${accentColor}33`);
    glowGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Rounded Card
    ctx.fillStyle = '#292524';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    roundRect(ctx, 70, 60, 1060, 510, 32);
    ctx.fill();
    ctx.stroke();

    // Knowly Brand
    ctx.fillStyle = accentColor;
    roundRect(ctx, 120, 110, 46, 46, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('K', 143, 143);

    ctx.textAlign = 'left';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Knowly', 180, 142);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '16px sans-serif';
    ctx.fillText('· Verified Result Card', 280, 142);

    // Score Ring / Box Left
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    roundRect(ctx, 120, 190, 270, 310, 24);
    ctx.fill();
    ctx.stroke();

    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(submission.participantEmoji, 255, 270);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(`${submission.score}/${submission.totalQuestions}`, 255, 360);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${submission.percentage}% MATCH`, 255, 410);

    ctx.fillStyle = '#78716c';
    ctx.font = '14px sans-serif';
    ctx.fillText('Server Scored & Verified', 255, 460);

    // Right Column
    ctx.textAlign = 'left';

    // Tier badge
    ctx.fillStyle = `${accentColor}33`;
    roundRect(ctx, 430, 200, 180, 36, 18);
    ctx.fill();

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(submission.resultTier.badge, 450, 224);

    // Participant heading
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(`${submission.participantName}'s Score`, 430, 290);

    // Tier title
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(submission.resultTier.title, 430, 335);

    // Quiz attribution
    ctx.fillStyle = '#d6d3d1';
    ctx.font = '20px sans-serif';
    ctx.fillText(`on ${quiz.creatorName}'s quiz: "${quiz.title}"`, 430, 380);

    // Challenge bar
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    roundRect(ctx, 430, 430, 630, 70, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Think you know ${quiz.creatorName} better?`, 460, 460);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Tap link to beat ${submission.participantName}'s ranking!`, 460, 484);

    ctx.fillStyle = accentColor;
    roundRect(ctx, 900, 445, 140, 40, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Play Quiz →', 970, 470);

    canvas.toBlob(blob => resolve(blob), 'image/png');
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Download visual scorecard
export async function downloadScorecardImage(submission: QuizSubmission, quiz: Quiz) {
  const blob = await generateScorecardCanvasBlob(submission, quiz);
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `knowly-${submission.participantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-score.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
