import { NextRequest, NextResponse } from 'next/server';
import { recordProviderFailure } from '@/lib/providers/registry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, errorCode } = body;

    if (providerId) {
      recordProviderFailure(providerId, errorCode || 'PLAYBACK_FAILURE');
    }

    return NextResponse.json({ success: true, message: 'Laporan kesalahan penyedia diterima.' });
  } catch (error) {
    console.error('[API /api/playback/report-error] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
