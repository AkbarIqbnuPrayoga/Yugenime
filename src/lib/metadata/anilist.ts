import { Anime } from '../types';
import { FALLBACK_ANIME_CATALOG } from './catalog-fallback';

const ANILIST_GRAPHQL_ENDPOINT = process.env.METADATA_API_BASE_URL || 'https://graphql.anilist.co';
const TIMEOUT_MS = Number(process.env.PROVIDER_TIMEOUT_MS) || 6000;

interface AniListMedia {
  id: number;
  idMal?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  bannerImage?: string;
  coverImage?: {
    extraLarge?: string;
    large?: string;
    medium?: string;
  };
  genres?: string[];
  seasonYear?: number;
  season?: string;
  format?: string;
  status?: string;
  episodes?: number;
  duration?: number;
  averageScore?: number;
  popularity?: number;
  studios?: {
    nodes?: Array<{ name: string }>;
  };
  trailer?: {
    id?: string;
    site?: string;
  };
}

const MEDIA_QUERY_FIELDS = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  description
  bannerImage
  coverImage {
    extraLarge
    large
    medium
  }
  genres
  seasonYear
  season
  format
  status
  episodes
  duration
  averageScore
  popularity
  studios(isMain: true) {
    nodes {
      name
    }
  }
  trailer {
    id
    site
  }
`;

function normalizeAniListMedia(media: AniListMedia): Anime {
  const cleanSynopsis = media.description
    ? media.description.replace(/<[^>]*>?/gm, '').trim()
    : undefined;

  const animeId = String(media.id);
  // Check if we have fallback episodes or video sources matching this ID
  const fallbackMatch = FALLBACK_ANIME_CATALOG.find(
    (f) => String(f.externalIds?.anilist) === animeId || f.id === animeId
  );

  const fallbackEpisodes = fallbackMatch?.episodes || [];
  const finalEpisodes = fallbackEpisodes.length > 0
    ? fallbackEpisodes
    : Array.from({ length: Math.min(media.episodes || 12, 12) }, (_, i) => ({
        id: `${animeId}-ep-${i + 1}`,
        animeId: animeId,
        number: i + 1,
        title: `Episode ${i + 1}`,
        thumbnail: media.bannerImage || media.coverImage?.large || '',
        durationSeconds: (media.duration || 24) * 60,
        releaseAt: `${media.seasonYear || 2024}-01-01`,
        sources: [
          {
            id: `${animeId}-src-${i + 1}`,
            providerId: 'authorized-cdn',
            providerName: 'Nebula Stream CDN (Direct)',
            method: 'authorized-file' as const,
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            episodeId: `${animeId}-ep-${i + 1}`,
            audioLanguage: 'Japanese',
            subtitleLanguages: ['Indonesian', 'English'],
            format: 'mp4' as const,
          }
        ]
      }));

  return {
    id: animeId,
    externalIds: {
      anilist: media.id,
      mal: media.idMal || 0,
    },
    title: {
      romaji: media.title.romaji || media.title.english || '',
      english: media.title.english || media.title.romaji || '',
      native: media.title.native || '',
    },
    synopsis: cleanSynopsis,
    coverImage: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium,
    bannerImage: media.bannerImage || media.coverImage?.extraLarge,
    genres: media.genres || [],
    releaseYear: media.seasonYear,
    season: media.season,
    format: media.format,
    status: media.status,
    episodeCount: media.episodes,
    duration: media.duration,
    averageScore: media.averageScore,
    popularity: media.popularity,
    studios: media.studios?.nodes?.map((n) => n.name) || [],
    trailer: media.trailer,
    episodes: finalEpisodes,
  };
}

async function fetchFromAniList(query: string, variables: Record<string, unknown> = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 429) {
        console.warn('[AniList API] Rate limited (429). Utilizing fallback catalog.');
      }
      return null;
    }

    const json = await res.json();
    return json?.data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[AniList API] Fetch error or timeout, switching to local catalog:', err);
    return null;
  }
}

// ------------------- PUBLIC METHODS -------------------

export async function getTrendingAnime(limit = 10): Promise<Anime[]> {
  const query = `
    query GetTrending($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;

  const data = await fetchFromAniList(query, { perPage: limit });
  if (data?.Page?.media && Array.isArray(data.Page.media)) {
    return data.Page.media.map(normalizeAniListMedia);
  }

  // Graceful fallback from curated local catalog
  return FALLBACK_ANIME_CATALOG.slice(0, limit);
}

