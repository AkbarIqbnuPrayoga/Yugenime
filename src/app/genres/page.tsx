'use client';

import React from 'react';
import GenreGrid from '@/components/home/GenreGrid';
import { Layers } from 'lucide-react';

export default function GenresPage() {
  return (
    <div className="container-yugen" style={{ paddingTop: '110px', minHeight: '90vh' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Layers size={18} color="#9C7BFF" />
          <span className="badge badge-violet">SPEKTRUM CERITA</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
          Daftar Genre Anime
        </h1>
        <p style={{ color: '#D8D9F5', fontSize: '0.95rem', marginTop: '6px' }}>
          Pilih portal genre untuk menemukan kisah anime yang paling memikat hati Anda.
        </p>
      </div>

      <GenreGrid />
    </div>
  );
}
