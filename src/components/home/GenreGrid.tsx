'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Compass,
  Zap,
  Heart,
  Search,
  Coffee,
  Ghost,
  Smile,
  Film,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { GENRE_LIST } from '@/lib/design-tokens';

const ICON_MAP: Record<string, React.ElementType> = {
  Action: ShieldAlert,
  Adventure: Compass,
  Fantasy: Sparkles,
  Romance: Heart,
  Mystery: Search,
  'Sci-Fi': Zap,
  'Slice of Life': Coffee,
  Horror: Ghost,
  Comedy: Smile,
  Drama: Film,
  Supernatural: Eye,
};

export default function GenreGrid() {
  return (
    <section style={{ marginBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-cyan" style={{ marginBottom: '8px', display: 'inline-flex' }}>
          DIMENSI CERITA
        </span>
        <h2 style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)', fontWeight: 700 }}>
          Jelajahi Berdasarkan Genre
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#9696B4', marginTop: '4px' }}>
          Temukan kisah yang selaras dengan imajinasi dan suasana hati Anda.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '14px',
        }}
      >
        {GENRE_LIST.map((genre) => {
          const IconComponent = ICON_MAP[genre.name] || Sparkles;

          return (
            <Link
              key={genre.id}
              href={`/genres/${genre.id}`}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '18px 16px',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(23, 26, 53, 0.5)',
              }}
            >
              {/* Subtle accent glow behind icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: genre.color,
                  filter: 'blur(25px)',
                  opacity: 0.25,
                }}
              />

              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  color: genre.color,
                }}
              >
                <IconComponent size={20} />
              </div>

              <span
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  color: '#F6F4FF',
                  marginBottom: '2px',
                }}
              >
                {genre.name}
              </span>

              <span style={{ fontSize: '0.75rem', color: '#9696B4' }}>
                Jelajahi Alam Ini
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
