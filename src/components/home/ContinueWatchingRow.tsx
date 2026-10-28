'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Clock, Trash2 } from 'lucide-react';
import { WatchProgress } from '@/lib/types';
import { getWatchHistory, removeFromHistory } from '@/lib/storage';
import { truncateTitle } from '@/lib/utils';

export default function ContinueWatchingRow() {
  const [history, setHistory] = useState<WatchProgress[]>([]);

  useEffect(() => {
    setHistory(getWatchHistory());

    const handleUpdate = () => {
      setHistory(getWatchHistory());
    };

    window.addEventListener('yugen:history-updated', handleUpdate);
    return () => window.removeEventListener('yugen:history-updated', handleUpdate);
  }, []);

  if (history.length === 0) return null;

  return (
    <section style={{ marginBottom: '50px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#78BFFF" />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>Lanjutkan Menonton</h2>
        </div>
        <Link
          href="/history"
          style={{ fontSize: '0.88rem', color: '#9C7BFF', fontWeight: 500 }}
        >
          Lihat Semua Riwayat
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {history.slice(0, 4).map((item) => {
          const percent = item.durationSeconds
            ? Math.min(100, Math.round((item.positionSeconds / item.durationSeconds) * 100))
            : 0;

          return (
            <div
              key={item.episodeId}
              className="glass-card"
              style={{
                display: 'flex',
                gap: '14px',
                padding: '12px',
                borderRadius: '16px',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              {/* Thumbnail / Poster */}
              <div
                style={{
                  width: '90px',
                  height: '65px',
                  borderRadius: '10px',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#111126',
                }}
              >
                <Image
                  src={item.animeCover || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300'}
                  alt={item.animeTitle}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
                <Link
                  href={`/watch/${item.animeId}/${item.episodeId}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(9, 9, 17, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                  aria-label={`Lanjutkan ${item.animeTitle} Episode ${item.episodeNumber}`}
                >
                  <Play size={18} fill="#ffffff" />
                </Link>
              </div>

              {/* Information */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: '#F6F4FF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={item.animeTitle}
                >
                  {truncateTitle(item.animeTitle, 45)}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#78BFFF', marginTop: '2px' }}>
                  Episode {item.episodeNumber}
                </p>

                {/* Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    marginTop: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #9C7BFF, #77E6E0)',
                      borderRadius: '2px',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    fontSize: '0.7rem',
                    color: '#9696B4',
                  }}
                >
                  <span>{percent}% selesai</span>
                  <span>{Math.floor(item.positionSeconds / 60)} min</span>
                </div>
              </div>

              {/* Remove item from continue watching */}
              <button
                onClick={() => removeFromHistory(item.episodeId)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  color: '#9696B4',
                  padding: '4px',
                }}
                title="Hapus dari riwayat"
                aria-label="Hapus dari riwayat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
