'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Bookmark,
  History,
  Compass,
  Flame,
  Calendar,
  Layers,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import SearchModal from './SearchModal';
import { getWatchlist } from '@/lib/storage';

const NAV_LINKS = [
  { name: 'Home', href: '/', icon: Sparkles },
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'Trending', href: '/trending', icon: Flame },
  { name: 'Seasonal', href: '/seasonal', icon: Calendar },
  { name: 'Genres', href: '/genres', icon: Layers },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);

  // Monitor scroll for dynamic glassmorphism shift
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update watchlist count dynamically
  useEffect(() => {
    setWatchlistCount(getWatchlist().length);

    const handleUpdate = () => {
      setWatchlistCount(getWatchlist().length);
    };

    window.addEventListener('yugen:watchlist-updated', handleUpdate);
    return () => window.removeEventListener('yugen:watchlist-updated', handleUpdate);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 20px',
          pointerEvents: 'none',
        }}
      >
        <motion.nav
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '1220px',
            height: '62px',
            borderRadius: '24px',
            background: isScrolled ? 'rgba(11, 11, 24, 0.92)' : 'rgba(17, 17, 38, 0.65)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: isScrolled
              ? '1px solid rgba(156, 123, 255, 0.25)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isScrolled
              ? '0 12px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(156, 123, 255, 0.18)'
              : '0 8px 32px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          }}
          aria-label="Navigasi Utama"
        >
          {/* Left: Brand Identity */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#F6F4FF',
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '0.08em',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #9C7BFF 0%, #78BFFF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(156, 123, 255, 0.5)',
              }}
            >
              <Sparkles size={18} color="#ffffff" />
            </div>
            <span>YŪGENIME</span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div
            className="desktop-nav-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  style={{
                    position: 'relative',
                    padding: '8px 14px',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#F6F4FF' : '#D8D9F5',
                    transition: 'color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '14px',
                        right: '14px',
                        height: '2px',
                        borderRadius: '2px',
                        background: 'linear-gradient(90deg, #9C7BFF, #77E6E0)',
                        boxShadow: '0 0 10px #9C7BFF',
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Controls & Shortcuts */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D8D9F5',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(156, 123, 255, 0.4)';
                e.currentTarget.style.color = '#F6F4FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#D8D9F5';
              }}
              aria-label="Cari anime"
            >
              <Search size={18} />
            </button>

            {/* Watchlist */}
            <Link
              href="/watchlist"
              className="desktop-only"
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: pathname === '/watchlist' ? 'rgba(156, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: pathname === '/watchlist' ? '1px solid #9C7BFF' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: pathname === '/watchlist' ? '#9C7BFF' : '#D8D9F5',
              }}
              aria-label="Buka Watchlist"
            >
              <Bookmark size={18} />
              {watchlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#9C7BFF',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {watchlistCount}
                </span>
              )}
            </Link>

            {/* History */}
            <Link
              href="/history"
              className="desktop-only"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: pathname === '/history' ? 'rgba(156, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: pathname === '/history' ? '1px solid #9C7BFF' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: pathname === '/history' ? '#9C7BFF' : '#D8D9F5',
              }}
              aria-label="Riwayat Tontonan"
            >
              <History size={18} />
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className="desktop-only"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: pathname === '/settings' ? 'rgba(156, 123, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: pathname === '/settings' ? '1px solid #9C7BFF' : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: pathname === '/settings' ? '#9C7BFF' : '#D8D9F5',
              }}
              aria-label="Pengaturan"
            >
              <Settings size={18} />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-hamburger-btn"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D8D9F5',
              }}
              aria-label="Buka Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Glass Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(9, 9, 17, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#9C7BFF" />
                <span style={{ fontWeight: 700, letterSpacing: '0.1em' }}>YŪGENIME</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F6F4FF',
                }}
                aria-label="Tutup Menu"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {[
                ...NAV_LINKS,
                { name: 'Watchlist', href: '/watchlist', icon: Bookmark },
                { name: 'Riwayat Tontonan', href: '/history', icon: History },
                { name: 'Pengaturan', href: '/settings', icon: Settings },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: isActive ? 'rgba(156, 123, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: isActive ? '1px solid rgba(156, 123, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#F6F4FF' : '#D8D9F5',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '1.05rem',
                    }}
                  >
                    <IconComponent size={20} color={isActive ? '#9C7BFF' : '#9696B4'} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <style jsx global>{`
        @media (max-width: 900px) {
          .desktop-nav-links {
            display: none !important;
          }
          .desktop-only {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-hamburger-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
