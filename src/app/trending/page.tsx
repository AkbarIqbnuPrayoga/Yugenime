'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { Anime } from '@/lib/types';
import AnimeCard from '@/components/common/AnimeCard';
import { FALLBACK_ANIME_CATALOG } from '@/lib/metadata/catalog-fallback';

export default function TrendingPage() {
  const [trending, setTrending] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/anime/trending?limit=24');
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setTrending(json.data);
        } else {
          setTrending(FALLBACK_ANIME_CATALOG);
        }
      } catch {
        setTrending(FALLBACK_ANIME_CATALOG);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Flame size={18} color="#FF7B9C" />
          <span className="badge badge-violet">EKSPLORASI TERTINGGI</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
          Trending Anime Dunia
        </h1>
        <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
          Peringkat anime terpopuler berdasarkan data aktual penonton komunitas anime global.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={36} color="#9C7BFF" className="animate-spin" />
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
          {trending.map((anime, idx) => (
            <div key={anime.id} style={{ position: 'relative' }}>
              {/* Ranking Badge #1, #2, etc. */}
              <div
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background:
                    idx === 0
                      ? 'linear-gradient(135deg, #E9CA8B, #d4af37)'
                      : idx === 1
                      ? 'linear-gradient(135deg, #D8D9F5, #a4a5c4)'
                      : idx === 2
                      ? 'linear-gradient(135deg, #cd7f32, #a05a2c)'
                      : 'rgba(23, 26, 53, 0.9)',
                  color: idx < 3 ? '#090911' : '#F6F4FF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                #{idx + 1}
              </div>
              <AnimeCard anime={anime} priority={idx < 4} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
