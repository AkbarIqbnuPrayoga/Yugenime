'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Anime } from '@/lib/types';
import AnimeCard from '@/components/common/AnimeCard';
import { FALLBACK_ANIME_CATALOG } from '@/lib/metadata/catalog-fallback';

const SEASONS = [
  { id: 'WINTER', name: 'Winter (Musim Dingin)' },
  { id: 'SPRING', name: 'Spring (Musim Semi)' },
  { id: 'SUMMER', name: 'Summer (Musim Panas)' },
  { id: 'FALL', name: 'Fall (Musim Gugur)' },
];

export default function SeasonalPage() {
  const [selectedSeason, setSelectedSeason] = useState('FALL');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeasonal() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/anime/seasonal?season=${selectedSeason}&year=${selectedYear}&limit=18`
        );
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setAnimeList(json.data);
        } else {
          setAnimeList(FALLBACK_ANIME_CATALOG);
        }
      } catch {
        setAnimeList(FALLBACK_ANIME_CATALOG);
      } finally {
        setLoading(false);
      }
    }

    fetchSeasonal();
  }, [selectedSeason, selectedYear]);

  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Calendar size={18} color="#78BFFF" />
          <span className="badge badge-cyan">JADWAL MUSIM</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
          Anime Musiman
        </h1>
        <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
          Telusuri anime yang sedang mengudara pada tiap musim penayangan di Jepang.
        </p>
      </div>

      {/* Season and Year Selector */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '36px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {SEASONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeason(s.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: selectedSeason === s.id ? 600 : 400,
                background:
                  selectedSeason === s.id
                    ? 'linear-gradient(135deg, #78BFFF, #9C7BFF)'
                    : 'rgba(255, 255, 255, 0.05)',
                color: selectedSeason === s.id ? '#ffffff' : '#D8D9F5',
                border:
                  selectedSeason === s.id
                    ? '1px solid rgba(255, 255, 255, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#9696B4' }}>Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              background: 'rgba(17, 17, 38, 0.9)',
              color: '#F6F4FF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '6px 14px',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
            }}
            aria-label="Pilih Tahun Musim"
          >
            {[2025, 2024, 2023, 2022, 2021].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Seasonal Anime */}
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
          {animeList.map((anime, idx) => (
            <AnimeCard key={anime.id} anime={anime} priority={idx < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
