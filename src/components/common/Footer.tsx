'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Shield, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '80px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'linear-gradient(to bottom, rgba(9, 9, 17, 0.4) 0%, rgba(17, 17, 38, 0.9) 100%)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div className="container-yugen" style={{ padding: '60px 24px 30px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px',
          }}
        >
          {/* Brand Info */}
          <div style={{ maxWidth: '320px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #9C7BFF, #78BFFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={16} color="#ffffff" />
              </div>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: '#F6F4FF',
                }}
              >
                YŪGENIME
              </span>
            </div>

            <p
              style={{
                fontStyle: 'italic',
                color: '#9C7BFF',
                fontSize: '0.95rem',
                marginBottom: '12px',
              }}
            >
              “Beyond Every World, A Story Awaits.”
            </p>

            <p style={{ fontSize: '0.86rem', color: '#9696B4', lineHeight: 1.6 }}>
              Platform penemuan anime modern bernuansa fantasi langit malam. Menjelajahi berbagai semesta cerita anime dengan estetika editorial, modular playback engine, dan navigasi mutakhir.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4
              style={{
                color: '#F6F4FF',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '18px',
              }}
            >
              Eksplorasi
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Katalog Anime', href: '/discover' },
                { name: 'Trending Sekarang', href: '/trending' },
                { name: 'Anime Musiman', href: '/seasonal' },
                { name: 'Daftar Genre', href: '/genres' },
                { name: 'Watchlist Saya', href: '/watchlist' },
                { name: 'Riwayat Tontonan', href: '/history' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '0.88rem',
                      color: '#D8D9F5',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#9C7BFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#D8D9F5')}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4
              style={{
                color: '#F6F4FF',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '18px',
              }}
            >
              Genre Populer
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Action', 'Fantasy', 'Adventure', 'Mystery', 'Sci-Fi', 'Romance', 'Supernatural', 'Slice of Life'].map((genre) => (
                <Link
                  key={genre}
                  href={`/genres/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                  className="badge badge-violet"
                  style={{ textTransform: 'none', fontSize: '0.78rem' }}
                >
                  {genre}
                </Link>
              ))}
            </div>
          </div>

          {/* Provider Attribution & Architecture */}
          <div>
            <h4
              style={{
                color: '#F6F4FF',
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '18px',
              }}
            >
              Provider & Legalitas
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#9696B4', lineHeight: 1.6, marginBottom: '12px' }}>
              Metadata ditenagai oleh AniList GraphQL & basis kurasi mandiri. Resolusi pemutaran mengutamakan saluran resmi berlisensi (Muse, Ani-One, Bilibili) dan server-side link resolver (@coflyn/scrapr).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64C99A', fontSize: '0.8rem' }}>
              <Shield size={14} />
              <span>Verified Provider Architecture</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '0.82rem',
            color: '#9696B4',
          }}
        >
          <div>
            © {new Date().getFullYear()} YŪGENIME. Modern Celestial Anime Discovery.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/settings" style={{ color: '#D8D9F5' }}>
              Preferensi
            </Link>
            <span>•</span>
            <span style={{ color: '#9696B4' }}>v1.0.0 Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
