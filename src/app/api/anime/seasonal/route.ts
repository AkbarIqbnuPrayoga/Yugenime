import { NextRequest, NextResponse } from 'next/server';
import { getSeasonalAnime } from '@/lib/metadata/anilist';
import { ApiResponse, Anime } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || undefined;
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;

    const data = await getSeasonalAnime(season, year, limit);

    const response: ApiResponse<Anime[]> = {
      data,
      error: null,
      meta: {
        total: data.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/anime/seasonal] Error:', error);
    const errorResponse: ApiResponse<Anime[]> = {
      data: null,
      error: {
        code: 'METADATA_UNAVAILABLE',
        message: 'Tidak dapat memuat anime musiman.',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
