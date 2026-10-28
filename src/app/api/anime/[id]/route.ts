import { NextRequest, NextResponse } from 'next/server';
import { getAnimeById } from '@/lib/metadata/anilist';
import { ApiResponse, Anime } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { data: null, error: { code: 'METADATA_UNAVAILABLE', message: 'ID anime tidak valid.' } },
        { status: 400 }
      );
    }

    const anime = await getAnimeById(id);

    if (!anime) {
      const notFoundResponse: ApiResponse<null> = {
        data: null,
        error: {
          code: 'METADATA_UNAVAILABLE',
          message: 'Anime tidak ditemukan dalam portal kami.',
        },
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const response: ApiResponse<Anime> = {
      data: anime,
      error: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/anime/:id] Error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Terjadi kesalahan saat memuat detail anime.',
        },
      },
      { status: 500 }
    );
  }
}
