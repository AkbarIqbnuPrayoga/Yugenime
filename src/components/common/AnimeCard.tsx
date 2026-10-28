'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Star, Play } from 'lucide-react';
import { Anime } from '@/lib/types';
import { isInWatchlist, toggleWatchlist } from '@/lib/storage';
import { showToast } from './Toast';
import { truncateTitle } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
}

export default function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isInWatchlist(anime.id));

    const handleUpdate = () => {
      setBookmarked(isInWatchlist(anime.id));
    };

    window.addEventListener('yugen:watchlist-updated', handleUpdate);
    return () => window.removeEventListener('yugen:watchlist-updated', handleUpdate);
  }, [anime.id]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const fullTitle = anime.title.romaji || anime.title.english || 'Anime Title';
  const displayTitle = truncateTitle(fullTitle, 60);
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;

  return (
    <div
      className="glass-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(23, 26, 53, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        height: '100%',
      }}
    >
      <Link
        href={`/anime/${anime.id}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          color: 'inherit',
        }}
      >
        {/* Poster Wrapper */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '142%', // Aspect ratio ~ 1:1.42
            overflow: 'hidden',
            backgroundColor: '#111126',
          }}
        >
          <Image
            src={anime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500'}
            alt={displayTitle}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            priority={priority}
            unoptimized
            style={{
              objectFit: 'cover',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="anime-card-img"
          />

          {/* Vignette Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: 'linear-gradient(to top, rgba(9, 9, 17, 0.95) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Badges */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              gap: '6px',
              zIndex: 2,
            }}
          >
            {anime.format && (
              <span className="badge badge-violet" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                {anime.format}
              </span>
            )}
          </div>

          {/* Rating */}
          {score && (
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(9, 9, 17, 0.75)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#E9CA8B',
                border: '1px solid rgba(233, 202, 139, 0.3)',
                zIndex: 2,
              }}
            >
              <Star size={11} fill="#E9CA8B" color="#E9CA8B" />
              <span>{score}</span>
            </div>
          )}

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: bookmarked ? '#9C7BFF' : 'rgba(9, 9, 17, 0.8)',
              backdropFilter: 'blur(8px)',
              border: bookmarked ? '1px solid #c7b3ff' : '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: bookmarked ? '#ffffff' : '#D8D9F5',
              zIndex: 3,
              transition: 'all 0.2s ease',
            }}
            aria-label={bookmarked ? 'Hapus dari Watchlist' : 'Simpan ke Watchlist'}
          >
            <Bookmark size={16} fill={bookmarked ? '#ffffff' : 'none'} />
          </button>
        </div>

        {/* Content Section */}
        <div
          style={{
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#F6F4FF',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={fullTitle}
            >
              {displayTitle}
            </h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '6px',
                fontSize: '0.78rem',
                color: '#9696B4',
              }}
            >
              {anime.releaseYear && <span>{anime.releaseYear}</span>}
              {anime.releaseYear && anime.genres?.length > 0 && <span>•</span>}
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: '#78BFFF',
                }}
              >
                {anime.genres?.[0] || 'Anime'}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#D8D9F5',
            }}
          >
            <span>{anime.episodeCount ? `${anime.episodeCount} Ep` : 'Ongoing'}</span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: '#9C7BFF',
                fontWeight: 600,
              }}
            >
              <Play size={10} fill="#9C7BFF" /> Tonton
            </span>
          </div>
        </div>
      </Link>

      <style jsx>{`
        :global(.anime-card-img:hover) {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
