'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  SkipForward,
  SkipBack,
  Settings,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { PlaybackSource, PlayerState, ErrorCategory, Anime, Episode } from '@/lib/types';
import { getEpisodeProgress, saveWatchProgress, getPreferences } from '@/lib/storage';
import { getFriendlyErrorMessage } from '@/lib/providers/fallback-resolver';
import { showToast } from '../common/Toast';

interface VideoPlayerProps {
  anime: Anime;
  episode: Episode;
  sources: PlaybackSource[];
  activeSource: PlaybackSource | null;
  onSelectSource: (source: PlaybackSource) => void;
  nextEpisode?: Episode;
  prevEpisode?: Episode;
}

export default function VideoPlayer({
  anime,
  episode,
  sources,
  activeSource,
  onSelectSource,
  nextEpisode,
  prevEpisode,
}: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Player state machine
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Playback metrics
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [hasResumed, setHasResumed] = useState(false);

  // Initialize preferences
  useEffect(() => {
    const prefs = getPreferences();
    setVolume(prefs.volume);
    setIsMuted(prefs.muted);
  }, []);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Switch to next source in fallback chain
  const triggerFallback = useCallback(
    async (reasonCode: ErrorCategory = 'PROVIDER_UNAVAILABLE') => {
      setPlayerState('retrying');

      // Report failure
      if (activeSource) {
        try {
          await fetch('/api/playback/report-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              episodeId: episode.id,
              providerId: activeSource.providerId,
              errorCode: reasonCode,
            }),
          });
        } catch {
          // ignore report error
        }
      }

      // Find next candidate source
      const currentIndex = sources.findIndex((s) => s.id === activeSource?.id);
      const nextSource = sources[currentIndex + 1];

      if (nextSource) {
        showToast(
          `Sumber "${activeSource?.providerName || 'saat ini'}" dialihkan. Mencoba ${nextSource.providerName}...`,
          'info'
        );
        onSelectSource(nextSource);
      } else {
        setPlayerState('error');
        setErrorMessage(getFriendlyErrorMessage(reasonCode));
      }
    },
    [activeSource, episode.id, onSelectSource, sources]
  );

  // Initialize playback stream or embed
  useEffect(() => {
    if (!activeSource) {
      setPlayerState('error');
      setErrorMessage('Tidak ada sumber pemutaran yang tersedia.');
      return;
    }

    setPlayerState('loading');
    setErrorMessage(null);

    // If source is embed or external
    if (activeSource.method === 'official-embed' || activeSource.format === 'embed') {
      setPlayerState('ready');
      return;
    }

    if (activeSource.method === 'external-link') {
      setPlayerState('ready');
      return;
    }

    // Direct Video / HLS Setup
    const video = videoRef.current;
    if (!video) return;

    // Reset video
    video.pause();
    video.removeAttribute('src');
    video.load();

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls =
      activeSource.url.includes('.m3u8') ||
      activeSource.format === 'hls' ||
      activeSource.method === 'authorized-hls';

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(activeSource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlayerState('ready');
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.warn('[HLS Error] Fatal stream error:', data);
          triggerFallback('UNSUPPORTED_FORMAT');
        }
      });
    } else {
      // HTML5 Video direct
      video.src = activeSource.url;
      video.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeSource, triggerFallback]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setPlayerState('ready');

      // Restore watch progress
      if (!hasResumed) {
        const saved = getEpisodeProgress(episode.id);
        if (saved && saved.positionSeconds > 10 && saved.positionSeconds < video.duration - 20) {
          video.currentTime = saved.positionSeconds;
          showToast(`Melanjutkan dari menit ${Math.floor(saved.positionSeconds / 60)}:00`, 'info');
        }
        setHasResumed(true);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }

      // Periodically persist progress (every 5 seconds)
      if (Math.floor(video.currentTime) % 5 === 0 && video.duration > 0) {
        saveWatchProgress({
          animeId: anime.id,
          episodeId: episode.id,
          episodeNumber: episode.number,
          episodeTitle: episode.title,
          animeTitle: anime.title.romaji || anime.title.english || 'Anime',
          animeCover: anime.coverImage || '',
          positionSeconds: Math.floor(video.currentTime),
          durationSeconds: Math.floor(video.duration),
          completed: video.currentTime / video.duration >= 0.9,
          lastWatchedAt: new Date().toISOString(),
        });
      }
    };

    const handlePlay = () => setPlayerState('playing');
    const handlePause = () => setPlayerState('paused');
    const handleEnded = () => {
      setPlayerState('completed');
      saveWatchProgress({
        animeId: anime.id,
        episodeId: episode.id,
        episodeNumber: episode.number,
        episodeTitle: episode.title,
        animeTitle: anime.title.romaji || anime.title.english || 'Anime',
        animeCover: anime.coverImage || '',
        positionSeconds: Math.floor(video.duration),
        durationSeconds: Math.floor(video.duration),
        completed: true,
        lastWatchedAt: new Date().toISOString(),
      });

      // Autoplay next if available
      const prefs = getPreferences();
      if (prefs.autoplayNext && nextEpisode) {
        showToast(`Memutar Episode ${nextEpisode.number}...`, 'info');
        router.push(`/watch/${anime.id}/${nextEpisode.id}`);
      }
    };

    const handleError = () => {
      console.warn('[HTML5 Video] Playback error on source');
      triggerFallback('NETWORK_TIMEOUT');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [anime, episode, hasResumed, nextEpisode, router, triggerFallback]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case 'arrowup':
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          setIsMuted(false);
          break;
        case 'arrowdown':
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      video.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    const video = videoRef.current;
    if (video) {
      video.currentTime = val;
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
    setShowSpeedMenu(false);
  };

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState === 'playing') {
        setShowControls(false);
      }
    }, 3000);
  };

  const isEmbed =
    activeSource?.method === 'official-embed' ||
    activeSource?.format === 'embed' ||
    Boolean(activeSource?.embedUrl);

  const isExternal = activeSource?.method === 'external-link';

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        backgroundColor: '#090911',
        borderRadius: isFullscreen ? '0' : '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(156, 123, 255, 0.1)',
        border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* 1. Official Embed Mode (YouTube / Bilibili) */}
      {isEmbed && activeSource && (
        <iframe
          src={activeSource.embedUrl || activeSource.url}
          title={`${anime.title.romaji} - Episode ${episode.number}`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      {/* 2. External Destination Mode */}
      {isExternal && activeSource && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'radial-gradient(circle, rgba(23, 26, 53, 0.8) 0%, rgba(9, 9, 17, 0.98) 100%)',
          }}
        >
          <ExternalLink size={44} color="#9C7BFF" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>
            Pemutaran Eksternal Resmi
          </h3>
          <p style={{ maxWidth: '480px', color: '#D8D9F5', fontSize: '0.9rem', marginBottom: '20px' }}>
            Konten ini dilindungi dan diakses secara resmi melalui mitra platform {activeSource.providerName}.
          </p>
          <a
            href={activeSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Buka di {activeSource.providerName} <ExternalLink size={16} />
          </a>
        </div>
      )}

      {/* 3. HTML5 / HLS Video Element */}
      {!isEmbed && !isExternal && (
        <>
          <video
            ref={videoRef}
            onClick={togglePlay}
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: 'pointer',
            }}
          />

          {/* Loading Indicator */}
          {playerState === 'loading' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(9, 9, 17, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                zIndex: 4,
              }}
            >
              <Loader2 size={36} color="#9C7BFF" className="animate-spin" />
              <span style={{ fontSize: '0.9rem', color: '#D8D9F5' }}>
                Menghubungkan gerbang aliran ({activeSource?.providerName})...
              </span>
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(9, 9, 17, 0.95) 0%, rgba(9, 9, 17, 0.5) 70%, transparent 100%)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'opacity 0.3s ease',
              opacity: showControls || playerState !== 'playing' ? 1 : 0,
              pointerEvents: showControls || playerState !== 'playing' ? 'auto' : 'none',
              zIndex: 5,
            }}
          >
            {/* Scrubber / Progress Bar */}
            <div style={{ position: 'relative', width: '100%', height: '6px', cursor: 'pointer' }}>
              {/* Buffer Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${duration ? (buffered / duration) * 100 : 0}%`,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '3px',
                }}
              />
              {/* Played Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  background: 'linear-gradient(90deg, #9C7BFF, #77E6E0)',
                  borderRadius: '3px',
                }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: 0,
                  width: '100%',
                  height: '14px',
                  opacity: 0,
                  cursor: 'pointer',
                }}
                aria-label="Seek video position"
              />
            </div>

            {/* Controls Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#F6F4FF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Play / Pause */}
                <button onClick={togglePlay} aria-label={playerState === 'playing' ? 'Jeda' : 'Putar'}>
                  {playerState === 'playing' ? <Pause size={20} /> : <Play size={20} fill="#F6F4FF" />}
                </button>

                {/* Prev Episode */}
                {prevEpisode && (
                  <button
                    onClick={() => router.push(`/watch/${anime.id}/${prevEpisode.id}`)}
                    title={`Episode Sebelumnya (${prevEpisode.number})`}
                    aria-label="Episode Sebelumnya"
                  >
                    <SkipBack size={18} />
                  </button>
                )}

                {/* Next Episode */}
                {nextEpisode && (
                  <button
                    onClick={() => router.push(`/watch/${anime.id}/${nextEpisode.id}`)}
                    title={`Episode Berikutnya (${nextEpisode.number})`}
                    aria-label="Episode Berikutnya"
                  >
                    <SkipForward size={18} />
                  </button>
                )}

                {/* Volume & Mute */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={toggleMute} aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan'}>
                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    style={{ width: '60px', accentColor: '#9C7BFF', cursor: 'pointer' }}
                    aria-label="Volume audio"
                  />
                </div>

                {/* Time Display */}
                <span style={{ fontSize: '0.8rem', color: '#D8D9F5' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Player Options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Playback Speed */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    style={{ fontSize: '0.82rem', color: '#c7b3ff', fontWeight: 600 }}
                  >
                    {playbackSpeed}x
                  </button>
                  {showSpeedMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '30px',
                        right: 0,
                        background: 'rgba(17, 17, 38, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        zIndex: 10,
                      }}
                    >
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.78rem',
                            color: s === playbackSpeed ? '#9C7BFF' : '#D8D9F5',
                            textAlign: 'left',
                          }}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} aria-label="Layar Penuh">
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Error / Fallback State Modal */}
      {playerState === 'error' && errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(9, 9, 17, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <AlertCircle size={40} color="#F17D91" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#F6F4FF', marginBottom: '8px' }}>
            Gangguan Pemutaran
          </h3>
          <p style={{ maxWidth: '440px', color: '#D8D9F5', fontSize: '0.88rem', marginBottom: '20px' }}>
            {errorMessage}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => triggerFallback('NETWORK_TIMEOUT')}
              className="btn-primary"
              style={{ fontSize: '0.88rem', padding: '10px 18px' }}
            >
              <RotateCcw size={14} /> Coba Sumber Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
