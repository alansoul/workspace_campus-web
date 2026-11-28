import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config';

describe('Web Security Headers Configuration', () => {
  it('disables X-Powered-By and sets HSTS, CSP, and framing protections', async () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(typeof nextConfig.headers).toBe('function');

    const rules = await nextConfig.headers!();
    const rootRule = rules.find((r) => r.source === '/(.*)');
    expect(rootRule).toBeDefined();

    const headerMap = new Map(
      rootRule!.headers.map((h) => [h.key, h.value]),
    );

    expect(headerMap.get('Strict-Transport-Security')).toContain('max-age=');
    expect(headerMap.get('X-Frame-Options')).toBe('DENY');
    expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');

    const csp = headerMap.get('Content-Security-Policy') || '';
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain('https://challenges.cloudflare.com');
    expect(csp).toContain('https://workspace-campus-api.onrender.com');
  });
});
