'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, CheckCircle2, Search, ListVideo } from 'lucide-react';
import { Episode, Anime } from '@/lib/types';
import { getWatchHistory } from '@/lib/storage';

interface EpisodeSidebarProps {
  anime: Anime;
  episodes: Episode[];
  activeEpisodeId: string;
}

export default function EpisodeSidebar({
  anime,
  episodes,
  activeEpisodeId,
}: EpisodeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const history = getWatchHistory();

  const filteredEpisodes = episodes.filter((ep) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ep.title.toLowerCase().includes(q) ||
      String(ep.number).includes(q)
    );
  });

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        height: '100%',
        maxHeight: '680px',
        overflow: 'hidden',
        background: 'rgba(17, 17, 38, 0.75)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ListVideo size={18} color="#9C7BFF" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Daftar Episode</h3>
          <span className="badge badge-violet" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
            {episodes.length} Episode
          </span>
        </div>

        {/* Episode Search */}
        {episodes.length > 6 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Search size={14} color="#9696B4" />
            <input
              type="text"
              placeholder="Cari nomor atau judul episode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#F6F4FF',
                fontSize: '0.82rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
        )}
      </div>

      {/* Episode List Scrollable Area */}
      <div
        style={{
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        }}
      >
        {filteredEpisodes.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9696B4', fontSize: '0.88rem' }}>
            Tidak ada episode yang sesuai pencarian.
          </div>
        ) : (
          filteredEpisodes.map((ep) => {
            const isActive = ep.id === activeEpisodeId;
            const progress = history.find((h) => h.episodeId === ep.id);
            const isCompleted = progress?.completed;

            return (
              <Link
                key={ep.id}
                href={`/watch/${anime.id}/${ep.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(156, 123, 255, 0.2)' : 'rgba(23, 26, 53, 0.35)',
                  border: isActive ? '1px solid rgba(156, 123, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '68px',
                    height: '46px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    backgroundColor: '#111126',
                  }}
                >
                  <Image
                    src={ep.thumbnail || anime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200'}
                    alt={ep.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(156, 123, 255, 0.55)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Play size={14} fill="#ffffff" color="#ffffff" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: isActive ? '#9C7BFF' : '#78BFFF',
                      }}
                    >
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
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#F6F4FF' : '#D8D9F5',
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
                      {Math.floor(ep.durationSeconds / 60)} menit
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
