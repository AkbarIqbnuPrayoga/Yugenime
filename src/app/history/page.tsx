'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, Play, Trash2, Clock, RotateCcw, AlertTriangle } from 'lucide-react';
import { WatchProgress } from '@/lib/types';
import { getWatchHistory, removeFromHistory, clearWatchHistory } from '@/lib/storage';
import { showToast } from '@/components/common/Toast';

export default function HistoryPage() {
  const [history, setHistory] = useState<WatchProgress[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getWatchHistory());

    const handleUpdate = () => {
      setHistory(getWatchHistory());
    };

    window.addEventListener('yugen:history-updated', handleUpdate);
    return () => window.removeEventListener('yugen:history-updated', handleUpdate);
  }, []);

  const handleRemoveItem = (episodeId: string, title: string) => {
    removeFromHistory(episodeId);
    showToast(`Riwayat tontonan "${title}" dihapus.`, 'info');
  };

  const handleClearAll = () => {
    clearWatchHistory();
    setShowClearConfirm(false);
    showToast('Seluruh riwayat tontonan berhasil dibersihkan.', 'success');
  };

  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <History size={18} color="#78BFFF" />
            <span className="badge badge-cyan">PERJALANAN ANDA</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
            Riwayat Tontonan
          </h1>
          <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
            Pantau dan lanjutkan episode anime yang telah Anda tonton sebelumnya.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'rgba(241, 125, 145, 0.12)',
              border: '1px solid rgba(241, 125, 145, 0.25)',
              color: '#F17D91',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
            <span>Bersihkan Semua Riwayat</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 9, 17, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '24px',
              borderRadius: '20px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <AlertTriangle size={36} color="#F17D91" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Hapus Seluruh Riwayat?</h3>
            <p style={{ color: '#D8D9F5', fontSize: '0.9rem', marginBottom: '20px' }}>
              Tindakan ini akan menghapus semua kemajuan tontonan dan episode yang tersimpan di perangkat ini.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowClearConfirm(false)} className="btn-secondary">
                Batal
              </button>
              <button
                onClick={handleClearAll}
                className="btn-primary"
                style={{ background: '#F17D91' }}
              >
                Ya, Bersihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(23, 26, 53, 0.3)',
            borderRadius: '24px',
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <Clock size={48} color="#78BFFF" style={{ margin: '0 auto 16px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
            Your viewing journey starts here.
          </h3>
          <p style={{ color: '#9696B4', maxWidth: '440px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Anda belum mulai menonton episode apa pun. Mulai penjelajahan Anda sekarang dan kemajuan tontonan akan otomatis dicatat.
          </p>
          <Link href="/discover" className="btn-primary">
            Mulai Menonton Anime
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '60px' }}>
          {history.map((item) => {
            const percent = item.durationSeconds
              ? Math.min(100, Math.round((item.positionSeconds / item.durationSeconds) * 100))
              : 0;

            return (
              <div
                key={item.episodeId}
                className="glass-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  padding: '14px 18px',
                  borderRadius: '16px',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: '120px',
                    height: '75px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
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
                    aria-label={`Lanjutkan ${item.animeTitle}`}
                  >
                    <Play size={20} fill="#ffffff" />
                  </Link>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                      EP {item.episodeNumber}
                    </span>
                    {item.completed && (
                      <span className="badge" style={{ background: 'rgba(100, 201, 154, 0.2)', color: '#64C99A', fontSize: '0.72rem' }}>
                        Selesai
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#F6F4FF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.animeTitle}
                  </h3>

                  {item.episodeTitle && (
                    <p style={{ fontSize: '0.82rem', color: '#9696B4', marginTop: '2px' }}>
                      {item.episodeTitle}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '360px',
                      height: '5px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      marginTop: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #9C7BFF, #77E6E0)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '0.75rem', color: '#9696B4' }}>
                    <span>{percent}% selesai</span>
                    <span>Posisi: {Math.floor(item.positionSeconds / 60)} menit</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link
                    href={`/watch/${item.animeId}/${item.episodeId}`}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <RotateCcw size={14} />
                    <span>Lanjutkan</span>
                  </Link>

                  <button
                    onClick={() => handleRemoveItem(item.episodeId, item.animeTitle)}
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#F17D91',
                    }}
                    title="Hapus item"
                    aria-label="Hapus dari riwayat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
