/**
 * useHistoricalData hook
 * Fetches and manages historical price data with caching and debouncing
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { cryptoApiService } from '../services/CryptoApiService';
import type { HistoricalDataPoint, TimeRange } from '../types';
import { TRACKED_CRYPTOS } from '../types';
import { debounce } from '../utils/formatters';

interface UseHistoricalDataReturn {
  data: HistoricalDataPoint[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1H': 1,
  '24H': 1,
  '7D': 7,
  '30D': 30,
};

export function useHistoricalData(
  symbol: string | null,
  timeRange: TimeRange
): UseHistoricalDataReturn {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const coinId = symbol
    ? TRACKED_CRYPTOS.find((c) => c.symbol === symbol)?.coinId ?? null
    : null;

  const fetchData = useCallback(async () => {
    if (!coinId) {
      setData([]);
      setLoading(false);
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const days = TIME_RANGE_DAYS[timeRange];
      const result = await cryptoApiService.fetchHistoricalData(coinId, days);

      // For 1H range, only return last 60 data points
      const filteredData =
        timeRange === '1H' ? result.slice(-60) : result;

      setData(filteredData);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      const message = err instanceof Error ? err.message : 'Failed to fetch historical data';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [coinId, timeRange]);

  // Debounced fetch to prevent rapid API calls
  const debouncedFetch = useRef(debounce(fetchData, 300));

  useEffect(() => {
    debouncedFetch.current = debounce(fetchData, 300);
  }, [fetchData]);

  useEffect(() => {
    debouncedFetch.current();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [coinId, timeRange]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

export default useHistoricalData;
