import React from 'react';

/**
 * Loader — Full-page loading overlay and inline skeleton components.
 * Used during auth checks, parse operations, and route transitions.
 */

/** Spinning ring loader */
export function Spinner({ size = 24, color = 'var(--accent-primary)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.75s linear infinite' }}
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Skeleton shimmer block */
export function SkeletonBlock({ width = '100%', height = '1rem', borderRadius = '8px', style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  );
}

/** Full-page parsing loader overlay */
export function ParseLoader({ message = 'Analysing your voice note…' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        background: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 9000,
        animation: 'fadeIn 0.2s ease-out'
      }}
      role="status"
      aria-live="polite"
    >
      {/* Animated logo ring */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)',
          animation: 'pulseGlow 1.5s ease-in-out infinite alternate'
        }}
      >
        <span style={{ fontSize: '2rem' }}>✨</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>
          {message}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Extracting tasks with client-side NLP…
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              animation: `bounceDot 1s ease-in-out ${i * 0.2}s infinite alternate`
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Skeleton card for task list loading */
export function TaskSkeletonCard() {
  return (
    <div
      className="glass-card"
      style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
      aria-hidden="true"
    >
      <SkeletonBlock width="22px" height="22px" borderRadius="6px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <SkeletonBlock width="65%" height="1rem" />
        <SkeletonBlock width="40%" height="0.8rem" />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <SkeletonBlock width="70px" height="0.75rem" borderRadius="999px" />
          <SkeletonBlock width="90px" height="0.75rem" borderRadius="999px" />
        </div>
      </div>
      <SkeletonBlock width="60px" height="28px" borderRadius="8px" />
    </div>
  );
}

/** Skeleton for the task stats bar */
export function TaskStatsSkeleton() {
  return (
    <div
      className="glass-card"
      style={{ padding: '1rem 1.5rem', display: 'flex', gap: '2rem', alignItems: 'center' }}
      aria-hidden="true"
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <SkeletonBlock width="50px" height="1.5rem" />
          <SkeletonBlock width="70px" height="0.75rem" />
        </div>
      ))}
    </div>
  );
}
