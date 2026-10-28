'use client';

import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Activity, RefreshCw, Trash2, Sliders } from 'lucide-react';
import { UserPreferences, ProviderDescriptor, ProviderHealth } from '@/lib/types';
import { getPreferences, savePreferences } from '@/lib/storage';
import { showToast } from '@/components/common/Toast';

interface ProviderWithHealth extends ProviderDescriptor {
  health?: ProviderHealth;
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(getPreferences());
  const [providers, setProviders] = useState<ProviderWithHealth[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    setPrefs(getPreferences());

    async function loadProviders() {
      try {
        const res = await fetch('/api/providers');
        const json = await res.json();
        if (json.data) {
          setProviders(json.data);
        }
      } catch {
        // ignore
      } finally {
        setLoadingProviders(false);
      }
    }

    loadProviders();
  }, []);

  const handleToggleReducedMotion = () => {
    const updated = savePreferences({ reducedMotion: !prefs.reducedMotion });
    setPrefs(updated);
    showToast(
      updated.reducedMotion
        ? 'Mode gerak minim (Reduced Motion) diaktifkan.'
        : 'Animasi visual penuh diaktifkan.',
      'info'
    );
  };

  const handleToggleAutoplay = () => {
    const updated = savePreferences({ autoplayNext: !prefs.autoplayNext });
    setPrefs(updated);
    showToast(
      updated.autoplayNext
        ? 'Putar otomatis episode berikutnya diaktifkan.'
        : 'Putar otomatis episode berikutnya dinonaktifkan.',
      'info'
    );
  };

  const handleQualityChange = (quality: 'auto' | '1080p' | '720p' | '480p') => {
    const updated = savePreferences({ defaultQuality: quality });
    setPrefs(updated);
    showToast(`Kualitas default diubah ke ${quality.toUpperCase()}`, 'info');
  };

  const handleClearAllStorage = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua Watchlist, Riwayat Tontonan, dan pengaturan lokal?')) {
      localStorage.clear();
      sessionStorage.clear();
      setPrefs(getPreferences());
      showToast('Seluruh data lokal berhasil dibersihkan.', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Settings size={18} color="#9C7BFF" />
          <span className="badge badge-violet">PREFERENSI & KONTROL</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
          Pengaturan Pengguna
        </h1>
        <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
          Sesuaikan preferensi pemutaran, performa visual, dan pantau status penyedia streaming.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Playback & Visual Preferences Panel */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sliders size={20} color="#78BFFF" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Preferensi Pemutaran</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Reduced Motion */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Mode Reduced Motion</h4>
                <p style={{ fontSize: '0.82rem', color: '#9696B4' }}>
                  Kurangi efek transisi dan partikel untuk kenyamanan mata.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.reducedMotion}
                onChange={handleToggleReducedMotion}
                style={{ width: '20px', height: '20px', accentColor: '#9C7BFF', cursor: 'pointer' }}
                aria-label="Toggle reduced motion"
              />
            </div>

            {/* Autoplay Next Episode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Putar Otomatis Episode Berikutnya</h4>
                <p style={{ fontSize: '0.82rem', color: '#9696B4' }}>
                  Lanjutkan ke episode berikutnya saat episode aktif selesai.
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.autoplayNext}
                onChange={handleToggleAutoplay}
                style={{ width: '20px', height: '20px', accentColor: '#9C7BFF', cursor: 'pointer' }}
                aria-label="Toggle autoplay next episode"
              />
            </div>

            {/* Default Quality */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
                Kualitas Aliran Default
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['auto', '1080p', '720p', '480p'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQualityChange(q)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: prefs.defaultQuality === q ? 600 : 400,
                      background:
                        prefs.defaultQuality === q
                          ? 'linear-gradient(135deg, #9C7BFF, #78BFFF)'
                          : 'rgba(255, 255, 255, 0.05)',
                      color: prefs.defaultQuality === q ? '#ffffff' : '#D8D9F5',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                    }}
                  >
                    {q.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear All Storage */}
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={handleClearAllStorage}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#F17D91',
                  background: 'rgba(241, 125, 145, 0.1)',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid rgba(241, 125, 145, 0.25)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
                <span>Bersihkan Penyimpanan & Cache Sesi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Provider Registry Health Tracker */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Activity size={20} color="#64C99A" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Status Penyedia (Provider Registry)</h2>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#9696B4', marginBottom: '16px' }}>
            Sistem modular YŪGENIME memantau kelayakan setiap saluran streaming secara real-time untuk mencegah kegagalan pemutaran.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {providers.map((p) => {
              const status = p.health?.status || 'available';
              const isAvailable = status === 'available';

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(23, 26, 53, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F6F4FF' }}>
                      {p.name}
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: '#9696B4' }}>
                      Metode: {p.method}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isAvailable ? '#64C99A' : '#F17D91',
                        boxShadow: `0 0 8px ${isAvailable ? '#64C99A' : '#F17D91'}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: isAvailable ? '#64C99A' : '#F17D91',
                        textTransform: 'capitalize',
                      }}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
