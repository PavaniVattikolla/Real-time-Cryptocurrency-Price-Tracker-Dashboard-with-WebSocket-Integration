/**
 * CryptoApiService
 * Handles REST API calls for historical price data with client-side caching
 * and request deduplication. Supports Binance REST API & CoinGecko API.
 */

import type { HistoricalDataPoint, CacheEntry, MarketChartResponse } from '../types';

const COIN_ID_TO_SYMBOL: Record<string, string> = {
  bitcoin: 'BTCUSDT',
  ethereum: 'ETHUSDT',
  solana: 'SOLUSDT',
  cardano: 'ADAUSDT',
  ripple: 'XRPUSDT',
  polkadot: 'DOTUSDT',
  binancecoin: 'BNBUSDT',
};

class CryptoApiService {
  private baseUrl: string;
  private cache = new Map<string, CacheEntry<HistoricalDataPoint[]>>();
  private cacheDurationMs: number = 5 * 60 * 1000; // 5 minutes
  private pendingRequests = new Map<string, Promise<HistoricalDataPoint[]>>();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getCacheKey(coinId: string, days: number): string {
    return `${coinId}_${days}`;
  }

  private isCacheValid(entry: CacheEntry<HistoricalDataPoint[]>): boolean {
    return Date.now() - entry.timestamp < this.cacheDurationMs;
  }

  /**
   * Fetch historical price data with caching and request deduplication
   */
  public async fetchHistoricalData(
    coinId: string,
    days: number
  ): Promise<HistoricalDataPoint[]> {
    const cacheKey = this.getCacheKey(coinId, days);

    // Return cached data if still valid
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log(`[CryptoApiService] Cache hit for ${cacheKey}`);
      return cached.data;
    }

    // Deduplicate concurrent requests for the same data
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      console.log(`[CryptoApiService] Deduplicating request for ${cacheKey}`);
      return pending;
    }

    const request = this.fetchFromApi(coinId, days);
    this.pendingRequests.set(cacheKey, request);

    try {
      const data = await request;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchFromApi(coinId: string, days: number): Promise<HistoricalDataPoint[]> {
    const isTestOrCustom = !this.baseUrl.includes('coingecko.com') && !this.baseUrl.includes('binance.com');

    // If custom/test URL, fetch directly from test endpoint
    if (isTestOrCustom) {
      return this.fetchFromCoinGecko(this.baseUrl, coinId, days);
    }

    // 1. Try Binance REST API first for 100% reliable free chart data without 401 errors
    const binanceSymbol = COIN_ID_TO_SYMBOL[coinId] || (coinId.toUpperCase().endsWith('USDT') ? coinId.toUpperCase() : null);

    if (binanceSymbol) {
      try {
        return await this.fetchFromBinance(binanceSymbol, days);
      } catch (err) {
        console.warn('[CryptoApiService] Binance API failed, trying CoinGecko fallback:', err);
      }
    }

    // 2. Fallback to CoinGecko
    return this.fetchFromCoinGecko(this.baseUrl, coinId, days);
  }

  private async fetchFromBinance(symbol: string, days: number): Promise<HistoricalDataPoint[]> {
    let interval = '1h';
    let limit = 24;

    if (days <= 1) {
      interval = '1h';
      limit = 24;
    } else if (days <= 7) {
      interval = '4h';
      limit = 42;
    } else {
      interval = '1d';
      limit = Math.min(days, 100);
    }

    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    console.log(`[CryptoApiService] Fetching from Binance API: ${binanceUrl}`);

    const res = await fetch(binanceUrl);
    if (!res.ok) {
      throw new Error(`Binance API error: ${res.status}`);
    }

    const klines = await res.json();
    if (!Array.isArray(klines)) {
      throw new Error('Invalid Binance klines response');
    }

    return klines.map((k: (number | string)[]) => ({
      timestamp: Number(k[0]),
      price: parseFloat(String(k[4])),
    }));
  }

  private async fetchFromCoinGecko(baseUrl: string, coinId: string, days: number): Promise<HistoricalDataPoint[]> {
    const interval = days <= 1 ? 'minutely' : 'daily';
    const url = `${baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;

    console.log(`[CryptoApiService] Fetching from CoinGecko API: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 404) {
        throw new Error(`Data not found for ${coinId}.`);
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data: MarketChartResponse = await response.json();

    if (!data.prices || !Array.isArray(data.prices)) {
      throw new Error('Invalid data format received from API.');
    }

    return data.prices.map(([timestamp, price]) => ({ timestamp, price }));
  }

  /**
   * Clear cache for a specific coin or all cached data
   */
  public clearCache(coinId?: string): void {
    if (coinId) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(coinId)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get current cache size for debugging
   */
  public getCacheSize(): number {
    return this.cache.size;
  }
}

const REST_API_URL = import.meta.env.VITE_REST_API_URL || 'https://api.coingecko.com/api/v3';

export const cryptoApiService = new CryptoApiService(REST_API_URL);
export default CryptoApiService;
