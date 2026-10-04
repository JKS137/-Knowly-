import { ResultTier } from '../types/quiz';

export function calculateResultTier(score: number, total: number): ResultTier {
  if (total === 0) {
    return {
      title: "Quiz Completed!",
      subtitle: "Thanks for taking the test.",
      badge: "Completed",
      color: "text-stone-700 bg-stone-100 border-stone-300",
    };
  }

  const percentage = Math.round((score / total) * 100);

  if (percentage >= 90) {
    return {
      title: "Soulmate Status 🔮",
      subtitle: "You know them on a telepathic level. You practically finish their sentences.",
      badge: "Mastermind",
      color: "text-amber-700 bg-amber-50 border-amber-300",
    };
  } else if (percentage >= 70) {
    return {
      title: "Inner Circle VIP ⭐️",
      subtitle: "You know them remarkably well! The bond is strong and genuine.",
      badge: "Close Friend",
      color: "text-orange-700 bg-orange-50 border-orange-300",
    };
  } else if (percentage >= 50) {
    return {
      title: "Solid Companion 🤝",
      subtitle: "You know the essentials, but there are still fun secrets left to uncover.",
      badge: "Good Pal",
      color: "text-emerald-700 bg-emerald-50 border-emerald-300",
    };
  } else if (percentage >= 25) {
    return {
      title: "Casual Acquaintance 👀",
      subtitle: "You’ve crossed paths, but maybe it’s time to grab coffee and catch up properly.",
      badge: "In The Loop",
      color: "text-sky-700 bg-sky-50 border-sky-300",
    };
  } else {
    return {
      title: "Strangers on a Train 🚂",
      subtitle: "Are you sure you know this person? Time to hang out and ask some real questions!",
      badge: "Mysterious",
      color: "text-rose-700 bg-rose-50 border-rose-300",
    };
  }
}

export function generateShareLinks(url: string, title: string, creatorName: string, scoreText?: string) {
  const message = scoreText
    ? `I just scored ${scoreText} on ${creatorName}'s quiz on Knowly! Can you beat my score? Check it out:`
    : `How well do you really know ${creatorName}? Take my interactive test on Knowly:`;

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${message} ${url}`);

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(message)}`,
  };
}
