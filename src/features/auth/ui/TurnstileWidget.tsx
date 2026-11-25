'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import Script from 'next/script';

type TurnstileWidgetId = string;

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme?: 'light' | 'dark' | 'auto';
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    },
  ) => TurnstileWidgetId;
  reset: (widgetId: TurnstileWidgetId) => void;
  remove?: (widgetId: TurnstileWidgetId) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  action: string;
  resetKey: number;
  onTokenChange: (token: string) => void;
}

const DEFAULT_TURNSTILE_SITE_KEY = '0x4AAAAAAGTDCIAL3M3DwjRM';

export function TurnstileWidget({
  action,
  resetKey,
  onTokenChange,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  const sitekey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || DEFAULT_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current !== null) {
      window.turnstile.remove?.(widgetIdRef.current);
      widgetIdRef.current = null;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey,
      action,
      theme: 'light',
      callback: (token: string) => onTokenChangeRef.current(token),
      'expired-callback': () => onTokenChangeRef.current(''),
      'error-callback': () => onTokenChangeRef.current(''),
    });
  }, [action, sitekey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetIdRef.current !== null && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onTokenChangeRef.current('');
    }
  }, [resetKey]);

  return (
    <div className="flex flex-col items-center justify-center py-1">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
}
