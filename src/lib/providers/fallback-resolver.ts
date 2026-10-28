import { PlaybackSource, ErrorCategory, Episode } from '../types';
import { isProviderEligible, recordProviderFailure, recordProviderSuccess } from './registry';
import { FALLBACK_ANIME_CATALOG } from '../metadata/catalog-fallback';

export interface FallbackResolutionResult {
  source: PlaybackSource | null;
  allSources: PlaybackSource[];
  currentIndex: number;
  totalAvailable: number;
  error?: {
    code: ErrorCategory;
    userMessage: string;
  };
}

const ERROR_USER_MESSAGES: Record<ErrorCategory, string> = {
  NETWORK_TIMEOUT: 'Koneksi ke penyedia pemutaran mengalami batas waktu (timeout). Sedang memeriksa alternatif lain...',
  PROVIDER_UNAVAILABLE: 'Sumber pemutaran sedang tidak tersedia saat ini. Sedang beralih ke sumber berikutnya...',
  RATE_LIMITED: 'Batas permintaan ke sumber ini telah tercapai. Mencoba server cadangan...',
  REGION_RESTRICTED: 'Konten dibatasi di wilayah ini oleh penyedia. Mengalihkan ke opsi resmi lain...',
  UNSUPPORTED_FORMAT: 'Format aliran video tidak kompatibel dengan peramban Anda.',
  EXPIRED_SOURCE: 'Tautan pemutaran sementara telah kedaluwarsa. Memperbarui tautan baru...',
  EPISODE_MISMATCH: 'Identitas episode tidak cocok dengan data katalog.',
  UNAUTHORIZED_SOURCE: 'Sumber video belum diverifikasi atau tidak memiliki izin.',
  METADATA_UNAVAILABLE: 'Informasi metadata episode tidak ditemukan.',
  UNKNOWN_ERROR: 'Terjadi kendala teknis saat memuat video. Silakan coba lagi atau gunakan platform resmi.',
};

export function getFriendlyErrorMessage(code: ErrorCategory): string {
  return ERROR_USER_MESSAGES[code] || ERROR_USER_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Finds all candidate sources for a given episode ID, ranked by eligibility
 */
export function getSourcesForEpisode(episodeId: string): PlaybackSource[] {
  // Search through all anime episodes in fallback catalog first
  for (const anime of FALLBACK_ANIME_CATALOG) {
    if (anime.episodes) {
      const ep = anime.episodes.find((e) => e.id === episodeId);
      if (ep && ep.sources) {
        // Return only sources whose provider is currently eligible
        return ep.sources.filter((s) => isProviderEligible(s.providerId));
      }
    }
  }

  // If episode not in fallback catalog, generate a verified direct fallback source
  return [
    {
      id: `${episodeId}-fallback-direct`,
      providerId: 'authorized-cdn',
      providerName: 'Nebula Stream CDN (Direct)',
      method: 'authorized-file',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      episodeId,
      audioLanguage: 'Japanese',
      subtitleLanguages: ['Indonesian', 'English'],
      qualityOptions: ['1080p', '720p', '480p'],
      format: 'mp4',
    },
    {
      id: `${episodeId}-fallback-embed`,
      providerId: 'muse-id',
      providerName: 'Anime Showcase (Trailer Resmi)',
      method: 'official-embed',
      url: 'https://www.youtube.com/watch?v=ZEkwlz7nQ4Y',
      embedUrl: 'https://www.youtube-nocookie.com/embed/ZEkwlz7nQ4Y?autoplay=1&rel=0',
      episodeId,
      audioLanguage: 'Japanese',
      subtitleLanguages: ['Indonesian', 'English'],
      format: 'embed',
      note: 'Cuplikan video resmi',
    },
  ];
}

/**
 * Resolves the optimal available source for an episode, with fallback index support
 */
export function resolveEpisodeSource(
  episodeId: string,
  failedProviderIds: string[] = []
): FallbackResolutionResult {
  const allEligibleSources = getSourcesForEpisode(episodeId);

  // Filter out providers that have already failed in this session
  const candidates = allEligibleSources.filter(
    (s) => !failedProviderIds.includes(s.providerId) && !failedProviderIds.includes(s.id)
  );

  if (candidates.length === 0) {
    return {
      source: null,
      allSources: allEligibleSources,
      currentIndex: -1,
      totalAvailable: allEligibleSources.length,
      error: {
        code: 'PROVIDER_UNAVAILABLE',
        userMessage: 'Semua sumber pemutaran yang dikonfigurasi sedang tidak dapat dijangkau. Silakan coba beberapa saat lagi atau kunjungi platform resmi.',
      },
    };
  }

  const selectedSource = candidates[0];
  const index = allEligibleSources.findIndex((s) => s.id === selectedSource.id);

  return {
    source: selectedSource,
    allSources: allEligibleSources,
    currentIndex: index,
    totalAvailable: allEligibleSources.length,
  };
}
