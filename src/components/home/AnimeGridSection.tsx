'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Anime } from '@/lib/types';
import AnimeCard from '../common/AnimeCard';

interface AnimeGridSectionProps {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  items: Anime[];
  badgeText?: string;
}

export default function AnimeGridSection({
  title,
  subtitle,
  viewAllHref,
  items,
  badgeText,
}: AnimeGridSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section style={{ marginBottom: '60px' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <div>
          {badgeText && (
            <span
              className="badge badge-violet"
              style={{ marginBottom: '8px', display: 'inline-flex' }}
            >
              {badgeText}
            </span>
          )}
          <h2
            style={{
              fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)',
              fontWeight: 700,
              color: '#F6F4FF',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: '0.9rem', color: '#9696B4', marginTop: '4px' }}>
              {subtitle}
            </p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              color: '#9C7BFF',
              fontWeight: 600,
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
          >
            <span>Lihat Semua</span>
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Grid of Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '20px',
        }}
      >
        {items.map((anime, idx) => (
          <AnimeCard key={anime.id} anime={anime} priority={idx < 4} />
        ))}
      </div>
    </section>
  );
}
