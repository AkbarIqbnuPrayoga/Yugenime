import { WatchProgress, WatchlistItem, UserPreferences } from './types';

const WATCHLIST_KEY = 'yugen_watchlist_v1';
const HISTORY_KEY = 'yugen_history_v1';
const PREFERENCES_KEY = 'yugen_prefs_v1';
const INTRO_SEEN_KEY = 'yugen_intro_completed';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'midnight-astral',
  reducedMotion: false,
  autoplayNext: true,
  defaultQuality: 'auto',
  volume: 0.9,
  muted: false,
};

function safeGetItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[YUGEN Storage] Failed to read ${key}:`, e);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[YUGEN Storage] Failed to write ${key}:`, e);
    return false;
  }
}

// ----------------- WATCHLIST -----------------
export const getWatchlist = (): WatchlistItem[] => {
  return safeGetItem<WatchlistItem[]>(WATCHLIST_KEY, []);
};

export const isInWatchlist = (animeId: string): boolean => {
  const list = getWatchlist();
  return list.some((item) => String(item.animeId) === String(animeId));
};

export const addToWatchlist = (item: WatchlistItem): boolean => {
  const current = getWatchlist();
  if (current.some((i) => String(i.animeId) === String(item.animeId))) {
    return true;
  }
  const updated = [item, ...current];
  const success = safeSetItem(WATCHLIST_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yugen:watchlist-updated', { detail: updated }));
  }
  return success;
};

export const removeFromWatchlist = (animeId: string): boolean => {
  const current = getWatchlist();
  const updated = current.filter((item) => String(item.animeId) !== String(animeId));
  const success = safeSetItem(WATCHLIST_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yugen:watchlist-updated', { detail: updated }));
  }
  return success;
};

export const toggleWatchlist = (item: WatchlistItem): boolean => {
  if (isInWatchlist(item.animeId)) {
    return removeFromWatchlist(item.animeId);
  } else {
    return addToWatchlist(item);
  }
};

// ----------------- PROGRESS & HISTORY -----------------
export const getWatchHistory = (): WatchProgress[] => {
  const list = safeGetItem<WatchProgress[]>(HISTORY_KEY, []);
  return list.sort(
    (a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
  );
};

export const getAnimeProgress = (animeId: string): WatchProgress | undefined => {
  const history = getWatchHistory();
  return history.find((h) => String(h.animeId) === String(animeId));
};

export const getEpisodeProgress = (episodeId: string): WatchProgress | undefined => {
  const history = getWatchHistory();
  return history.find((h) => String(h.episodeId) === String(episodeId));
};

export const saveWatchProgress = (progress: WatchProgress): boolean => {
  // Validate position
  if (progress.positionSeconds < 0) progress.positionSeconds = 0;
  if (progress.durationSeconds && progress.positionSeconds > progress.durationSeconds) {
    progress.positionSeconds = progress.durationSeconds;
  }

  // Calculate completion (e.g. 90% watched)
  if (progress.durationSeconds && progress.positionSeconds / progress.durationSeconds >= 0.9) {
    progress.completed = true;
  }

  const current = getWatchHistory().filter((p) => String(p.episodeId) !== String(progress.episodeId));
  const updated = [progress, ...current];
  const success = safeSetItem(HISTORY_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yugen:history-updated', { detail: updated }));
  }
  return success;
};

export const removeFromHistory = (episodeId: string): boolean => {
  const current = getWatchHistory();
  const updated = current.filter((p) => String(p.episodeId) !== String(episodeId));
  const success = safeSetItem(HISTORY_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yugen:history-updated', { detail: updated }));
  }
  return success;
};

export const clearWatchHistory = (): boolean => {
  const success = safeSetItem(HISTORY_KEY, []);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yugen:history-updated', { detail: [] }));
  }
  return success;
};

// ----------------- PREFERENCES -----------------
export const getPreferences = (): UserPreferences => {
  return safeGetItem<UserPreferences>(PREFERENCES_KEY, DEFAULT_PREFERENCES);
};

export const savePreferences = (prefs: Partial<UserPreferences>): UserPreferences => {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  safeSetItem(PREFERENCES_KEY, updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yugen:prefs-updated', { detail: updated }));
  }
  return updated;
};

// ----------------- INTRO LIFECYCLE -----------------
export const isIntroSeen = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
};

export const markIntroSeen = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, 'true');
  } catch (e) {
    console.warn('[YUGEN Storage] sessionStorage error:', e);
  }
};
