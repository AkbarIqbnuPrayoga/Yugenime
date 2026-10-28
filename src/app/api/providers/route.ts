import { NextResponse } from 'next/server';
import { getAllProvidersHealth, REGISTERED_PROVIDERS } from '@/lib/providers/registry';

export async function GET() {
  const healthList = getAllProvidersHealth();
  const fullList = REGISTERED_PROVIDERS.map((provider) => {
    const health = healthList.find((h) => h.providerId === provider.id);
    return {
      ...provider,
      health: health || {
        status: 'available',
        failureCount: 0,
        lastCheckedAt: new Date().toISOString(),
      },
    };
  });

  return NextResponse.json({
    data: fullList,
    error: null,
  });
}
