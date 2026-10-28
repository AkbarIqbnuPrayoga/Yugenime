import { NextRequest, NextResponse } from 'next/server';
import { getSourcesForEpisode } from '@/lib/providers/fallback-resolver';
import { scrapeLiveAnimeSources } from '@/lib/providers/anime-scraper';
import { ApiResponse, PlaybackSource } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    if (!episodeId) {
      return NextResponse.json(
        { data: null, error: { code: 'EPISODE_MISMATCH', message: 'ID episode wajib disertakan.' } },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || '';
    const romaji = searchParams.get('romaji') || '';
    const trailerId = searchParams.get('trailer') || '';

    // Extract episode number from query or from episodeId pattern (e.g. "12345-ep-3" -> 3)
    let episodeNumber = Number(searchParams.get('ep'));
    if (!episodeNumber || isNaN(episodeNumber)) {
      const match = episodeId.match(/-ep-(\d+)$/i);
      episodeNumber = match ? Number(match[1]) : 1;
    }

    // 1. Fetch live sources using the scraper
    let liveSources: PlaybackSource[] = [];
    if (title || romaji) {
      try {
        liveSources = await scrapeLiveAnimeSources({
          title,
          romajiTitle: romaji,
          episodeNumber,
          trailerId,
        });
      } catch (err) {
        console.warn('[API sources] Scraper error, will use backup providers:', err);
      }
    }

    // 2. Fetch standard fallback providers
    const fallbackSources = getSourcesForEpisode(episodeId);

    // 3. Combine: live scraped sources take top priority
    const combinedSources: PlaybackSource[] = [
      ...liveSources,
      ...fallbackSources.filter(
        (fb) => !liveSources.some((ls) => ls.url === fb.url || ls.id === fb.id)
      ),
    ];

    if (combinedSources.length === 0) {
      const emptyResponse: ApiResponse<PlaybackSource[]> = {
        data: [],
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          message: 'Belum ada sumber pemutaran terverifikasi untuk episode ini.',
        },
      };
      return NextResponse.json(emptyResponse, { status: 404 });
    }

    const response: ApiResponse<PlaybackSource[]> = {
      data: combinedSources,
      error: null,
      meta: {
        total: combinedSources.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/episodes/:episodeId/sources] Error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Terjadi kegagalan saat memeriksa sumber pemutaran.',
        },
      },
      { status: 500 }
    );
  }
}
