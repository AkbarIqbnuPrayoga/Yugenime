import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/lib/metadata/anilist';
import { ApiResponse, Anime } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const year = searchParams.get('year') ? Number(searchParams.get('year')) : undefined;
    const season = searchParams.get('season') || undefined;
    const format = searchParams.get('format') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;

    const result = await searchAnime({
      search: q,
      genre,
      year,
      season,
      format,
      status,
      page,
      perPage: limit,
    });

    const response: ApiResponse<Anime[]> = {
      data: result.items,
      error: null,
      meta: {
        total: result.total,
        page,
        hasMore: result.hasMore,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/anime] Error:', error);
    const errorResponse: ApiResponse<Anime[]> = {
      data: null,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Gagal memuat katalog anime.',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
