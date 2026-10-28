'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="container-yugen"
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 20px',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(156, 123, 255, 0.15)',
          border: '1px solid rgba(156, 123, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 35px rgba(156, 123, 255, 0.3)',
          marginBottom: '24px',
        }}
      >
        <Sparkles size={36} color="#9C7BFF" />
      </div>

      <span className="badge badge-violet" style={{ marginBottom: '12px' }}>
        KODE KESALAHAN 404
      </span>

      <h1
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          color: '#F6F4FF',
          marginBottom: '12px',
        }}
      >
        Gerbang Dimensi Tidak Ditemukan
      </h1>

      <p
        style={{
          maxWidth: '500px',
          color: '#D8D9F5',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}
      >
        Koordinat cerita anime yang Anda tuju sepertinya berada di luar jangkauan portal kami. Mari kembali ke perbatasan dunia utama.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
        <Link href="/" className="btn-primary">
          <Home size={18} />
          <span>Kembali ke Beranda</span>
        </Link>
        <Link href="/discover" className="btn-secondary">
          <Compass size={18} />
          <span>Jelajahi Katalog Anime</span>
        </Link>
      </div>
    </div>
  );
}
