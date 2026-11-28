'use client';

import React, { useId, useState } from 'react';

export interface NorthstarLogoProps {
  /** Pixel width and height of the emblem. */
  size?: number;
  /** Enable cursor-driven 3D perspective tilt with multi-plane parallax. */
  interactive3d?: boolean;
  /** Enable gentle ambient star twinkle and orbital float animation. */
  animated?: boolean;
  /** 'badge' shows the obsidian glass squircle; 'mark' shows transparent floating monogram. */
  variant?: 'badge' | 'mark';
  className?: string;
}

export function NorthstarLogo({
  size = 48,
  interactive3d = true,
  animated = true,
  variant = 'badge',
  className = '',
}: NorthstarLogoProps) {
  const uid = useId().replace(/:/g, '');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 0, py: 0, active: false });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive3d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    const clampedX = Math.max(-1, Math.min(1, nx));
    const clampedY = Math.max(-1, Math.min(1, ny));
    setTilt({
      rx: -clampedY * 14,
      ry: clampedX * 14,
      px: clampedX,
      py: clampedY,
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0, px: 0, py: 0, active: false });
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative inline-flex select-none items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        perspective: '720px',
      }}
      aria-label="Northstar Workspace Logo"
    >
      <style>{`
        @keyframes nsFloat3d-${uid} {
          0%, 100% { transform: translate3d(0px, 0px, 10px); }
          50% { transform: translate3d(0px, -1.6px, 12px); }
        }
        @keyframes nsStarTwinkle-${uid} {
          0%, 100% { opacity: 0.92; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.09); }
        }
      `}</style>

      <div
        className="relative h-full w-full transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.active ? 1.04 : 1})`,
        }}
      >
        {/* Base Layer: Obsidian glass squircle + specular top/bottom rim highlights */}
        {variant === 'badge' && (
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full drop-shadow-[0_10px_22px_rgba(2,6,23,0.34)]"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id={`ns-bg-${uid}`} cx="58%" cy="32%" r="76%">
                <stop offset="0%" stopColor="#1F2636" />
                <stop offset="56%" stopColor="#0E121C" />
                <stop offset="100%" stopColor="#05070B" />
              </radialGradient>
              <linearGradient id={`ns-rim-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="22%" stopColor="#94A3B8" stopOpacity="0.14" />
                <stop offset="78%" stopColor="#94A3B8" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.38" />
              </linearGradient>
              <linearGradient id={`ns-spec-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>

            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="26"
              fill={`url(#ns-bg-${uid})`}
            />
            <rect
              x="2.6"
              y="2.6"
              width="94.8"
              height="94.8"
              rx="25.4"
              fill="none"
              stroke={`url(#ns-rim-${uid})`}
              strokeWidth="1.15"
            />
            <ellipse cx="50" cy="2.6" rx="18" ry="0.9" fill={`url(#ns-spec-${uid})`} />
            <ellipse cx="50" cy="97.4" rx="17" ry="0.9" fill={`url(#ns-spec-${uid})`} />
          </svg>
        )}

        {/* Mid Layer (Z +6px): 3D Sculpted N & Back Orbit */}
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full transition-transform duration-200 ease-out"
          style={{
            transform: `translate3d(${tilt.px * 1.8}px, ${tilt.py * 1.8}px, 6px)`,
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`ns-left-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="38%" stopColor="#EAEEF5" />
              <stop offset="80%" stopColor="#94A0B4" />
              <stop offset="100%" stopColor="#475163" />
            </linearGradient>
            <linearGradient id={`ns-right-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#394150" />
              <stop offset="38%" stopColor="#7B879B" />
              <stop offset="75%" stopColor="#E4E9F2" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id={`ns-diag-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="38%" stopColor="#F3F6FA" />
              <stop offset="74%" stopColor="#D5DCE8" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <filter id={`ns-drop-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.55" />
            </filter>
          </defs>

          {/* Orbital Back Segment */}
          <path
            d="M49.5 41.2 C61.0 32.0, 71.2 32.4, 69.2 40.8 C67.6 46.8, 59.5 53.2, 50.5 59.0 C57.8 51.8, 63.4 44.8, 64.2 39.8 C64.8 35.6, 58.2 36.2, 49.5 41.2 Z"
            fill="#DCE4F0"
          />

          {/* 3D Sculpted N */}
          <g filter={`url(#ns-drop-${uid})`}>
            <rect x="28" y="30" width="10.6" height="40" rx="5" fill={`url(#ns-left-${uid})`} />
            <rect x="59.4" y="30" width="10.6" height="40" rx="5" fill={`url(#ns-right-${uid})`} />
            <path
              d="M29.8 34.4 Q33.8 28.5 39.2 32.8 L68.2 65.4 Q65.0 71.2 59.0 67.4 Z"
              fill={`url(#ns-diag-${uid})`}
            />
          </g>
        </svg>

        {/* Top Layer (Z +11px): Foreground Orbital Swoosh & Glowing North Star */}
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full transition-transform duration-200 ease-out"
          style={{
            transform: `translate3d(${tilt.px * 3.2}px, ${tilt.py * 3.2}px, 11px)`,
            animation: animated ? `nsFloat3d-${uid} 4.2s ease-in-out infinite` : undefined,
          }}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`ns-star-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="62%" stopColor="#FFF8EB" />
              <stop offset="100%" stopColor="#E9EEF7" />
            </radialGradient>
            <filter id={`ns-glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Front Crescent Arc */}
          <path
            d="M31.2 54.0 C20.0 62.8, 19.6 68.5, 27.6 68.2 C37.6 67.8, 53.0 58.5, 65.8 46.8 C68.8 44.0, 69.8 40.4, 67.4 37.8 C65.4 36.0, 62.6 37.2, 62.8 39.6 C63.2 43.2, 52.8 52.8, 39.2 59.8 C29.8 64.6, 24.4 64.6, 24.8 60.6 C25.2 58.2, 27.8 56.0, 31.2 54.0 Z"
            fill="#FFFFFF"
            filter={`url(#ns-glow-${uid})`}
          />

          {/* 4-Point North Star */}
          <g
            style={{
              transformOrigin: '72.5px 26.8px',
              animation: animated ? `nsStarTwinkle-${uid} 2.8s ease-in-out infinite` : undefined,
            }}
            filter={`url(#ns-glow-${uid})`}
          >
            <path
              d="M72.5 16.0 Q73.2 26.1 83.3 26.8 Q73.2 27.5 72.5 37.6 Q71.8 27.5 61.7 26.8 Q71.8 26.1 72.5 16.0 Z"
              fill={`url(#ns-star-${uid})`}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default NorthstarLogo;
