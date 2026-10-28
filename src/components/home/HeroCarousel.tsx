'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Sparkles, Star } from 'lucide-react';
import { Anime } from '@/lib/types';
import { truncateTitle } from '@/lib/utils';

interface HeroCarouselProps {
  featuredAnime: Anime[];
}

export default function HeroCarousel({ featuredAnime }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (featuredAnime.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAnime.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [featuredAnime.length, isPaused]);

  if (!featuredAnime || featuredAnime.length === 0) return null;

  const current = featuredAnime[currentIndex];
  const firstEpisodeId = current.episodes?.[0]?.id || `${current.id}-ep-1`;
  const fullTitle = current.title.romaji || current.title.english || 'Featured Anime';
  const displayTitle = truncateTitle(fullTitle, 75);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '82vh',
        maxHeight: '900px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        paddingTop: '80px',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Backdrops with Fade Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        >
          <Image
            src={current.bannerImage || current.coverImage || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600'}
            alt={displayTitle}
            fill
            priority
            unoptimized
            style={{
              objectFit: 'cover',
              objectPosition: 'center 25%',
            }}
          />

          {/* Cinematic Vignette Gradients */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(to right, rgba(9, 9, 17, 0.98) 0%, rgba(9, 9, 17, 0.82) 40%, rgba(9, 9, 17, 0.35) 75%, rgba(9, 9, 17, 0.9) 100%),
                linear-gradient(to top, rgba(9, 9, 17, 1) 0%, rgba(9, 9, 17, 0.5) 30%, transparent 60%)
              `,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Hero Foreground Content */}
      <div className="container-yugen" style={{ position: 'relative', zIndex: 2, padding: '40px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`hero-info-${current.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ maxWidth: '680px' }}
          >
            {/* Label */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(156, 123, 255, 0.18)',
                border: '1px solid rgba(156, 123, 255, 0.4)',
                color: '#c7b3ff',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                marginBottom: '16px',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={14} color="#9C7BFF" />
              <span>FEATURED WORLD</span>
            </div>

            {/* Title */}
            <h1
              title={fullTitle}
              style={{
                fontSize: 'clamp(1.85rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                lineHeight: 1.18,
                color: '#F6F4FF',
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.8)',
                marginBottom: '14px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayTitle}
            </h1>

            {/* Metadata Tags */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '18px',
                fontSize: '0.9rem',
              }}
            >
              {current.averageScore && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#E9CA8B',
                    fontWeight: 700,
                  }}
                >
                  <Star size={16} fill="#E9CA8B" color="#E9CA8B" />
                  <span>{(current.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              {current.releaseYear && <span style={{ color: '#D8D9F5' }}>{current.releaseYear}</span>}
              {current.format && (
                <span className="badge badge-cyan">{current.format}</span>
              )}
              {current.status && (
                <span style={{ color: '#9696B4' }}>
                  {current.status === 'FINISHED' ? 'Tamat' : 'Sedang Tayang'}
                </span>
              )}
              <div style={{ display: 'flex', gap: '6px' }}>
                {current.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: '#c7b3ff',
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
                color: '#D8D9F5',
                lineHeight: 1.65,
                marginBottom: '28px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '620px',
              }}
            >
              {current.synopsis || 'Dunia anime misterius menanti untuk dijelajahi. Saksikan kisah epik dan visual spektakuler melalui portal YŪGENIME.'}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link
                href={`/watch/${current.id}/${firstEpisodeId}`}
                className="btn-primary"
                style={{ padding: '14px 28px', fontSize: '1.02rem' }}
              >
                <Play size={18} fill="#ffffff" />
                <span>Watch Now</span>
              </Link>

              <Link
                href={`/anime/${current.id}`}
                className="btn-secondary"
                style={{ padding: '14px 24px', fontSize: '1.02rem' }}
              >
                <Info size={18} />
                <span>Explore Details</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Slide Indicators & Arrows */}
        {featuredAnime.length > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '40px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {featuredAnime.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    width: idx === currentIndex ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: idx === currentIndex ? '#9C7BFF' : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: idx === currentIndex ? '0 0 10px #9C7BFF' : 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  aria-label={`Pindah ke slide ${idx + 1}`}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + featuredAnime.length) % featuredAnime.length)
                }
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F6F4FF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                aria-label="Anime sebelumnya"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredAnime.length)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F6F4FF',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                aria-label="Anime berikutnya"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
