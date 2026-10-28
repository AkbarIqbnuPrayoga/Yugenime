'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FastForward } from 'lucide-react';
import { isIntroSeen, markIntroSeen } from '@/lib/storage';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [stage, setStage] = useState<'checking' | 'playing' | 'skipping' | 'completed'>('checking');
  const [typedText, setTypedText] = useState('');
  const [showSubheading, setShowSubheading] = useState(false);

  const fullHeadline = 'EVERY WORLD HAS A STORY.';

  useEffect(() => {
    // Check if user already experienced intro in this browser session
    if (isIntroSeen()) {
      setStage('completed');
      onComplete();
      return;
    }

    setStage('playing');

    // Typewriter effect
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      if (charIndex <= fullHeadline.length) {
        setTypedText(fullHeadline.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setTimeout(() => setShowSubheading(true), 400);
        setTimeout(() => handleFinish(), 2600);
      }
    }, 60);

    return () => clearInterval(typingInterval);
  }, []);

  const handleFinish = () => {
    markIntroSeen();
    setStage('completed');
    onComplete();
  };

  const handleSkip = () => {
    markIntroSeen();
    setStage('skipping');
    setTimeout(() => {
      setStage('completed');
      onComplete();
    }, 200);
  };

  if (stage === 'completed' || stage === 'checking') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-intro-overlay"
        initial={{ opacity: 1 }}
        exit={{
          x: '100%',
          opacity: 0.9,
          transition: { duration: 0.9, ease: [0.77, 0, 0.175, 1] },
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#090911',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '24px',
        }}
      >
        {/* Celestial Nebula Glows */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(156,123,255,0.22) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(120,191,255,0.18) 0%, transparent 70%)',
            filter: 'blur(50px)',
            transform: 'translate(120px, -80px)',
            pointerEvents: 'none',
          }}
        />

        {/* Orbit Ring */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 0.35, rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            border: '1px dashed rgba(156,123,255,0.4)',
            pointerEvents: 'none',
          }}
        />

        {/* Logo and Star */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '28px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(156,123,255,0.3) 0%, rgba(120,191,255,0.2) 100%)',
              border: '1px solid rgba(156,123,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(156,123,255,0.4)',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={28} color="#F6F4FF" />
          </div>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: '#F6F4FF',
              textShadow: '0 0 20px rgba(156,123,255,0.6)',
            }}
          >
            YŪGENIME
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              color: '#9C7BFF',
              marginTop: '4px',
              textTransform: 'uppercase',
            }}
          >
            Fantasy Anime Portal
          </span>
        </motion.div>

        {/* Typewriter Headline */}
        <div
          style={{
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.2rem, 3.5vw, 2.2rem)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#F6F4FF',
            }}
          >
            {typedText}
            <span
              style={{
                display: 'inline-block',
                width: '3px',
                height: '1.2em',
                backgroundColor: '#9C7BFF',
                marginLeft: '6px',
                verticalAlign: 'middle',
                animation: 'blink 0.8s infinite',
              }}
            />
          </h1>
        </div>

        {/* Subheading */}
        <AnimatePresence>
          {showSubheading && (
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                color: '#D8D9F5',
                letterSpacing: '0.12em',
                marginTop: '12px',
                zIndex: 1,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Step beyond reality.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Skip Intro Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSkip}
          className="btn-secondary"
          style={{
            position: 'absolute',
            bottom: '36px',
            right: '36px',
            zIndex: 10,
            fontSize: '0.85rem',
            padding: '8px 18px',
            borderRadius: '9999px',
          }}
          aria-label="Lewati Intro Sinematik"
        >
          Skip Intro <FastForward size={14} />
        </motion.button>

        <style jsx>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            50.1%, 100% { opacity: 0; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
