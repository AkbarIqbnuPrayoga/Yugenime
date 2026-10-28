import { NextRequest, NextResponse } from 'next/server';
import { getTrendingAnime } from '@/lib/metadata/anilist';
import { ApiResponse, Anime } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 10;

    const data = await getTrendingAnime(limit);

    const response: ApiResponse<Anime[]> = {
      data,
      error: null,
      meta: {
        total: data.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/anime/trending] Error:', error);
    const errorResponse: ApiResponse<Anime[]> = {
      data: null,
      error: {
        code: 'METADATA_UNAVAILABLE',
        message: 'Tidak dapat memuat anime trending saat ini.',
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
