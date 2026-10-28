'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CinematicIntro from '@/components/common/CinematicIntro';
import HeroCarousel from '@/components/home/HeroCarousel';
import ContinueWatchingRow from '@/components/home/ContinueWatchingRow';
import AnimeGridSection from '@/components/home/AnimeGridSection';
import GenreGrid from '@/components/home/GenreGrid';
import { Anime } from '@/lib/types';
import { FALLBACK_ANIME_CATALOG } from '@/lib/metadata/catalog-fallback';

export default function HomePage() {
  const [introCompleted, setIntroCompleted] = useState(false);
  const [trending, setTrending] = useState<Anime[]>([]);
  const [seasonal, setSeasonal] = useState<Anime[]>([]);
  const [hiddenGems, setHiddenGems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trendRes, seasonRes] = await Promise.all([
          fetch('/api/anime/trending?limit=10').then((r) => r.json()),
          fetch('/api/anime/seasonal?limit=8').then((r) => r.json()),
        ]);

        if (trendRes.data && trendRes.data.length > 0) {
          setTrending(trendRes.data);
        } else {
          setTrending(FALLBACK_ANIME_CATALOG);
        }

        if (seasonRes.data && seasonRes.data.length > 0) {
          setSeasonal(seasonRes.data);
        } else {
          setSeasonal(FALLBACK_ANIME_CATALOG.slice(2, 8));
        }

        // Hidden gems: curated anime with high scores
        setHiddenGems(FALLBACK_ANIME_CATALOG.slice(4, 9));
      } catch (err) {
        console.warn('Failed to load dynamic anime, using curated catalog:', err);
        setTrending(FALLBACK_ANIME_CATALOG);
        setSeasonal(FALLBACK_ANIME_CATALOG.slice(1, 6));
        setHiddenGems(FALLBACK_ANIME_CATALOG.slice(5, 9));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      {/* 1. Cinematic Intro Sequence */}
      <CinematicIntro onComplete={() => setIntroCompleted(true)} />

      {/* 2. Homepage Content with Left-to-Right Horizontal Reveal */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ minHeight: '100vh' }}
      >
        {/* Hero Spotlight Carousel */}
        <HeroCarousel featuredAnime={trending.slice(0, 5)} />

        <div className="container-yugen" style={{ marginTop: '40px' }}>
          {/* Continue Watching (Only shown if progress exists) */}
          <ContinueWatchingRow />

          {/* Trending Anime Section */}
          <AnimeGridSection
            title="Dunia yang Sedang Tren"
            subtitle="Kisah paling banyak dijelajahi oleh para pengelana anime saat ini."
            badgeText="TRENDING NOW"
            viewAllHref="/trending"
            items={trending.slice(0, 6)}
          />

          {/* Seasonal Anime Section */}
          <AnimeGridSection
            title="Anime Musim Ini"
            subtitle="Rilisan terbaru dari musim anime yang sedang berlangsung."
            badgeText="SEASONAL REALM"
            viewAllHref="/seasonal"
            items={seasonal}
          />

          {/* Browse by Genre */}
          <GenreGrid />

          {/* Hidden Gems: "Beyond the Popular Realms" */}
          <AnimeGridSection
            title="Beyond the Popular Realms"
            subtitle="Permata tersembunyi dengan kedalaman cerita dan estetika yang memikat."
            badgeText="HIDDEN GEMS"
            viewAllHref="/discover?sort=score"
            items={hiddenGems}
          />
        </div>
      </motion.div>
    </>
  );
}
