'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Play, Trash2, Search, Sparkles } from 'lucide-react';
import { WatchlistItem } from '@/lib/types';
import { getWatchlist, removeFromWatchlist } from '@/lib/storage';
import { showToast } from '@/components/common/Toast';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setWatchlist(getWatchlist());

    const handleUpdate = () => {
      setWatchlist(getWatchlist());
    };

    window.addEventListener('yugen:watchlist-updated', handleUpdate);
    return () => window.removeEventListener('yugen:watchlist-updated', handleUpdate);
  }, []);

  const handleRemove = (animeId: string, title: string) => {
    removeFromWatchlist(animeId);
    showToast(`"${title}" dihapus dari Watchlist.`, 'info');
  };

  const filteredList = watchlist.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Bookmark size={18} color="#9C7BFF" />
          <span className="badge badge-violet">KOLEKSI PRIBADI</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
          Daftar Tontonan (Watchlist)
        </h1>
        <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
          Daftar dunia anime yang telah Anda tandai untuk dijelajahi.
        </p>
      </div>

      {watchlist.length > 0 && (
        <div
          style={{
            maxWidth: '450px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'rgba(23, 26, 53, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Search size={18} color="#9C7BFF" />
          <input
            type="text"
            placeholder="Cari dalam watchlist Anda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#F6F4FF',
              fontSize: '0.92rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      )}

      {watchlist.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(23, 26, 53, 0.3)',
            borderRadius: '24px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <Sparkles size={48} color="#9C7BFF" style={{ margin: '0 auto 16px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
            Your next favorite story is waiting.
          </h3>
          <p style={{ color: '#9696B4', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Belum ada anime yang disimpan. Jelajahi katalog dan tekan ikon bookmark untuk menyimpan judul favorit Anda.
          </p>
          <Link href="/discover" className="btn-primary">
            Jelajahi Katalog Anime
          </Link>
        </div>
      ) : filteredList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9696B4' }}>
          Tidak ada judul yang sesuai dengan pencarian Anda.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '60px',
          }}
        >
          {filteredList.map((item) => (
            <div
              key={item.animeId}
              className="glass-card"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1/1.42',
                  backgroundColor: '#111126',
                }}
              >
                <Image
                  src={item.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400'}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
                <button
                  onClick={() => handleRemove(item.animeId, item.title)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(9, 9, 17, 0.75)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#F17D91',
                    border: '1px solid rgba(241, 125, 145, 0.3)',
                    cursor: 'pointer',
                  }}
                  title="Hapus dari Watchlist"
                  aria-label="Hapus dari Watchlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                    }}
                  >
                    {item.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', fontSize: '0.75rem', color: '#78BFFF' }}>
                    {item.genres.slice(0, 2).join(' • ')}
                  </div>
                </div>

                <Link
                  href={`/anime/${item.animeId}`}
                  className="btn-primary"
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    width: '100%',
                  }}
                >
                  <Play size={12} fill="#ffffff" />
                  <span>Lihat Detail</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
