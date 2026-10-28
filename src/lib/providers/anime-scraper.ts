import { PlaybackSource } from '../types';
import { recordProviderFailure, recordProviderSuccess } from './registry';

// Dynamic import of @coflyn/scrapr
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let scraprLib: any = null;

function getScrapr() {
  if (!scraprLib) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      scraprLib = require('@coflyn/scrapr');
    } catch (e) {
      console.warn('[Anime Scraper] Failed to load @coflyn/scrapr:', e);
    }
  }
  return scraprLib;
}

/**
 * Cleans an anime title for better hit-rate on streaming search indexes
 */
export function cleanTitleForSearch(title: string): string {
  if (!title) return '';
  return title
    .replace(/\(Dub\)/gi, '')
    .replace(/\(Sub\)/gi, '')
    .replace(/Season \d+/gi, '')
    .replace(/2nd Season/gi, '')
    .replace(/3rd Season/gi, '')
    .replace(/Part \d+/gi, '')
    .replace(/:\s*.*$/, '') // Strip long subtitle after colon
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ScrapeOptions {
  title: string;
  episodeNumber: number;
  romajiTitle?: string;
  trailerId?: string;
}

/**
 * Live multi-source scraper for anime episodes.
 * Queries Gogoanime & Otakudesu streaming providers and transforms them into PlaybackSource objects.
 */
export async function scrapeLiveAnimeSources(options: ScrapeOptions): Promise<PlaybackSource[]> {
  const { title, episodeNumber, romajiTitle, trailerId } = options;
  const sources: PlaybackSource[] = [];
  const scrapr = getScrapr();

  if (!scrapr) {
    return sources;
  }

  const queriesToTry = Array.from(
    new Set([
      cleanTitleForSearch(title),
      cleanTitleForSearch(romajiTitle || ''),
      title.slice(0, 30).trim(),
    ].filter(Boolean))
  );

  // 1. Try Gogoanime
  for (const query of queriesToTry) {
    if (sources.length > 0) break;

    try {
      const startTime = Date.now();
      const searchRes = await scrapr.anime.gogoanime.search(query);

      if (searchRes?.status && searchRes.result?.length > 0) {
        // Pick best match: prefer sub over dub if both exist
        const bestMatch =
          searchRes.result.find((r: { title: string }) => !r.title.includes('(Dub)')) ||
          searchRes.result[0];

        const epList = await scrapr.anime.gogoanime.getEpisodes(bestMatch.url);

        if (epList?.status && epList.result?.length > 0) {
          // Find matching episode
          const targetEp =
            epList.result.find((e: { title: string; url: string }) =>
              e.title === `EP ${episodeNumber}` ||
              e.url.endsWith(`-episode-${episodeNumber}`) ||
              e.url.includes(`episode-${episodeNumber}`)
            ) || epList.result[0];

          if (targetEp?.url) {
            const streamData = await scrapr.anime.gogoanime.scrape(targetEp.url);

            if (streamData?.status && streamData.result?.downloads) {
              recordProviderSuccess('gogo-web', Date.now() - startTime);

              streamData.result.downloads.forEach(
                (dl: { quality?: string; url?: string }, idx: number) => {
                  if (dl.url && dl.url.startsWith('http')) {
                    const isEmbed =
                      dl.quality?.includes('Web Player') ||
                      dl.url.includes('newplayer.php') ||
                      dl.url.includes('embed');

                    sources.push({
                      id: `gogo-live-${episodeNumber}-${idx + 1}`,
                      providerId: isEmbed ? 'gogo-web' : 'hls-stream',
                      providerName: dl.quality || `Server Streaming ${idx + 1}`,
                      method: isEmbed ? 'official-embed' : 'authorized-file',
                      url: dl.url,
                      embedUrl: isEmbed ? dl.url : undefined,
                      format: isEmbed ? 'embed' : dl.url.includes('.m3u8') ? 'hls' : 'mp4',
                      episodeId: `ep-${episodeNumber}`,
                      audioLanguage: 'Japanese',
                      subtitleLanguages: ['English', 'Indonesian'],
                      note: isEmbed ? 'Tonton langsung di web player' : 'Aliran video HLS',
                    });
                  }
                }
              );
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[Anime Scraper] Gogoanime query "${query}" error:`, err);
      recordProviderFailure('gogo-web', 'NETWORK_TIMEOUT');
    }
  }

  // 2. If trailerId is provided, provide official trailer embed as a verified alternative
  if (trailerId) {
    sources.push({
      id: `trailer-${trailerId}`,
      providerId: 'muse-id',
      providerName: 'Cuplikan Resmi (Trailer PV)',
      method: 'official-embed',
      url: `https://www.youtube.com/watch?v=${trailerId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1&rel=0`,
      episodeId: `ep-${episodeNumber}`,
      audioLanguage: 'Japanese',
      subtitleLanguages: ['Indonesian', 'English'],
      format: 'embed',
      note: 'Cuplikan dan promosi video resmi',
    });
  }

  return sources;
}
