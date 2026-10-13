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
      const cleanEmail = email.trim().toLowerCase();
      const parts = cleanEmail.split('@');

      if (parts.length !== 2 || !parts[1].includes('.')) {
        if (isSubscribed) {
          setResolution(null);
          setIsResolving(false);
        }
        return;
      }

      const domain = parts[1];

      // RULE 1: Personal @gmail.com is allowed as Individual account
      if (domain === 'gmail.com') {
        if (isSubscribed) {
          setResolution({
            allowed: true,
            domain: 'gmail.com',
            isGmail: true,
            isUniversity: false,
            isRegistered: true,
          });
          setIsResolving(false);
        }
        return;
      }

      // RULE 2: Non-Gmail personal providers are blocked immediately
      const blockedPersonalProviders = [
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
        'icloud.com',
        'aol.com',
        'protonmail.com',
        'mailinator.com',
        'tempmail.com',
        'yopmail.com',
      ];

      if (blockedPersonalProviders.includes(domain)) {
        if (isSubscribed) {
          setResolution({
            allowed: false,
            domain,
            isGmail: false,
            isUniversity: false,
            isRegistered: false,
            errorMessage: 'Only @gmail.com or admin-registered campus domains are allowed.',
          });
          setIsResolving(false);
        }
        return;
      }

      // RULE 3: University / Campus domain -> Query backend API
      if (isSubscribed) setIsResolving(true);

      try {
        const res = (await authService.resolveDomain(cleanEmail)) as DomainResolution;
        if (!isSubscribed) return;

        if (res.allowed && res.university) {
          setResolution({
            allowed: true,
            domain: res.domain || domain,
            isGmail: false,
            isUniversity: true,
            isRegistered: true,
            universityName: res.university.name,
            university: res.university,
          });
        } else {
          setResolution({
            allowed: false,
            domain,
            isGmail: false,
            isUniversity: true,
            isRegistered: false,
            errorMessage: 'This university domain is not registered by an administrator.',
          });
        }
      } catch {
        if (isSubscribed) {
          setResolution({
            allowed: false,
            domain,
            isGmail: false,
            isUniversity: false,
            isRegistered: false,
            errorMessage: 'Unable to verify domain. Please try again.',
          });
        }
      } finally {
        if (isSubscribed) setIsResolving(false);
      }
    }, 300);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [email]);

  return { resolution, isResolving };
}

export default useDomainResolver;