'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { Anime } from '@/lib/types';
import AnimeCard from '@/components/common/AnimeCard';
import { GENRE_LIST } from '@/lib/design-tokens';
import { FALLBACK_ANIME_CATALOG } from '@/lib/metadata/catalog-fallback';

export default function DiscoverPage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchCatalog = useCallback(async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedYear) params.append('year', selectedYear);
      if (selectedSeason) params.append('season', selectedSeason);
      if (selectedFormat) params.append('format', selectedFormat);
      params.append('page', String(currentPage));
      params.append('limit', '12');

      const res = await fetch(`/api/anime?${params.toString()}`);
      const json = await res.json();

      if (json.data) {
        if (resetPage) {
          setAnimeList(json.data);
          setPage(1);
        } else {
          setAnimeList((prev) => (currentPage === 1 ? json.data : [...prev, ...json.data]));
        }
        setTotalCount(json.meta?.total || json.data.length);
        setHasMore(Boolean(json.meta?.hasMore));
      } else {
        setAnimeList(FALLBACK_ANIME_CATALOG);
        setTotalCount(FALLBACK_ANIME_CATALOG.length);
      }
    } catch (err) {
      console.warn('Error fetching catalog:', err);
      setAnimeList(FALLBACK_ANIME_CATALOG);
      setTotalCount(FALLBACK_ANIME_CATALOG.length);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedFormat, selectedGenre, selectedSeason, selectedYear]);

  // Initial load and filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre, selectedYear, selectedSeason, selectedFormat]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedSeason('');
    setSelectedFormat('');
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={16} color="#9C7BFF" />
          <span className="badge badge-violet">KATALOG ALAM SEMESTA</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
          Eksplorasi Dunia Anime
        </h1>
        <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
          Jelajahi ribuan judul anime berdasarkan genre, tahun rilis, dan format cerita.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '20px',
          borderRadius: '18px',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Search Input Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '10px 16px',
          }}
        >
          <Search size={18} color="#9C7BFF" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul Romaji, Inggris, atau sinopsis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#F6F4FF',
              fontSize: '0.95rem',
              outline: 'none',
              width: '100%',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        {/* Filter Selectors Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Genre Dropdown */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            style={{
              background: 'rgba(17, 17, 38, 0.8)',
              color: '#F6F4FF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
            aria-label="Pilih Genre"
          >
            <option value="">Semua Genre</option>
            {GENRE_LIST.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              background: 'rgba(17, 17, 38, 0.8)',
              color: '#F6F4FF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
            aria-label="Pilih Tahun"
          >
            <option value="">Semua Tahun</option>
            {[2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Season Dropdown */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            style={{
              background: 'rgba(17, 17, 38, 0.8)',
              color: '#F6F4FF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
            aria-label="Pilih Musim"
          >
            <option value="">Semua Musim</option>
            <option value="WINTER">Winter</option>
            <option value="SPRING">Spring</option>
            <option value="SUMMER">Summer</option>
            <option value="FALL">Fall</option>
          </select>

          {/* Format Dropdown */}
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            style={{
              background: 'rgba(17, 17, 38, 0.8)',
              color: '#F6F4FF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
            aria-label="Pilih Format"
          >
            <option value="">Semua Format</option>
            <option value="TV">TV Series</option>
            <option value="MOVIE">Movie</option>
            <option value="OVA">OVA</option>
            <option value="ONA">ONA</option>
          </select>

          {/* Reset Filters */}
          {(searchQuery || selectedGenre || selectedYear || selectedSeason || selectedFormat) && (
            <button
              onClick={handleResetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'rgba(241, 125, 145, 0.15)',
                border: '1px solid rgba(241, 125, 145, 0.3)',
                color: '#F17D91',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              <span>Reset Filter</span>
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#9696B4' }}>
            Ditemukan {totalCount} anime
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading && animeList.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={36} color="#9C7BFF" className="animate-spin" />
        </div>
      ) : animeList.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(23, 26, 53, 0.3)',
            borderRadius: '20px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <Sparkles size={40} color="#9C7BFF" style={{ margin: '0 auto 16px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Tidak Ada Dunia Ditemukan</h3>
          <p style={{ color: '#9696B4', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Coba gunakan kata kunci pencarian yang berbeda atau reset filter untuk menjelajahi seluruh katalog.
          </p>
          <button onClick={handleResetFilters} className="btn-secondary">
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: '22px',
              marginBottom: '40px',
            }}
          >
            {animeList.map((anime, idx) => (
              <AnimeCard key={anime.id} anime={anime} priority={idx < 6} />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="btn-primary"
                style={{ minWidth: '180px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memuat...</span>
                  </>
                ) : (
                  <span>Muat Lebih Banyak Dunia</span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
