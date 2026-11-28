'use client';

import React, { useEffect, useId, useMemo, useRef } from 'react';
import {
  buildSignatureAnimationCss,
  SIGNATURE_SPARKLES,
  SignatureSparkleSpec,
} from './northstarSignatureData';

export type NorthstarLogoMode = 'signature' | 'loader' | 'hover3d' | 'idle';

export interface NorthstarLogoProps {
  /** Pixel width and height of the emblem. */
  size?: number;
  /**
   * Animation preset:
   * - `signature`: Exact 4.4s Signature Creation SVG animation (60 rich trail/star/dissolve sparkles, comet head + erase, rim sweep, float, shockwave, N sheen)
   * - `loader`: Continuous 2.2s orbital chase loop with Polaris heartbeat (splash / loading screens)
   * - `hover3d`: Interactive 3D perspective + glass cursor sheen + multi-layer parallax + tap burst
   * - `idle`: Quiet ambient metallic glint + traveling orbital highlight + gentle Polaris twinkle (headers/bars)
   */
  mode?: NorthstarLogoMode;
  /** Enable cursor-driven 3D perspective tilt on hover. */
  interactive3d?: boolean;
  /** Enable ambient / choreography animation (respects prefers-reduced-motion). */
  animated?: boolean;
  /** 'badge' shows the obsidian glass squircle; 'mark' renders the floating N + orbit + star only. */
  variant?: 'badge' | 'mark';
  className?: string;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeInOutCubic = (t: number) => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

function renderSparkleNode(s: SignatureSparkleSpec, uid: string) {
  const cls = `ns-sp-${uid}-${s.cls}`;
  const starPath = (r: number) => {
    const k = (r * 0.16).toFixed(2);
    const rv = r.toFixed(2);
    return `M 0 -${rv} C ${k} -${k}, ${k} -${k}, ${rv} 0 C ${k} ${k}, ${k} ${k}, 0 ${rv} C -${k} ${k}, -${k} ${k}, -${rv} 0 C -${k} -${k}, -${k} -${k}, 0 -${rv} Z`;
  };
  const diamondPath = (r: number) => {
    const w = (r * 0.62).toFixed(2);
    const rv = r.toFixed(2);
    return `M 0 -${rv} L ${w} 0 L 0 ${rv} L -${w} 0 Z`;
  };

  let inner: React.ReactNode;
  if (s.kind === 'circle') {
    inner = <circle className={cls} cx="0" cy="0" r={s.r} fill={s.color} />;
  } else if (s.kind === 'diamond') {
    inner = <path className={cls} d={diamondPath(s.r)} fill={s.color} />;
  } else if (s.kind === 'star') {
    inner = <path className={cls} d={starPath(s.r)} fill={s.color} />;
  } else if (s.kind === 'circleGlow') {
    inner = (
      <g className={cls}>
        <circle cx="0" cy="0" r={s.rOuter ?? s.r * 1.9} fill={s.color} opacity="0.22" />
        <circle cx="0" cy="0" r={s.r} fill={s.color} />
      </g>
    );
  } else {
    inner = (
      <g className={cls}>
        <circle cx="0" cy="0" r={s.rOuter ?? s.r * 1.45} fill={s.color} opacity="0.24" />
        <path d={starPath(s.r)} fill={s.color} />
      </g>
    );
  }

  return (
    <g key={s.cls} transform={`translate(${s.tx},${s.ty})`}>
      {inner}
    </g>
  );
}

export function NorthstarLogo({
  size = 48,
  mode = 'idle',
  interactive3d = true,
  animated = true,
  variant = 'badge',
  className = '',
}: NorthstarLogoProps) {
  const uid = useId().replace(/:/g, '');
  const isSignature = mode === 'signature' && animated;

  const signatureCss = useMemo(
    () => (isSignature ? buildSignatureAnimationCss(uid) : ''),
    [isSignature, uid],
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const squircleGroupRef = useRef<SVGGElement>(null);
  const cursorSheenGradRef = useRef<SVGRadialGradientElement>(null);
  const cursorSheenRectRef = useRef<SVGRectElement>(null);
  const letterNRef = useRef<SVGGElement>(null);
  const sheenBarRef = useRef<SVGRectElement>(null);
  const ringLayerRef = useRef<SVGGElement>(null);
  const ringMaskRef = useRef<SVGPathElement>(null);
  const ringPulseRef = useRef<SVGPathElement>(null);
  const cometRef = useRef<SVGGElement>(null);
  const starLayerRef = useRef<SVGGElement>(null);
  const starCoreRef = useRef<SVGGElement>(null);
  const starHaloRef = useRef<SVGCircleElement>(null);
  const shockwaveRef = useRef<SVGCircleElement>(null);

  const animStateRef = useRef({
    elapsed: 0,
    pointerActive: false,
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    targetSheenX: 50,
    targetSheenY: 50,
    currentSheenX: 50,
    currentSheenY: 50,
    hoverBurstTimer: mode === 'hover3d' ? 0 : -1,
  });

  useEffect(() => {
    const s = animStateRef.current;
    s.elapsed = 0;
    s.hoverBurstTimer = mode === 'hover3d' ? 0 : -1;

    const ringMask = ringMaskRef.current;
    if (!ringMask && !interactive3d) return;

    const ringLen =
      ringMask && typeof ringMask.getTotalLength === 'function'
        ? ringMask.getTotalLength()
        : 446;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!isSignature && (!animated || reducedMotion) && ringMask) {
      ringMask.setAttribute('stroke-dasharray', `${ringLen + 8} ${ringLen + 120}`);
      ringMask.setAttribute('stroke-dashoffset', '0');
      ringMask.setAttribute('stroke-opacity', '1');
      if (ringPulseRef.current) ringPulseRef.current.setAttribute('opacity', '0');
      if (cometRef.current) cometRef.current.setAttribute('opacity', '0');
      if (sheenBarRef.current) sheenBarRef.current.setAttribute('opacity', '0');
      if (shockwaveRef.current) shockwaveRef.current.setAttribute('opacity', '0');
      if (starCoreRef.current) {
        starCoreRef.current.style.transform = 'scale(1)';
        starCoreRef.current.style.opacity = '1';
      }
      if (starHaloRef.current) {
        starHaloRef.current.style.transform = 'scale(1)';
        starHaloRef.current.style.opacity = '0.88';
      }
      return;
    }

    const setRingReveal = (phase: 'full' | 'create' | 'erase', progress: number) => {
      if (!ringMask) return;
      const pad = 26;
      const dashLen = ringLen + 8;
      const gapLen = ringLen + 120;
      ringMask.setAttribute('stroke-dasharray', `${dashLen} ${gapLen}`);
      if (phase === 'full') {
        ringMask.setAttribute('stroke-dashoffset', '0');
        ringMask.setAttribute('stroke-opacity', '1');
      } else if (phase === 'create') {
        const p = clamp(progress, 0, 1);
        ringMask.setAttribute('stroke-dashoffset', lerp(dashLen + pad, 0, p).toFixed(2));
        ringMask.setAttribute('stroke-opacity', p < 0.025 ? (p / 0.025).toFixed(3) : '1');
      } else {
        const p = clamp(progress, 0, 1);
        ringMask.setAttribute('stroke-dashoffset', lerp(0, -(dashLen + pad), p).toFixed(2));
        ringMask.setAttribute('stroke-opacity', p > 0.96 ? ((1 - p) / 0.04).toFixed(3) : '1');
      }
    };

    const positionComet = (progress: number, opacity: number, scale = 1) => {
      const comet = cometRef.current;
      if (!comet || !ringMask) return;
      if (opacity <= 0.01 || typeof ringMask.getPointAtLength !== 'function') {
        comet.setAttribute('opacity', '0');
        return;
      }
      const pt = ringMask.getPointAtLength(clamp(progress, 0, 1) * ringLen);
      comet.setAttribute('transform', `translate(${pt.x.toFixed(2)}, ${pt.y.toFixed(2)}) scale(${scale.toFixed(3)})`);
      comet.setAttribute('opacity', opacity.toFixed(3));
    };

    const setMetallicSheen = (progress: number, opacityScale = 1) => {
      const bar = sheenBarRef.current;
      if (!bar) return;
      if (progress <= 0 || progress >= 1) {
        bar.setAttribute('opacity', '0');
        return;
      }
      const x = lerp(40, 415, progress);
      const env = Math.sin(progress * Math.PI);
      bar.setAttribute('transform', `translate(${x.toFixed(1)}, 0) rotate(24 254 262)`);
      bar.setAttribute('opacity', (env * 0.72 * opacityScale).toFixed(3));
    };

    const setStarState = (scale: number, rotDeg: number, coreOp: number, haloScale: number, haloOp: number) => {
      if (starCoreRef.current) {
        starCoreRef.current.style.transform = `scale(${scale.toFixed(3)}) rotate(${rotDeg.toFixed(2)}deg)`;
        starCoreRef.current.style.opacity = coreOp.toFixed(3);
      }
      if (starHaloRef.current) {
        starHaloRef.current.style.transform = `scale(${haloScale.toFixed(3)})`;
        starHaloRef.current.style.opacity = haloOp.toFixed(3);
      }
    };

    const setShockwave = (progress: number) => {
      const sw = shockwaveRef.current;
      if (!sw) return;
      if (progress <= 0 || progress >= 1) {
        sw.setAttribute('opacity', '0');
        return;
      }
      const eased = easeOutCubic(progress);
      sw.style.transform = `scale(${lerp(0.55, 2.35, eased).toFixed(3)})`;
      sw.setAttribute('opacity', ((1 - eased) * 0.62).toFixed(3));
    };

    let rafId = 0;
    let lastTs = 0;

    const frame = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      s.elapsed += dt;

      if (interactive3d && rigRef.current) {
        const damp = 1 - Math.exp(-dt * 11);
        s.currentTiltX = lerp(s.currentTiltX, s.targetTiltX, damp);
        s.currentTiltY = lerp(s.currentTiltY, s.targetTiltY, damp);
        s.currentSheenX = lerp(s.currentSheenX, s.targetSheenX, damp);
        s.currentSheenY = lerp(s.currentSheenY, s.targetSheenY, damp);

        rigRef.current.style.transform = `rotateX(${s.currentTiltX.toFixed(2)}deg) rotateY(${s.currentTiltY.toFixed(2)}deg)`;
        if (cursorSheenGradRef.current && cursorSheenRectRef.current) {
          cursorSheenGradRef.current.setAttribute('cx', `${s.currentSheenX.toFixed(1)}%`);
          cursorSheenGradRef.current.setAttribute('cy', `${s.currentSheenY.toFixed(1)}%`);
          cursorSheenRectRef.current.setAttribute('opacity', s.pointerActive ? '1' : '0');
        }

        const px = s.currentTiltY / 16;
        const py = -s.currentTiltX / 16;
        if (letterNRef.current) letterNRef.current.style.transform = `translate(${(px * 4.5).toFixed(2)}px, ${(py * 4.5).toFixed(2)}px)`;
        if (ringLayerRef.current) ringLayerRef.current.style.transform = `translate(${(px * 8.5).toFixed(2)}px, ${(py * 8.5).toFixed(2)}px)`;
        if (starLayerRef.current) starLayerRef.current.style.transform = `translate(${(px * 13).toFixed(2)}px, ${(py * 13).toFixed(2)}px)`;
      }

      if (!isSignature && animated && !reducedMotion) {
        if (mode === 'loader') {
          const LOADER_DUR = 2.2;
          const p = (s.elapsed % LOADER_DUR) / LOADER_DUR;
          if (ringPulseRef.current) ringPulseRef.current.setAttribute('opacity', '0');

          if (p <= 0.50) {
            const drawP = easeInOutCubic(p / 0.50);
            setRingReveal('create', drawP);
            const env = Math.sin((p / 0.50) * Math.PI);
            positionComet(drawP, 0.55 + env * 0.45, 0.85 + env * 0.25);
          } else {
            const eraseP = easeInOutCubic((p - 0.50) / 0.50);
            setRingReveal('erase', eraseP);
            const env = Math.sin(((p - 0.50) / 0.50) * Math.PI);
            positionComet(eraseP, env * 0.72, 0.75);
          }

          const beat = Math.exp(-Math.pow((p - 0.47) / 0.14, 2));
          setStarState(0.84 + beat * 0.30, beat * 12, 0.62 + beat * 0.38, 0.78 + beat * 0.44, 0.48 + beat * 0.52);
          setShockwave(p > 0.43 && p < 0.78 ? (p - 0.43) / 0.35 : 0);
          setMetallicSheen(p > 0.25 && p < 0.72 ? easeInOutCubic((p - 0.25) / 0.47) : 0, 0.55);

          if (squircleGroupRef.current) {
            const lift = Math.sin(p * Math.PI * 2) * 0.012;
            squircleGroupRef.current.style.transform = `scale(${(1 + lift).toFixed(4)})`;
          }
        } else if (mode === 'hover3d') {
          if (ringPulseRef.current) ringPulseRef.current.setAttribute('opacity', '0');
          if (s.hoverBurstTimer >= 0) {
            s.hoverBurstTimer += dt;
            const bt = s.hoverBurstTimer;
            if (bt <= 0.92) {
              const pRing = easeInOutCubic(bt / 0.92);
              setRingReveal('create', pRing);
              positionComet(pRing, Math.sin(pRing * Math.PI) * 0.98, 1.05);
            } else {
              setRingReveal('full', 1);
              positionComet(1, 0);
            }
            if (bt >= 0.65 && bt <= 1.35) {
              const pStar = (bt - 0.65) / 0.70;
              setStarState(1 + Math.sin(pStar * Math.PI) * 0.28, (1 - easeOutCubic(pStar)) * 22, 1, 1 + Math.sin(pStar * Math.PI) * 0.45, 1);
              setShockwave(pStar);
            } else {
              const breath = Math.sin(s.elapsed * 2.4) * 0.04;
              setStarState(1 + breath, 0, 1, 1 + breath, 0.92);
              setShockwave(0);
            }
            setMetallicSheen(bt >= 0.55 && bt <= 1.45 ? easeInOutCubic((bt - 0.55) / 0.90) : 0, 0.9);
            if (bt > 1.55) s.hoverBurstTimer = -1;
          } else {
            setRingReveal('full', 1);
            positionComet(1, 0);
            setShockwave(0);
            setMetallicSheen(0);
            const breath = Math.sin(s.elapsed * 2.2) * 0.04;
            setStarState(1 + breath, 0, 1, 1 + breath * 1.5, 0.88 + breath);
          }
        } else {
          // Quiet Micro-Motion ('idle')
          const IDLE_DUR = 3.6;
          const t = s.elapsed % IDLE_DUR;
          setRingReveal('full', 1);
          positionComet(1, 0);
          setShockwave(0);

          setMetallicSheen(t >= 0.6 && t <= 1.55 ? easeInOutCubic((t - 0.6) / 0.95) : 0, 0.62);

          if (ringPulseRef.current) {
            if (t >= 1.05 && t <= 2.15) {
              const p = easeInOutCubic((t - 1.05) / 1.10);
              const pulseLen = 68;
              ringPulseRef.current.setAttribute('stroke-dasharray', `${pulseLen} ${ringLen + 100}`);
              ringPulseRef.current.setAttribute('stroke-dashoffset', lerp(pulseLen + 10, -(ringLen + 10), p).toFixed(1));
              ringPulseRef.current.setAttribute('opacity', (Math.sin(p * Math.PI) * 0.85).toFixed(3));
            } else {
              ringPulseRef.current.setAttribute('opacity', '0');
            }
          }

          if (t >= 1.85 && t <= 2.85) {
            const p = (t - 1.85) / 1.0;
            const tw = Math.sin(p * Math.PI);
            setStarState(1 + tw * 0.12, tw * 8, 1, 1 + tw * 0.25, 0.82 + tw * 0.18);
          } else {
            const calm = Math.sin((t / IDLE_DUR) * Math.PI * 2) * 0.025;
            setStarState(1 + calm, 0, 0.96, 0.95 + calm, 0.78 + calm * 2);
          }
        }
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [mode, isSignature, animated, interactive3d]);

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = animStateRef.current;
    s.pointerActive = true;
    handlePointerMove(e);
    if (mode === 'hover3d') {
      s.hoverBurstTimer = 0;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive3d || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    const s = animStateRef.current;
    s.pointerActive = true;
    s.targetTiltY = (nx - 0.5) * 26;
    s.targetTiltX = -(ny - 0.5) * 26;
    s.targetSheenX = nx * 100;
    s.targetSheenY = ny * 100;
  };

  const handlePointerLeave = () => {
    const s = animStateRef.current;
    s.pointerActive = false;
    s.targetTiltX = 0;
    s.targetTiltY = 0;
  };

  const handleClick = () => {
    if (mode === 'hover3d') {
      animStateRef.current.hoverBurstTimer = 0;
    }
  };

  return (
    <div
      ref={stageRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      className={`relative inline-flex select-none items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        perspective: '900px',
      }}
      aria-label="Northstar Workspace Logo"
    >
      {isSignature && <style>{signatureCss}</style>}
      <div
        ref={rigRef}
        className="relative h-full w-full"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <svg
          viewBox="0 0 512 512"
          className="h-full w-full overflow-visible drop-shadow-[0_10px_22px_rgba(3,7,18,0.28)]"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id={`nsBg-${uid}`} cx="50%" cy="18%" r="86%" fx="50%" fy="15%">
              <stop offset="0%" stopColor="#161B29" />
              <stop offset="48%" stopColor="#0B0E17" />
              <stop offset="100%" stopColor="#04050A" />
            </radialGradient>
            <linearGradient id={`nsRim-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C8DAFA" stopOpacity="0.72" />
              <stop offset="16%" stopColor="#667B9E" stopOpacity="0.28" />
              <stop offset="52%" stopColor="#263146" stopOpacity="0.16" />
              <stop offset="86%" stopColor="#536585" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#A3B8DC" stopOpacity="0.48" />
            </linearGradient>
            <radialGradient ref={cursorSheenGradRef} id={`nsSheenCursor-${uid}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
              <stop offset="45%" stopColor="#AFC8F5" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`nsLeft-${uid}`} x1="187" y1="168" x2="187" y2="356" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="28%" stopColor="#F1F5FB" />
              <stop offset="56%" stopColor="#C9D4E4" />
              <stop offset="80%" stopColor="#65738A" />
              <stop offset="100%" stopColor="#242C3B" />
            </linearGradient>
            <linearGradient id={`nsRight-${uid}`} x1="321" y1="168" x2="321" y2="356" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#253044" />
              <stop offset="22%" stopColor="#4F5E78" />
              <stop offset="52%" stopColor="#B7C4D8" />
              <stop offset="78%" stopColor="#EDF2FA" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id={`nsDiag-${uid}`} x1="175" y1="180" x2="334" y2="344" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F6F8FC" />
              <stop offset="68%" stopColor="#E7EEF8" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id={`nsFoldL-${uid}`} x1="196" y1="224" x2="174" y2="256" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#070C17" stopOpacity="0.38" />
              <stop offset="55%" stopColor="#070C17" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#070C17" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`nsFoldR-${uid}`} x1="312" y1="296" x2="336" y2="262" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#070C17" stopOpacity="0.35" />
              <stop offset="55%" stopColor="#070C17" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#070C17" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`nsRing-${uid}`} x1="115" y1="342" x2="352" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="54%" stopColor="#FFFFFF" />
              <stop offset="82%" stopColor="#E5ECF6" />
              <stop offset="100%" stopColor="#CBD6E8" />
            </linearGradient>
            <linearGradient id={`nsMetallic-${uid}`} x1="0%" y1="0%" x2="100%" y2="35%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="36%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.90" />
              <stop offset="64%" stopColor="#DCEBFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`nsHalo-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.74" />
              <stop offset="28%" stopColor="#FFF4D4" stopOpacity="0.36" />
              <stop offset="62%" stopColor="#E6DFC8" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#FFF8E0" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`nsComet-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="26%" stopColor="#FFF9E6" stopOpacity="0.92" />
              <stop offset="56%" stopColor="#A8D1FF" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`nsErase-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#CBE4FF" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`nsSqClip-${uid}`}>
              <path d="M 150 38 L 362 38 C 428 38, 474 84, 474 150 L 474 362 C 474 428, 428 474, 362 474 L 150 474 C 84 474, 38 428, 38 362 L 38 150 C 38 84, 84 38, 150 38 Z" />
            </clipPath>
            <clipPath id={`nsLClip-${uid}`}><rect x="164" y="168" width="46" height="188" rx="23" ry="23" /></clipPath>
            <clipPath id={`nsRClip-${uid}`}><rect x="298" y="168" width="46" height="188" rx="23" ry="23" /></clipPath>
            <clipPath id={`nsNClip-${uid}`}>
              <rect x="164" y="168" width="46" height="188" rx="23" ry="23" />
              <rect x="298" y="168" width="46" height="188" rx="23" ry="23" />
              <path d="M 203.73 175.22 L 337.73 317.22 A 23 23 0 0 1 304.27 348.79 L 170.27 206.79 A 23 23 0 0 1 203.73 175.22 Z" />
            </clipPath>
            <clipPath id={`nsRingExact-${uid}`}>
              <path d="M 131 302 C 106 328, 110 351, 146 349 C 192 346, 250 311, 301 264 C 341 227, 360 197, 349 182 C 337 167, 294 182, 244 216 C 291 190, 327 181, 335 190 C 341 198, 326 225, 295 258 C 245 303, 187 332, 144 335 C 122 336, 117 324, 131 302 Z" />
            </clipPath>
            <mask id={`nsMask-${uid}`} maskUnits="userSpaceOnUse" x="80" y="140" width="320" height="250">
              <rect x="80" y="140" width="320" height="250" fill="#000000" />
              <path
                ref={ringMaskRef}
                className={isSignature ? `ns-mask-stroke-${uid}` : undefined}
                d="M 131 302 C 110 326, 114 344, 144 342 C 188 339, 246 306, 296 260 C 334 224, 353 196, 344 185 C 334 173, 292 186, 244 216"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="28"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </mask>
          </defs>

          <g className={isSignature ? `ns-root-${uid}` : undefined}>
            {variant === 'badge' && (
              <g ref={squircleGroupRef} style={{ transformOrigin: '256px 256px' }}>
                <path
                  d="M 150 38 L 362 38 C 428 38, 474 84, 474 150 L 474 362 C 474 428, 428 474, 362 474 L 150 474 C 84 474, 38 428, 38 362 L 38 150 C 38 84, 84 38, 150 38 Z"
                  fill={`url(#nsBg-${uid})`}
                />
                <g clipPath={`url(#nsSqClip-${uid})`}>
                  <ellipse cx="256" cy="46" rx="188" ry="58" fill="#3E588A" opacity="0.12" />
                  <rect ref={cursorSheenRectRef} x="38" y="38" width="436" height="436" fill={`url(#nsSheenCursor-${uid})`} opacity="0" />
                </g>
                <path
                  d="M 150 38 L 362 38 C 428 38, 474 84, 474 150 L 474 362 C 474 428, 428 474, 362 474 L 150 474 C 84 474, 38 428, 38 362 L 38 150 C 38 84, 84 38, 150 38 Z"
                  fill="none"
                  stroke={`url(#nsRim-${uid})`}
                  strokeWidth="1.6"
                />
                {isSignature && (
                  <path
                    className={`ns-rim-sweep-${uid}`}
                    d="M 150 38 L 362 38 C 428 38, 474 84, 474 150 L 474 362 C 474 428, 428 474, 362 474 L 150 474 C 84 474, 38 428, 38 362 L 38 150 C 38 84, 84 38, 150 38 Z"
                    fill="none"
                    stroke="#EAF3FF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0"
                  />
                )}
              </g>
            )}

            <g ref={letterNRef} style={{ transformOrigin: '254px 262px' }}>
              <rect x="164" y="168" width="46" height="188" rx="23" ry="23" fill={`url(#nsLeft-${uid})`} />
              <g clipPath={`url(#nsLClip-${uid})`}><polygon points="164,200 214,253 214,284 164,234" fill={`url(#nsFoldL-${uid})`} /></g>
              <rect x="298" y="168" width="46" height="188" rx="23" ry="23" fill={`url(#nsRight-${uid})`} />
              <g clipPath={`url(#nsRClip-${uid})`}><polygon points="294,270 346,325 346,292 294,238" fill={`url(#nsFoldR-${uid})`} /></g>
              <path d="M 203.73 175.22 L 337.73 317.22 A 23 23 0 0 1 304.27 348.79 L 170.27 206.79 A 23 23 0 0 1 203.73 175.22 Z" fill={`url(#nsDiag-${uid})`} />
              <g clipPath={`url(#nsNClip-${uid})`}>
                <rect
                  ref={sheenBarRef}
                  className={isSignature ? `ns-sheen-${uid}` : undefined}
                  x="20"
                  y="110"
                  width="130"
                  height="310"
                  fill={`url(#nsMetallic-${uid})`}
                  opacity="0"
                  transform="rotate(24 254 262)"
                />
              </g>
            </g>

            <g ref={ringLayerRef} style={{ transformOrigin: '256px 260px' }}>
              <g mask={`url(#nsMask-${uid})`}>
                <path
                  d="M 131 302 C 106 328, 110 351, 146 349 C 192 346, 250 311, 301 264 C 341 227, 360 197, 349 182 C 337 167, 294 182, 244 216 C 291 190, 327 181, 335 190 C 341 198, 326 225, 295 258 C 245 303, 187 332, 144 335 C 122 336, 117 324, 131 302 Z"
                  fill="#040812"
                  opacity="0.34"
                  transform="translate(0, 3)"
                />
                <path
                  d="M 131 302 C 106 328, 110 351, 146 349 C 192 346, 250 311, 301 264 C 341 227, 360 197, 349 182 C 337 167, 294 182, 244 216 C 291 190, 327 181, 335 190 C 341 198, 326 225, 295 258 C 245 303, 187 332, 144 335 C 122 336, 117 324, 131 302 Z"
                  fill={`url(#nsRing-${uid})`}
                />
              </g>
              <g clipPath={`url(#nsRingExact-${uid})`}>
                <path
                  ref={ringPulseRef}
                  d="M 131 302 C 110 326, 114 344, 144 342 C 188 339, 246 306, 296 260 C 334 224, 353 196, 344 185 C 334 173, 292 186, 244 216"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="26"
                  strokeLinecap="round"
                  opacity="0"
                />
              </g>

              {isSignature ? (
                <>
                  <g className={`ns-sparkles-${uid}`}>
                    {SIGNATURE_SPARKLES.map((s) => renderSparkleNode(s, uid))}
                  </g>
                  <g className={`ns-comet-head-${uid}`}>
                    <circle cx="0" cy="0" r="22" fill={`url(#nsComet-${uid})`} />
                    <circle cx="0" cy="0" r="4.4" fill="#FFFFFF" />
                    <path d="M 0 -12 C 0.9 -3, 3 -0.9, 12 0 C 3 0.9, 0.9 3, 0 12 C -0.9 3, -3 0.9, -12 0 C -3 -0.9, -0.9 -3, 0 -12 Z" fill="#FFFFFF" opacity="0.98" />
                  </g>
                  <g className={`ns-comet-erase-${uid}`}>
                    <circle cx="0" cy="0" r="15" fill={`url(#nsErase-${uid})`} />
                    <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
                    <path d="M 0 -8 C 0.7 -2, 2 -0.7, 8 0 C 2 0.7, 0.7 2, 0 8 C -0.7 2, -2 0.7, -8 0 C -2 -0.7, -0.7 -2, 0 -8 Z" fill="#E6F2FF" opacity="0.92" />
                  </g>
                </>
              ) : (
                <g ref={cometRef} opacity="0" style={{ transformOrigin: '0px 0px' }}>
                  <circle cx="0" cy="0" r="22" fill={`url(#nsComet-${uid})`} />
                  <circle cx="0" cy="0" r="4.4" fill="#FFFFFF" />
                  <path d="M 0 -12 C 0.9 -3, 3 -0.9, 12 0 C 3 0.9, 0.9 3, 0 12 C -0.9 3, -3 0.9, -12 0 C -3 -0.9, -0.9 -3, 0 -12 Z" fill="#FFFFFF" opacity="0.98" />
                </g>
              )}
            </g>

            <g ref={starLayerRef} style={{ transformOrigin: '355px 148px' }}>
              <circle
                ref={shockwaveRef}
                className={isSignature ? `ns-shockwave-${uid}` : undefined}
                cx="355"
                cy="148"
                r="26"
                fill="none"
                stroke="#FFF9E6"
                strokeWidth="1.6"
                opacity="0"
                style={{ transformOrigin: '355px 148px' }}
              />
              <circle
                ref={starHaloRef}
                className={isSignature ? `ns-star-halo-${uid}` : undefined}
                cx="355"
                cy="148"
                r="64"
                fill={`url(#nsHalo-${uid})`}
                style={{ transformOrigin: '355px 148px' }}
              />
              <g
                ref={starCoreRef}
                className={isSignature ? `ns-star-core-${uid}` : undefined}
                style={{ transformOrigin: '355px 148px' }}
              >
                <path d="M 355 106 C 357 134, 369 146, 397 148 C 369 150, 357 162, 355 190 C 353 162, 341 150, 313 148 C 341 146, 353 134, 355 106 Z" fill="#FFFDF8" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}

export default NorthstarLogo;
