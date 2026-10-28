'use client';

import React from 'react';
import { PlaybackSource } from '@/lib/types';
import { Server, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

interface SourceSelectorProps {
  sources: PlaybackSource[];
  activeSourceId: string;
  onSelectSource: (source: PlaybackSource) => void;
  onManualRetry?: () => void;
  isRetrying?: boolean;
}

export default function SourceSelector({
  sources,
  activeSourceId,
  onSelectSource,
  onManualRetry,
  isRetrying = false,
}: SourceSelectorProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 18px',
        borderRadius: '16px',
        background: 'rgba(23, 26, 53, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#c7b3ff',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginRight: '6px',
        }}
      >
        <Server size={16} />
        <span>Penyedia Aliran:</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
        {sources.map((src) => {
          const isActive = src.id === activeSourceId;

          return (
            <button
              key={src.id}
              onClick={() => onSelectSource(src)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'linear-gradient(135deg, #9C7BFF, #78BFFF)' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#ffffff' : '#D8D9F5',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive ? '0 0 15px rgba(156, 123, 255, 0.4)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ShieldCheck size={14} color={isActive ? '#ffffff' : '#64C99A'} />
              <span>{src.providerName}</span>
              {src.method === 'external-link' && <ExternalLink size={12} />}
            </button>
          );
        })}
      </div>

      {onManualRetry && (
        <button
          onClick={onManualRetry}
          disabled={isRetrying}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#77E6E0',
            background: 'rgba(119, 230, 224, 0.1)',
            border: '1px solid rgba(119, 230, 224, 0.25)',
            cursor: isRetrying ? 'not-allowed' : 'pointer',
          }}
          title="Muat ulang sumber"
        >
          <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
          <span>Segarkan Sumber</span>
        </button>
      )}
    </div>
  );
}
