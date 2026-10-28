export type PlaybackMethod =
  | 'official-embed'
  | 'authorized-hls'
  | 'authorized-file'
  | 'external-link';

export type ProviderStatus = 'available' | 'degraded' | 'unavailable' | 'unknown';

export type PlayerState =
  | 'idle'
  | 'resolving'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'retrying'
  | 'error'
  | 'completed';

export type ErrorCategory =
  | 'NETWORK_TIMEOUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'REGION_RESTRICTED'
  | 'UNSUPPORTED_FORMAT'
  | 'EXPIRED_SOURCE'
  | 'EPISODE_MISMATCH'
  | 'UNAUTHORIZED_SOURCE'
  | 'METADATA_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

export interface ProviderDescriptor {
  id: string;
  name: string;
  method: PlaybackMethod;
  enabled: boolean;
  permissionStatus: 'approved' | 'pending' | 'rejected';
  supportedRegions?: string[];
  description?: string;
}

export interface PlaybackSource {
  id: string;
  providerId: string;
  providerName: string;
  method: PlaybackMethod;
  url: string;
  episodeId: string;
  expiresAt?: string;
  audioLanguage?: string;
  subtitleLanguages?: string[];
  qualityOptions?: string[];
  embedUrl?: string;
  isExternal?: boolean;
  format?: 'hls' | 'mp4' | 'embed' | 'external';
  note?: string;
}

export interface AnimeTitle {
  romaji?: string;
  english?: string;
  native?: string;
}

export interface Anime {
  id: string;
  externalIds: Record<string, string | number>;
  title: AnimeTitle;
  synopsis?: string;
  coverImage?: string;
  bannerImage?: string;
  genres: string[];
  releaseYear?: number;
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | string;
  format?: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | string;
  status?: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | string;
  episodeCount?: number;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  studios?: string[];
  trailer?: {
    id?: string;
    site?: string;
    thumbnail?: string;
  };
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  thumbnail?: string;
  durationSeconds?: number;
  releaseAt?: string;
  synopsis?: string;
  sources?: PlaybackSource[];
}

export interface WatchProgress {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle?: string;
  animeTitle: string;
  animeCover: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface WatchlistItem {
  animeId: string;
  title: string;
  coverImage: string;
  bannerImage?: string;
  genres: string[];
  releaseYear?: number;
  format?: string;
  status?: string;
  addedAt: string;
}

export interface ProviderHealth {
  providerId: string;
  name: string;
  status: ProviderStatus;
  responseTimeMs?: number;
  lastErrorCode?: ErrorCategory | string;
  failureCount: number;
  lastCheckedAt: string;
  cooldownUntil?: string;
}

export interface UserPreferences {
  theme: 'midnight-astral';
  reducedMotion: boolean;
  autoplayNext: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '480p';
  volume: number;
  muted: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: ErrorCategory | string;
    message: string;
  } | null;
  meta?: {
    total?: number;
    page?: number;
    hasMore?: boolean;
    provider?: string;
  };
}
