import { ProviderDescriptor, ProviderHealth } from '../types';

export const REGISTERED_PROVIDERS: ProviderDescriptor[] = [
  {
    id: 'authorized-cdn',
    name: 'Nebula Stream CDN (Direct)',
    method: 'authorized-file',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['ID', 'GLOBAL'],
    description: 'Direct high-speed authorized MP4/WebM video stream CDN.',
  },
  {
    id: 'muse-id',
    name: 'Muse Indonesia (Official)',
    method: 'official-embed',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['ID', 'SEA'],
    description: 'Official licensed anime YouTube distribution for Indonesia & SEA region.',
  },
  {
    id: 'ani-one',
    name: 'Ani-One Asia (Official)',
    method: 'official-embed',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['ID', 'SEA'],
    description: 'Official licensed anime distribution partner by Medialink.',
  },
  {
    id: 'bilibili',
    name: 'Bilibili / Bstation',
    method: 'official-embed',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['ID', 'SEA'],
    description: 'Licensed anime streaming platform with Indonesian subtitles.',
  },
  {
    id: 'gogo-web',
    name: 'GogoStream Player',
    method: 'official-embed',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['GLOBAL'],
    description: 'High performance web anime stream player.',
  },
  {
    id: 'hls-stream',
    name: 'Direct HLS Stream',
    method: 'authorized-file',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['GLOBAL'],
    description: 'Direct adaptive HLS master stream.',
  },
  {
    id: 'scrapr-resolver',
    name: 'Scrapr Link Engine',
    method: 'authorized-file',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['GLOBAL'],
    description: 'Node.js media link resolver powered by @coflyn/scrapr.',
  },
  {
    id: 'crunchyroll-external',
    name: 'Crunchyroll',
    method: 'external-link',
    enabled: true,
    permissionStatus: 'approved',
    supportedRegions: ['GLOBAL'],
    description: 'Official global anime streaming destination.',
  },
];

// In-memory health tracker (per server lifecycle)
const providerHealthMap = new Map<string, ProviderHealth>();

// Initialize default health states
REGISTERED_PROVIDERS.forEach((p) => {
  providerHealthMap.set(p.id, {
    providerId: p.id,
    name: p.name,
    status: 'available',
    failureCount: 0,
    lastCheckedAt: new Date().toISOString(),
  });
});

export function getProviderHealth(providerId: string): ProviderHealth {
  const existing = providerHealthMap.get(providerId);
  if (existing) return existing;

  const fallback: ProviderHealth = {
    providerId,
    name: providerId,
    status: 'unknown',
    failureCount: 0,
    lastCheckedAt: new Date().toISOString(),
  };
  providerHealthMap.set(providerId, fallback);
  return fallback;
}

export function getAllProvidersHealth(): ProviderHealth[] {
  return Array.from(providerHealthMap.values());
}

export function recordProviderSuccess(providerId: string, responseTimeMs?: number) {
  const current = getProviderHealth(providerId);
  providerHealthMap.set(providerId, {
    ...current,
    status: 'available',
    responseTimeMs: responseTimeMs ?? current.responseTimeMs,
    failureCount: 0,
    lastCheckedAt: new Date().toISOString(),
    cooldownUntil: undefined,
  });
}

export function recordProviderFailure(providerId: string, errorCode: string) {
  const current = getProviderHealth(providerId);
  const newFailureCount = current.failureCount + 1;
  const isCircuitBroken = newFailureCount >= 3;

  providerHealthMap.set(providerId, {
    ...current,
    status: isCircuitBroken ? 'unavailable' : 'degraded',
    lastErrorCode: errorCode,
    failureCount: newFailureCount,
    lastCheckedAt: new Date().toISOString(),
    cooldownUntil: isCircuitBroken
      ? new Date(Date.now() + 60_000).toISOString() // 1 minute cooldown
      : undefined,
  });
}

export function isProviderEligible(providerId: string): boolean {
  const descriptor = REGISTERED_PROVIDERS.find((p) => p.id === providerId);
  if (!descriptor || !descriptor.enabled || descriptor.permissionStatus !== 'approved') {
    return false;
  }

  const health = getProviderHealth(providerId);
  if (health.status === 'unavailable') {
    if (health.cooldownUntil && new Date(health.cooldownUntil).getTime() > Date.now()) {
      return false; // Still cooling down
    }
  }

  return true;
}
