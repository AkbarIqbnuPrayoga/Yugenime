'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Sparkles, Film, ArrowRight } from 'lucide-react';
import { Anime } from '@/lib/types';
import { truncateTitle } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.data) {
          setResults(json.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(9, 9, 17, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 16px 24px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          background: 'rgba(17, 17, 38, 0.95)',
          border: '1px solid rgba(156, 123, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(156, 123, 255, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
        }}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '12px',
          }}
        >
          <Search size={22} color="#9C7BFF" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Jelajahi judul, dunia, atau genre anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#F6F4FF',
              fontSize: '1.05rem',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          {loading && <Loader2 size={18} color="#78BFFF" className="animate-spin" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: '#9696B4', padding: '4px' }}
              aria-label="Bersihkan pencarian"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="badge"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#D8D9F5',
              cursor: 'pointer',
              border: 'none',
              padding: '6px 10px',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
          {!query && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#9696B4' }}>
              <Sparkles size={32} color="#9C7BFF" style={{ margin: '0 auto 12px', opacity: 0.7 }} />
              <p style={{ fontSize: '0.95rem', color: '#D8D9F5' }}>
                Ketik nama anime untuk membuka gerbang cerita.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'center',
                  marginTop: '16px',
                }}
              >
                {['Frieren', 'Solo Leveling', 'Jujutsu Kaisen', 'Demon Slayer', 'Fantasy'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="badge badge-violet"
                    style={{ cursor: 'pointer', textTransform: 'none' }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasSearched && !loading && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#9696B4' }}>
              <p style={{ color: '#F6F4FF', fontWeight: 600, fontSize: '1.05rem' }}>
                Tidak ada dunia anime yang ditemukan.
              </p>
              <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
                Coba cari dengan ejaan lain atau jelajahi katalog genre kami.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((anime) => (
                <Link
                  key={anime.id}
                  href={`/anime/${anime.id}`}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(23, 26, 53, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(156, 123, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(156, 123, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(23, 26, 53, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={anime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300'}
                      alt={anime.title.romaji || 'Anime cover'}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#F6F4FF',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {truncateTitle(anime.title.romaji || anime.title.english, 55)}
                    </h4>
                    {anime.title.english && anime.title.english !== anime.title.romaji && (
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: '#9696B4',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {anime.title.english}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className="badge badge-violet" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {anime.format || 'TV'}
                      </span>
                      {anime.releaseYear && (
                        <span style={{ fontSize: '0.75rem', color: '#78BFFF' }}>
                          {anime.releaseYear}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: '#9696B4' }}>
                        {anime.genres.slice(0, 2).join(' • ')}
                      </span>
                    </div>
                  </div>

                  <ArrowRight size={16} color="#9C7BFF" style={{ flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
