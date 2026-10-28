import { NextRequest, NextResponse } from 'next/server';
import { resolveWithScrapr, validateSafeUrl } from '@/lib/providers/scrapr-adapter';
import { ApiResponse, PlaybackSource } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, episodeId, providerHint } = body;

    if (!url || !episodeId) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: 'UNAUTHORIZED_SOURCE',
            message: 'URL dan episodeId wajib diisi.',
          },
        },
        { status: 400 }
      );
    }

    // SSRF and safety check
    const safetyCheck = validateSafeUrl(url);
    if (!safetyCheck.valid) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: safetyCheck.error || 'UNAUTHORIZED_SOURCE',
            message: 'Alamat tautan tidak memenuhi standar keamanan platform.',
          },
        },
        { status: 403 }
      );
    }

    const result = await resolveWithScrapr({ url, episodeId, providerHint });

    if (result.error || !result.source) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: result.error || 'PROVIDER_UNAVAILABLE',
            message: result.message || 'Penyedia tidak dapat menyelesaikan tautan media ini.',
          },
        },
        { status: 502 }
      );
    }

    const response: ApiResponse<PlaybackSource> = {
      data: result.source,
      error: null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API /api/playback/resolve] Error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'Gagal memproses permintaan resolusi pemutaran.',
        },
      },
      { status: 500 }
    );
  }
}
