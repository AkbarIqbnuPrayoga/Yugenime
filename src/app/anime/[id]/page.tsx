'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Bookmark,
  Star,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
  ListVideo,
  Loader2,
  Tv,
} from 'lucide-react';
import { Anime, Episode } from '@/lib/types';
import { isInWatchlist, toggleWatchlist, getWatchHistory } from '@/lib/storage';
import { showToast } from '@/components/common/Toast';
import AnimeCard from '@/components/common/AnimeCard';
import { FALLBACK_ANIME_CATALOG } from '@/lib/metadata/catalog-fallback';
import { truncateTitle } from '@/lib/utils';

export default function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/anime/${id}`);
        const json = await res.json();
        if (json.data) {
          setAnime(json.data);
          setEpisodes(json.data.episodes || []);
        } else {
          // Fallback
          const match = FALLBACK_ANIME_CATALOG.find((a) => a.id === id);
          if (match) {
            setAnime(match);
            setEpisodes(match.episodes || []);
          }
        }
      } catch (err) {
        console.warn('Error fetching anime detail:', err);
        const match = FALLBACK_ANIME_CATALOG.find((a) => a.id === id);
        if (match) {
          setAnime(match);
          setEpisodes(match.episodes || []);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (anime) {
      setBookmarked(isInWatchlist(anime.id));

      const handleUpdate = () => {
        setBookmarked(isInWatchlist(anime.id));
      };

      window.addEventListener('yugen:watchlist-updated', handleUpdate);
      return () => window.removeEventListener('yugen:watchlist-updated', handleUpdate);
    }
  }, [anime]);

  const handleBookmarkToggle = () => {
    if (!anime) return;
    const title = anime.title.romaji || anime.title.english || 'Anime';
    const isNowSaved = toggleWatchlist({
      animeId: anime.id,
      title,
      coverImage: anime.coverImage || '',
      bannerImage: anime.bannerImage,
      genres: anime.genres || [],
      releaseYear: anime.releaseYear,
      format: anime.format,
      status: anime.status,
      addedAt: new Date().toISOString(),
    });

    if (isNowSaved) {
      setBookmarked(true);
      showToast(`"${title}" disimpan ke Watchlist.`, 'success');
    } else {
      setBookmarked(false);
      showToast(`"${title}" dihapus dari Watchlist.`, 'info');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Loader2 size={40} color="#9C7BFF" className="animate-spin" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="container-yugen" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <h2>Anime Tidak Ditemukan</h2>
        <p style={{ color: '#9696B4', marginTop: '8px' }}>
          Dimensi anime yang Anda cari belum terpetakan dalam portal kami.
        </p>
        <Link href="/discover" className="btn-primary" style={{ marginTop: '20px' }}>
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const firstEpisodeId = episodes[0]?.id || `${anime.id}-ep-1`;
  const fullTitle = anime.title.romaji || anime.title.english || 'Anime Title';
  const displayTitle = truncateTitle(fullTitle, 80);
  const history = getWatchHistory();

  // Recommendations: find other anime with overlapping genres
  const similarAnime = FALLBACK_ANIME_CATALOG.filter(
    (a) => a.id !== anime.id && a.genres.some((g) => anime.genres.includes(g))
  ).slice(0, 5);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Backdrop Header Artwork */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '52vh',
          minHeight: '400px',
          maxHeight: '600px',
          overflow: 'hidden',
        }}
      >
        <Image
          src={anime.bannerImage || anime.coverImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600'}
          alt={displayTitle}
          fill
          priority
          unoptimized
          style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(to bottom, rgba(9, 9, 17, 0.4) 0%, rgba(9, 9, 17, 0.8) 70%, #090911 100%),
              linear-gradient(to right, rgba(9, 9, 17, 0.9) 0%, transparent 60%)
            `,
          }}
        />
      </div>

      {/* Main Content Area */}
      <div
        className="container-yugen"
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: '-160px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 300px) 1fr',
            gap: '36px',
            alignItems: 'start',
          }}
          className="anime-detail-grid"
        >
          {/* Left Column: Poster & Quick Action */}
          <div>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1/1.42',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(156, 123, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: '#111126',
              }}
            >
              <Image
                src={anime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600'}
                alt={displayTitle}
                fill
                priority
                unoptimized
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <Link
                href={`/watch/${anime.id}/${firstEpisodeId}`}
                className="btn-primary"
                style={{ width: '100%', padding: '14px 20px', fontSize: '1rem' }}
              >
                <Play size={18} fill="#ffffff" />
                <span>Mulai Menonton</span>
              </Link>

              <button
                onClick={handleBookmarkToggle}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: bookmarked ? 'rgba(156, 123, 255, 0.2)' : undefined,
                  borderColor: bookmarked ? '#9C7BFF' : undefined,
                }}
              >
                <Bookmark size={18} fill={bookmarked ? '#9C7BFF' : 'none'} color={bookmarked ? '#9C7BFF' : '#F6F4FF'} />
                <span>{bookmarked ? 'Tersimpan di Watchlist' : 'Simpan ke Watchlist'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Synopsis */}
          <div>
            {/* Title Block */}
            <h1
              title={fullTitle}
              style={{
                fontSize: 'clamp(1.85rem, 3.8vw, 2.75rem)',
                fontWeight: 800,
                color: '#F6F4FF',
                lineHeight: 1.2,
                marginBottom: '8px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayTitle}
            </h1>

            {anime.title.english && anime.title.english !== anime.title.romaji && (
              <h2
                style={{
                  fontSize: '1.15rem',
                  color: '#D8D9F5',
                  fontWeight: 400,
                  marginBottom: '6px',
                }}
              >
                {anime.title.english}
              </h2>
            )}

            {anime.title.native && (
              <p style={{ fontSize: '0.95rem', color: '#9696B4', marginBottom: '16px' }}>
                {anime.title.native}
              </p>
            )}

            {/* Tags & Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              {anime.averageScore && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(233, 202, 139, 0.15)',
                    border: '1px solid rgba(233, 202, 139, 0.3)',
                    color: '#E9CA8B',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                  }}
                >
                  <Star size={14} fill="#E9CA8B" />
                  <span>{(anime.averageScore / 10).toFixed(1)} / 10</span>
                </div>
              )}

              {anime.format && <span className="badge badge-violet">{anime.format}</span>}
              {anime.releaseYear && <span className="badge badge-cyan">{anime.releaseYear}</span>}
              {anime.season && <span className="badge badge-violet">{anime.season}</span>}
              {anime.status && (
                <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: '#D8D9F5' }}>
                  {anime.status === 'FINISHED' ? 'Tamat' : 'Sedang Rilis'}
                </span>
              )}
            </div>

            {/* Genre Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {anime.genres.map((genre) => (
                <Link
                  key={genre}
                  href={`/genres/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                  style={{
                    background: 'rgba(23, 26, 53, 0.6)',
                    border: '1px solid rgba(156, 123, 255, 0.25)',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    color: '#c7b3ff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {genre}
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '10px', color: '#F6F4FF' }}>
                Sinopsis Cerita
              </h3>
              <p
                style={{
                  fontSize: '0.98rem',
                  lineHeight: 1.7,
                  color: '#D8D9F5',
                  maxWidth: '780px',
                }}
              >
                {anime.synopsis || 'Sinopsis belum tersedia untuk anime ini.'}
              </p>
            </div>

            {/* Studio & Detail Info */}
            <div
              className="glass-panel"
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                maxWidth: '680px',
                marginBottom: '40px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9696B4', textTransform: 'uppercase' }}>Studio</span>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F6F4FF' }}>
                  {anime.studios?.[0] || 'Tidak diketahui'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9696B4', textTransform: 'uppercase' }}>Total Episode</span>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F6F4FF' }}>
                  {anime.episodeCount ? `${anime.episodeCount} Episode` : 'TBA'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9696B4', textTransform: 'uppercase' }}>Durasi Rata-rata</span>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#F6F4FF' }}>
                  {anime.duration ? `${anime.duration} menit / ep` : '24 menit'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Episode Selector Section */}
        <section style={{ marginTop: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ListVideo size={22} color="#9C7BFF" />
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Daftar Episode ({episodes.length})</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {episodes.map((ep) => {
              const progress = history.find((h) => h.episodeId === ep.id);
              const isCompleted = progress?.completed;

              return (
                <Link
                  key={ep.id}
                  href={`/watch/${anime.id}/${ep.id}`}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px',
                    borderRadius: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '84px',
                      height: '56px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                      backgroundColor: '#111126',
                    }}
                  >
                    <Image
                      src={ep.thumbnail || anime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300'}
                      alt={ep.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(9, 9, 17, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Play size={16} fill="#ffffff" color="#ffffff" />
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78BFFF' }}>
                        EP {ep.number}
                      </span>
                      {isCompleted && (
                        <span title="Telah ditonton">
                          <CheckCircle2 size={12} color="#64C99A" />
                        </span>
                      )}
                    </div>
                    <h4
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#F6F4FF',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: '2px',
                      }}
                      title={ep.title}
                    >
                      {ep.title}
                    </h4>
                    {ep.durationSeconds && (
                      <span style={{ fontSize: '0.72rem', color: '#9696B4' }}>
                        {Math.floor(ep.durationSeconds / 60)} min
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Similar Anime Section */}
        {similarAnime.length > 0 && (
          <div style={{ marginTop: '70px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '20px' }}>
              Anime yang Serupa
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '20px',
              }}
            >
              {similarAnime.map((sim) => (
                <AnimeCard key={sim.id} anime={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          :global(.anime-detail-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
