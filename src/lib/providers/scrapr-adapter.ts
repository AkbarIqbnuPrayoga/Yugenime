import { PlaybackSource, ErrorCategory } from '../types';
import { recordProviderFailure, recordProviderSuccess } from './registry';

// Dynamic import / require of @coflyn/scrapr to ensure safe server-side execution
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let scraprLib: any = null;

function getScrapr() {
  if (!scraprLib) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      scraprLib = require('@coflyn/scrapr');
    } catch (e) {
      console.warn('[Scrapr Adapter] Failed to require @coflyn/scrapr:', e);
    }
  }
  return scraprLib;
}

// Host allowlist & SSRF protection
const FORBIDDEN_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

export function validateSafeUrl(urlString: string): { valid: boolean; error?: ErrorCategory } {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { valid: false, error: 'UNAUTHORIZED_SOURCE' };
    }

    const hostname = url.hostname;
    for (const pattern of FORBIDDEN_HOST_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'UNAUTHORIZED_SOURCE' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'UNSUPPORTED_FORMAT' };
  }
}

export interface ResolveOptions {
  url: string;
  episodeId: string;
  providerHint?: string;
}

/**
 * Resolves media links using @coflyn/scrapr methods with safety validation
 */
export async function resolveWithScrapr(options: {
  url: string;
  episodeId: string;
  providerHint?: string;
}): Promise<{ source: PlaybackSource | null; error?: ErrorCategory; message?: string }> {
  const { url, episodeId, providerHint } = options;

  const validation = validateSafeUrl(url);
  if (!validation.valid) {
    return {
      source: null,
      error: validation.error || 'UNAUTHORIZED_SOURCE',
      message: 'The requested media URL failed security validation.',
    };
  }

  const startTime = Date.now();
  const scrapr = getScrapr();

  if (!scrapr) {
    recordProviderFailure('scrapr-resolver', 'PROVIDER_UNAVAILABLE');
    return {
      source: null,
      error: 'PROVIDER_UNAVAILABLE',
      message: 'Scrapr media extraction engine is not initialized.',
    };
  }

  try {
    const lowerUrl = url.toLowerCase();

    // 1. Bilibili Handler
    if (lowerUrl.includes('bilibili.tv') || lowerUrl.includes('bilibili.com')) {
      if (typeof scrapr.bilibili?.direct === 'function') {
        const res = await scrapr.bilibili.direct(url);
        if (res?.status && res?.result?.downloads?.length) {
          const dl = res.result.downloads[0];
          recordProviderSuccess('scrapr-resolver', Date.now() - startTime);

          return {
            source: {
              id: `scrapr-bilibili-${Date.now()}`,
              providerId: 'bilibili',
              providerName: 'Bilibili Stream Resolver',
              method: 'authorized-file',
              url: dl.url,
              episodeId,
              audioLanguage: 'Japanese',
              subtitleLanguages: ['Indonesian', 'English'],
              qualityOptions: res.result.downloads.map((d: { quality?: string }) => d.quality || 'Auto'),
              format: 'mp4',
            },
          };
        }
      }
    }

    // 2. YouTube Handler
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      // Transform youtube url into embed-friendly secure source
      let videoId = '';
      try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) {
          videoId = u.pathname.slice(1);
        } else {
          videoId = u.searchParams.get('v') || '';
        }
      } catch {
        // ignore
      }

      if (videoId) {
        return {
          source: {
            id: `youtube-${videoId}`,
            providerId: providerHint || 'muse-id',
            providerName: 'YouTube Official Embed',
            method: 'official-embed',
            url,
            embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
            episodeId,
            format: 'embed',
          },
        };
      }
    }

    // 3. MediaFire / File Resolvers
    if (scrapr.resolver) {
      let directUrl: string | null = null;
      if (lowerUrl.includes('mediafire.com') && typeof scrapr.resolver.mediafire === 'function') {
        const res = await scrapr.resolver.mediafire(url);
        if (res?.status && res?.result?.url) directUrl = res.result.url;
      } else if (lowerUrl.includes('pixeldrain.com') && typeof scrapr.resolver.pixeldrain === 'function') {
        const res = await scrapr.resolver.pixeldrain(url);
        if (res?.status && res?.result?.url) directUrl = res.result.url;
      } else if (lowerUrl.includes('catbox.moe') && typeof scrapr.resolver.catbox === 'function') {
        const res = await scrapr.resolver.catbox(url);
        if (res?.status && res?.result?.url) directUrl = res.result.url;
      }

      if (directUrl) {
        recordProviderSuccess('scrapr-resolver', Date.now() - startTime);
        return {
          source: {
            id: `scrapr-res-${Date.now()}`,
            providerId: 'scrapr-resolver',
            providerName: 'Scrapr Direct CDN',
            method: 'authorized-file',
            url: directUrl,
            episodeId,
            format: directUrl.includes('.m3u8') ? 'hls' : 'mp4',
          },
        };
      }
    }

    // If unresolved
    return {
      source: null,
      error: 'UNSUPPORTED_FORMAT',
      message: 'This source format could not be resolved by current adapters.',
    };
  } catch (err) {
    recordProviderFailure('scrapr-resolver', 'UNKNOWN_ERROR');
    console.error('[Scrapr Adapter] Resolution error:', err);
    return {
      source: null,
      error: 'PROVIDER_UNAVAILABLE',
      message: 'Resolver encountered an unexpected error while contacting provider.',
    };
  }
}
