import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { useDomainResolver } from '../../src/features/auth/hooks/useDomainResolver';
import { axiosInstance } from '../../src/lib/api';

describe('useDomainResolver Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('initializes with default idle state when email input is empty', () => {
    const { result } = renderHook(() => useDomainResolver(''));

    expect(result.current.isResolving).toBe(false);
    expect(result.current.resolution).toBeNull();
  });

  it('identifies personal Gmail addresses without network requests', async () => {
    const { result } = renderHook(() =>
      useDomainResolver('student.personal@gmail.com'),
    );

    // Advance fake timer by 500ms and drain microtasks
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.resolution).not.toBeNull();
    expect(result.current.resolution?.isGmail).toBe(true);
    expect(result.current.resolution?.isUniversity).toBe(false);
    expect(result.current.resolution?.allowed).toBe(true);
  });

  it('resolves accredited institutional domains via API response', async () => {
    const mockApiResponse = {
      allowed: true,
      isUniversity: true,
      isGmail: false,
      university: {
        id: 'iiitnr-uuid',
        name: 'International Institute of Information Technology, Naya Raipur',
        shortCode: 'IIITNR',
      },
    };

    // Intercept Axios requests (both get and request) and native fetch calls
    vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: mockApiResponse,
    } as unknown as AxiosResponse);

    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: mockApiResponse,
    } as unknown as AxiosResponse);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const { result } = renderHook(() =>
      useDomainResolver('student@iiitnr.edu.in'),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.resolution).not.toBeNull();
    expect(result.current.resolution?.allowed).toBe(true);
    expect(result.current.resolution?.isUniversity).toBe(true);
    expect(result.current.resolution?.university?.shortCode).toBe('IIITNR');
  });

  it('flags unregistered commercial domains as disallowed', async () => {
    const mockApiResponse = {
      allowed: false,
      isUniversity: false,
      isGmail: false,
      error: 'DOMAIN_UNREGISTERED',
    };

    // Intercept Axios requests (both get and request) and native fetch calls
    vi.spyOn(axiosInstance, 'get').mockResolvedValue({
      data: mockApiResponse,
    } as unknown as AxiosResponse);

    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      data: mockApiResponse,
    } as unknown as AxiosResponse);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const { result } = renderHook(() =>
      useDomainResolver('intruder@randomcorp.com'),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.resolution).not.toBeNull();
    expect(result.current.resolution?.allowed).toBe(false);
  });
});