export async function getSeasonalAnime(season?: string, year?: number, limit = 12): Promise<Anime[]> {
  const currentYear = year || new Date().getFullYear();
  const currentSeason = season || 'FALL';

  const query = `
    query GetSeasonal($season: MediaSeason, $seasonYear: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC]) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;

  const data = await fetchFromAniList(query, {
    season: currentSeason.toUpperCase(),
    seasonYear: currentYear,
    perPage: limit,
  });

  if (data?.Page?.media && Array.isArray(data.Page.media)) {
    return data.Page.media.map(normalizeAniListMedia);
  }

  // Filter fallback catalog by season if available
  return FALLBACK_ANIME_CATALOG.filter(
    (a) => !season || (a.season && a.season.toUpperCase() === currentSeason.toUpperCase())
  ).slice(0, limit);
}

export async function searchAnime(options: {
  search?: string;
  genre?: string;
  year?: number;
  season?: string;
  format?: string;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}): Promise<{ items: Anime[]; total: number; hasMore: boolean }> {
  const {
    search,
    genre,
    year,
    season,
    format,
    status,
    page = 1,
    perPage = 12,
  } = options;

  const query = `
    query SearchAnime(
      $search: String,
      $genre: String,
      $seasonYear: Int,
      $season: MediaSeason,
      $format: MediaFormat,
      $status: MediaStatus,
      $page: Int,
      $perPage: Int
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          hasNextPage
        }
        media(
          type: ANIME,
          search: $search,
          genre: $genre,
          seasonYear: $seasonYear,
          season: $season,
          format: $format,
          status: $status,
          sort: [POPULARITY_DESC]
        ) {
          ${MEDIA_QUERY_FIELDS}
        }
      }
    }
  `;

  const variables: Record<string, unknown> = {
    page,
    perPage,
  };
  if (search) variables.search = search;
  if (genre) variables.genre = genre;
  if (year) variables.seasonYear = year;
  if (season) variables.season = season.toUpperCase();
  if (format) variables.format = format.toUpperCase();
  if (status) variables.status = status.toUpperCase();

  const data = await fetchFromAniList(query, variables);

  if (data?.Page?.media && Array.isArray(data.Page.media)) {
    return {
      items: data.Page.media.map(normalizeAniListMedia),
      total: data.Page.pageInfo.total || data.Page.media.length,
      hasMore: Boolean(data.Page.pageInfo.hasNextPage),
    };
  }

  // Filter local fallback catalog
  let filtered = [...FALLBACK_ANIME_CATALOG];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.romaji?.toLowerCase().includes(q) ||
        a.title.english?.toLowerCase().includes(q) ||
        a.synopsis?.toLowerCase().includes(q)
    );
  }
  if (genre) {
    filtered = filtered.filter((a) =>
      a.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
  }
  if (year) {
    filtered = filtered.filter((a) => a.releaseYear === year);
  }
  if (format) {
    filtered = filtered.filter((a) => a.format?.toLowerCase() === format.toLowerCase());
  }

  const start = (page - 1) * perPage;
  const items = filtered.slice(start, start + perPage);

  return {
    items,
    total: filtered.length,
    hasMore: start + perPage < filtered.length,
  };
}

export async function getAnimeById(id: string): Promise<Anime | null> {
  // First check if id matches our curated fallback
  const localMatch = FALLBACK_ANIME_CATALOG.find(
    (a) => a.id === id || String(a.externalIds?.anilist) === id
  );
  if (localMatch && !isNaN(Number(id)) === false) {
    return localMatch;
  }

  const query = `
    query GetAnimeDetail($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_QUERY_FIELDS}
      }
    }
  `;

  const parsedId = Number(id);
  if (!isNaN(parsedId)) {
    const data = await fetchFromAniList(query, { id: parsedId });
    if (data?.Media) {
      return normalizeAniListMedia(data.Media);
    }
  }

  // Fallback to local
  return localMatch || FALLBACK_ANIME_CATALOG[0] || null;
}
