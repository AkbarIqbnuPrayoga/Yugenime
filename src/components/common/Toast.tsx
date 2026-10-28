'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

let toastDispatch: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) {
  if (toastDispatch) {
    toastDispatch({ message, type, title });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastDispatch = (msg) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { ...msg, id }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    return () => {
      toastDispatch = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(17, 17, 38, 0.92)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${
                toast.type === 'success'
                  ? 'rgba(100, 201, 154, 0.4)'
                  : toast.type === 'error'
                  ? 'rgba(241, 125, 145, 0.4)'
                  : 'rgba(156, 123, 255, 0.4)'
              }`,
              borderRadius: '14px',
              padding: '12px 16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: '#F6F4FF',
            }}
          >
            <div style={{ marginTop: '2px', flexShrink: 0 }}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="#64C99A" />}
              {toast.type === 'error' && <AlertCircle size={18} color="#F17D91" />}
              {toast.type === 'info' && <Info size={18} color="#9C7BFF" />}
            </div>

            <div style={{ flex: 1, fontSize: '0.88rem' }}>
              {toast.title && (
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{toast.title}</div>
              )}
              <div style={{ color: '#D8D9F5' }}>{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: '#9696B4', padding: '2px' }}
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
