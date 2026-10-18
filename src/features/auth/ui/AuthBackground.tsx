'use client';

import React, { type PointerEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import './AuthBackground.css';

type AuthBackgroundProps = {
  children: React.ReactNode;
};

type PointerPosition = { x: number; y: number };

export function AuthBackground({ children }: AuthBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const currentRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const animatePointer = () => {
    const element = rootRef.current;
    if (!element) {
      frameRef.current = null;
      return;
    }

    const current = currentRef.current;
    const target = targetRef.current;
    current.x += (target.x - current.x) * 0.075;
    current.y += (target.y - current.y) * 0.075;

    const x = current.x;
    const y = current.y;
    element.style.setProperty('--pointer-x', `${50 + x * 18}%`);
    element.style.setProperty('--pointer-y', `${40 + y * 16}%`);
    element.style.setProperty('--glow-x', `${x * 12}px`);
    element.style.setProperty('--glow-y', `${y * 10}px`);
    element.style.setProperty('--cloud-far-x', `${x * -10}px`);
    element.style.setProperty('--cloud-far-y', `${y * -7}px`);
    element.style.setProperty('--cloud-near-x', `${x * 16}px`);
    element.style.setProperty('--cloud-near-y', `${y * 12}px`);
    element.style.setProperty('--arc-x', `${x * -5}px`);
    element.style.setProperty('--arc-y', `${y * -4}px`);

    const remaining = Math.abs(target.x - current.x) + Math.abs(target.y - current.y);
    if (remaining > 0.002) {
      frameRef.current = requestAnimationFrame(animatePointer);
    } else {
      currentRef.current = { ...target };
      frameRef.current = null;
    }
  };

  const startAnimation = () => {
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(animatePointer);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const root = rootRef.current;
    if (!root) return;

    const bounds = root.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    targetRef.current = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.4) * 2,
    };
    startAnimation();
  };

  const resetPointer = () => {
    targetRef.current = { x: 0, y: 0 };
    startAnimation();
  };

  return (
    <div ref={rootRef} className="auth-sky" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <div className="auth-sky__glow" aria-hidden="true" />
      <div className="auth-sky__sunlight" aria-hidden="true" />
      <div className="auth-sky__orbit auth-sky__orbit--outer" aria-hidden="true" />
      <div className="auth-sky__orbit auth-sky__orbit--inner" aria-hidden="true" />
      <div className="auth-sky__cloud auth-sky__cloud--left" aria-hidden="true" />
      <div className="auth-sky__cloud auth-sky__cloud--right" aria-hidden="true" />
      <div className="auth-sky__cloud auth-sky__cloud--front" aria-hidden="true" />

      <header className="auth-sky__header">
        <Link href="/" className="auth-sky__brand" aria-label="Northstar Workspace home">
          <span className="auth-sky__brand-icon" aria-hidden="true">✦</span>
          <span className="auth-sky__brand-copy">
            <strong>Northstar Workspace</strong>
            <span>One verified account for all university apps.</span>
          </span>
        </Link>
        <div className="auth-sky__header-action">
          <span>New to Northstar?</span>
          <Link href="/register">Sign up</Link>
        </div>
      </header>

      <main className="auth-sky__content">{children}</main>
    </div>
  );
}

export default AuthBackground;
