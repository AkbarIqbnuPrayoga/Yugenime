'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Anime, Episode, PlaybackSource } from '@/lib/types';
import VideoPlayer from '@/components/player/VideoPlayer';
import SourceSelector from '@/components/player/SourceSelector';
import EpisodeSidebar from '@/components/player/EpisodeSidebar';
import { FALLBACK_ANIME_CATALOG } from '@/lib/metadata/catalog-fallback';
import { showToast } from '@/components/common/Toast';
import { truncateTitle } from '@/lib/utils';

export default function WatchPage({
  params,
}: {
  params: Promise<{ animeId: string; episodeId: string }>;
}) {
  const { animeId, episodeId } = use(params);

  const [anime, setAnime] = useState<Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [sources, setSources] = useState<PlaybackSource[]>([]);
  const [activeSource, setActiveSource] = useState<PlaybackSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load Anime & Episode
  useEffect(() => {
    async function loadWatchData() {
      setLoading(true);
      try {
        // 1. Fetch Anime detail
        const animeRes = await fetch(`/api/anime/${animeId}`);
        const animeJson = await animeRes.json();
        let loadedAnime: Anime | null = animeJson.data;

        if (!loadedAnime) {
          loadedAnime = FALLBACK_ANIME_CATALOG.find((a) => a.id === animeId) || null;
        }

        setAnime(loadedAnime);

        if (loadedAnime) {
          // 2. Identify active episode
          const eps = loadedAnime.episodes || [];
          const foundEp = eps.find((e) => e.id === episodeId) || eps[0] || null;
          setCurrentEpisode(foundEp);

          // 3. Fetch sources for this episode
          if (foundEp) {
            const titleParam = encodeURIComponent(loadedAnime.title.english || loadedAnime.title.romaji || '');
            const romajiParam = encodeURIComponent(loadedAnime.title.romaji || '');
            const trailerParam = encodeURIComponent(loadedAnime.trailer?.id || '');
            const epNum = foundEp.number || 1;

            const srcRes = await fetch(
              `/api/episodes/${foundEp.id}/sources?title=${titleParam}&romaji=${romajiParam}&ep=${epNum}&trailer=${trailerParam}`
            );
            const srcJson = await srcRes.json();
            if (srcJson.data && srcJson.data.length > 0) {
              setSources(srcJson.data);
              setActiveSource(srcJson.data[0]);
            } else if (foundEp.sources && foundEp.sources.length > 0) {
              setSources(foundEp.sources);
              setActiveSource(foundEp.sources[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch watch data:', err);
        const match = FALLBACK_ANIME_CATALOG.find((a) => a.id === animeId);
        if (match) {
          setAnime(match);
          const ep = match.episodes?.find((e) => e.id === episodeId) || match.episodes?.[0] || null;
          setCurrentEpisode(ep);
          if (ep?.sources) {
            setSources(ep.sources);
            setActiveSource(ep.sources[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    loadWatchData();
  }, [animeId, episodeId]);

  const handleManualRefresh = async () => {
    if (!currentEpisode) return;
    setIsRefreshing(true);
    try {
      const titleParam = encodeURIComponent(anime?.title.english || anime?.title.romaji || '');
      const romajiParam = encodeURIComponent(anime?.title.romaji || '');
      const trailerParam = encodeURIComponent(anime?.trailer?.id || '');
      const epNum = currentEpisode.number || 1;

      const res = await fetch(
        `/api/episodes/${currentEpisode.id}/sources?title=${titleParam}&romaji=${romajiParam}&ep=${epNum}&trailer=${trailerParam}`
      );
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setSources(json.data);
        setActiveSource(json.data[0]);
        showToast('Daftar sumber pemutaran diperbarui.', 'success');
      }
    } catch {
      showToast('Gagal memperbarui sumber pemutaran.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Loader2 size={40} color="#9C7BFF" className="animate-spin" />
      </div>
    );
  }

  if (!anime || !currentEpisode) {
    return (
      <div className="container-yugen" style={{ paddingTop: '140px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#F17D91" style={{ margin: '0 auto 16px' }} />
        <h2>Episode Tidak Ditemukan</h2>
        <p style={{ color: '#9696B4', marginTop: '8px' }}>
          Episode atau anime yang Anda cari tidak tersedia dalam server.
        </p>
        <Link href="/discover" className="btn-primary" style={{ marginTop: '20px' }}>
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const episodes = anime.episodes || [];
  const currentIndex = episodes.findIndex((e) => e.id === currentEpisode.id);
  const prevEp = currentIndex > 0 ? episodes[currentIndex - 1] : undefined;
  const nextEp = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : undefined;

  return (
    <div className="container-yugen" style={{ paddingTop: '95px', minHeight: '90vh', paddingBottom: '60px' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          href={`/anime/${anime.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#c7b3ff',
            fontSize: '0.88rem',
            transition: 'color 0.2s ease',
            maxWidth: '100%',
          }}
          title={`Kembali ke Detail ${anime.title.romaji || anime.title.english}`}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F6F4FF')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#c7b3ff')}
        >
          <ArrowLeft size={16} style={{ flexShrink: 0 }} />
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Kembali ke Detail {truncateTitle(anime.title.romaji || anime.title.english, 45)}
          </span>
        </Link>
      </div>

      {/* Main Watch Layout Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '24px',
          alignItems: 'start',
        }}
        className="watch-page-grid"
      >
        {/* Left Column: Video Player & Source Selector & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Custom Video Player */}
          <VideoPlayer
            anime={anime}
            episode={currentEpisode}
            sources={sources}
            activeSource={activeSource}
            onSelectSource={(src) => setActiveSource(src)}
            nextEpisode={nextEp}
            prevEpisode={prevEp}
          />

          {/* Source Selector Bar */}
          <SourceSelector
            sources={sources}
            activeSourceId={activeSource?.id || ''}
            onSelectSource={(src) => {
              setActiveSource(src);
              showToast(`Beralih ke ${src.providerName}`, 'info');
            }}
            onManualRetry={handleManualRefresh}
            isRetrying={isRefreshing}
          />

          {/* Episode Info Block */}
          <div
            className="glass-panel"
            style={{
              padding: '22px 26px',
              borderRadius: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-cyan">Episode {currentEpisode.number}</span>
              {currentEpisode.durationSeconds && (
                <span style={{ fontSize: '0.8rem', color: '#9696B4' }}>
                  {Math.floor(currentEpisode.durationSeconds / 60)} menit
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.6rem)', fontWeight: 700, color: '#F6F4FF', marginBottom: '8px' }}>
              {currentEpisode.title}
            </h1>

            <h2 style={{ fontSize: '0.92rem', color: '#78BFFF', fontWeight: 500, marginBottom: '14px' }}>
              {anime.title.romaji || anime.title.english}
            </h2>

            <p style={{ color: '#D8D9F5', fontSize: '0.92rem', lineHeight: 1.65 }}>
              {currentEpisode.synopsis || anime.synopsis}
            </p>
          </div>
        </div>

        {/* Right Column: Episode List Sidebar */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <EpisodeSidebar
            anime={anime}
            episodes={episodes}
            activeEpisodeId={currentEpisode.id}
          />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          :global(.watch-page-grid) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
