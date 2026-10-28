import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/lib/metadata/anilist';
import { ApiResponse, Anime } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json({
        data: [],
        error: null,
        meta: { total: 0 },
      });
    }

    if (query.length < 2) {
      return NextResponse.json({
        data: [],
        error: null,
        meta: { total: 0, message: 'Ketik minimal 2 karakter untuk mencari.' },
      });
    }

    const result = await searchAnime({
      search: query,
      page: 1,
      perPage: 10,
    });

    const response: ApiResponse<Anime[]> = {
      data: result.items,
      error: null,
      meta: {
        total: result.total,
        hasMore: result.hasMore,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/search] Error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'METADATA_UNAVAILABLE',
          message: 'Layanan pencarian sedang tidak dapat dihubungi.',
        },
      },
      { status: 500 }
    );
  }
}
