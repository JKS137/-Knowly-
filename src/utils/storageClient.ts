// Client storage helper for managing creator tokens and participant preferences

const CREATOR_TOKENS_KEY = 'knowly_creator_tokens';
const PARTICIPANT_PROFILE_KEY = 'knowly_participant_profile';

export interface CreatorTokenEntry {
  shortId: string;
  token: string;
  title: string;
  savedAt: string;
}

export const clientStorage = {
  getCreatorTokens(): CreatorTokenEntry[] {
    try {
      const raw = localStorage.getItem(CREATOR_TOKENS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveCreatorToken(shortId: string, token: string, title: string) {
    try {
      const list = this.getCreatorTokens().filter(entry => entry.shortId !== shortId);
      list.unshift({
        shortId,
        token,
        title,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(CREATOR_TOKENS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save creator token in localStorage', e);
    }
  },

  getCreatorToken(shortId: string): string | null {
    const list = this.getCreatorTokens();
    const found = list.find(entry => entry.shortId === shortId);
    return found ? found.token : null;
  },

  removeCreatorToken(shortId: string) {
    try {
      const list = this.getCreatorTokens().filter(entry => entry.shortId !== shortId);
      localStorage.setItem(CREATOR_TOKENS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to remove creator token', e);
    }
  },

  getParticipantProfile(): { nickname: string; emoji: string } {
    try {
      const raw = localStorage.getItem(PARTICIPANT_PROFILE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { nickname: '', emoji: '🦊' };
  },

  saveParticipantProfile(nickname: string, emoji: string) {
    try {
      localStorage.setItem(
        PARTICIPANT_PROFILE_KEY,
        JSON.stringify({ nickname: nickname.trim(), emoji })
      );
    } catch (e) {
      console.warn('Failed to save participant profile', e);
    }
  },
};
