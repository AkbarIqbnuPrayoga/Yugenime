import { NextRequest, NextResponse } from 'next/server';
import { getAnimeById } from '@/lib/metadata/anilist';
import { ApiResponse, Episode } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anime = await getAnimeById(id);

    if (!anime) {
      return NextResponse.json(
        { data: null, error: { code: 'METADATA_UNAVAILABLE', message: 'Anime tidak ditemukan.' } },
        { status: 404 }
      );
    }

    const episodes = anime.episodes || [];
    const response: ApiResponse<Episode[]> = {
      data: episodes,
      error: null,
      meta: {
        total: episodes.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/anime/:id/episodes] Error:', error);
    return NextResponse.json(
      { data: null, error: { code: 'UNKNOWN_ERROR', message: 'Gagal memuat daftar episode.' } },
      { status: 500 }
    );
  }
}
