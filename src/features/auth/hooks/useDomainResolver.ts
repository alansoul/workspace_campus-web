// src/features/auth/hooks/useDomainResolver.ts
'use client';

import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { DomainResolution } from '../types/auth.types';

export function useDomainResolver(email: string) {
  const [resolution, setResolution] = useState<DomainResolution | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(false);

  useEffect(() => {
    let isSubscribed = true;

    const timer = setTimeout(async () => {
      const parts = email.trim().split('@');

      if (parts.length !== 2 || !parts[1].includes('.')) {
        if (isSubscribed) {
          setResolution(null);
          setIsResolving(false);
        }
        return;
      }

      const domain = parts[1].toLowerCase();
      const personalProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

      if (personalProviders.includes(domain)) {
        if (isSubscribed) {
          setResolution({ isRegistered: false });
          setIsResolving(false);
        }
        return;
      }

      if (isSubscribed) setIsResolving(true);

      try {
        const res = await authService.resolveDomain(email);
        if (isSubscribed) setResolution(res);
      } catch {
        if (isSubscribed) setResolution({ isRegistered: false });
      } finally {
        if (isSubscribed) setIsResolving(false);
      }
    }, 350);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [email]);

  return { resolution, isResolving };
}

export default useDomainResolver;