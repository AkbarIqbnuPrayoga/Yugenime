'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Anime } from '@/lib/types';
import AnimeCard from '@/components/common/AnimeCard';
import { GENRE_LIST } from '@/lib/design-tokens';
import { FALLBACK_ANIME_CATALOG } from '@/lib/metadata/catalog-fallback';

export default function GenreDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  const matchedGenre = GENRE_LIST.find(
    (g) => g.id.toLowerCase() === slug.toLowerCase() || g.name.toLowerCase() === slug.toLowerCase()
  );

  const genreName = matchedGenre ? matchedGenre.name : slug.replace(/-/g, ' ');

  useEffect(() => {
    async function fetchGenreAnime() {
      setLoading(true);
      try {
        const res = await fetch(`/api/anime?genre=${encodeURIComponent(genreName)}&limit=24`);
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setAnimeList(json.data);
        } else {
          // Filter fallback catalog
          const local = FALLBACK_ANIME_CATALOG.filter((a) =>
            a.genres.some((g) => g.toLowerCase() === genreName.toLowerCase())
          );
          setAnimeList(local.length > 0 ? local : FALLBACK_ANIME_CATALOG);
        }
      } catch {
        setAnimeList(FALLBACK_ANIME_CATALOG);
      } finally {
        setLoading(false);
      }
    }

    fetchGenreAnime();
  }, [genreName]);

  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh' }}>
      <Link
        href="/genres"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#c7b3ff',
          fontSize: '0.88rem',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Semua Genre</span>
      </Link>

      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color={matchedGenre?.color || '#9C7BFF'} />
          <span className="badge badge-violet" style={{ textTransform: 'capitalize' }}>
            GENRE • {genreName}
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, textTransform: 'capitalize' }}>
          Dunia Anime {genreName}
        </h1>
        <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
          Jelajahi petualangan terbaik dalam kategori {genreName}.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={36} color="#9C7BFF" className="animate-spin" />
        </div>
      ) : animeList.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(23, 26, 53, 0.4)',
            borderRadius: '20px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <p style={{ color: '#F6F4FF', fontSize: '1.1rem', fontWeight: 600 }}>
            Belum ada anime untuk genre ini.
          </p>
          <Link href="/discover" className="btn-primary" style={{ marginTop: '16px' }}>
            Jelajahi Seluruh Katalog
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: '22px',
            marginBottom: '60px',
          }}
        >
          {animeList.map((anime, idx) => (
            <AnimeCard key={anime.id} anime={anime} priority={idx < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
