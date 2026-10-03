/**
 * Unit tests for CryptoApiService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CryptoApiService from '../services/CryptoApiService';

describe('CryptoApiService', () => {
  let service: CryptoApiService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new CryptoApiService('https://api.test.com/v3');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('fetchHistoricalData', () => {
    const mockResponse = {
      prices: [
        [1696000000000, 45000],
        [1696003600000, 45500],
        [1696007200000, 44800],
      ],
    };

    it('fetches and transforms historical data correctly', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.fetchHistoricalData('bitcoin', 1);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ timestamp: 1696000000000, price: 45000 });
      expect(result[1]).toEqual({ timestamp: 1696003600000, price: 45500 });
    });

    it('caches results and avoids duplicate fetch calls', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await service.fetchHistoricalData('bitcoin', 1);
      await service.fetchHistoricalData('bitcoin', 1);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws error for rate limit response (429)', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      });

      await expect(service.fetchHistoricalData('bitcoin', 1)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });

    it('throws error for not found response (404)', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(service.fetchHistoricalData('nonexistent', 1)).rejects.toThrow(
        'Data not found'
      );
    });

    it('throws error for other API errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.fetchHistoricalData('bitcoin', 1)).rejects.toThrow('API error');
    });

    it('deduplicates concurrent requests for same coin/days', async () => {
      let resolvePromise: ((value: unknown) => void) | null = null;
      fetchMock.mockReturnValueOnce(new Promise((res) => { resolvePromise = res; }));

      const p1 = service.fetchHistoricalData('bitcoin', 7);
      const p2 = service.fetchHistoricalData('bitcoin', 7);

      resolvePromise!({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const [r1, r2] = await Promise.all([p1, p2]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(r1).toEqual(r2);
    });
  });

  describe('clearCache', () => {
    it('clears cache for specific coin', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ prices: [[1696000000000, 45000]] }),
      });

      await service.fetchHistoricalData('bitcoin', 1);
      expect(service.getCacheSize()).toBe(1);

      service.clearCache('bitcoin');
      expect(service.getCacheSize()).toBe(0);
    });

    it('clears all cache when no coin specified', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ prices: [[1696000000000, 45000]] }),
      });

      await service.fetchHistoricalData('bitcoin', 1);
      await service.fetchHistoricalData('bitcoin', 7);

      service.clearCache();
      expect(service.getCacheSize()).toBe(0);
    });
  });
});
