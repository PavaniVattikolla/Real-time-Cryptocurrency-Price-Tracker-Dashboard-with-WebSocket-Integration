/**
 * Unit tests for Zustand crypto store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCryptoStore } from '../store/cryptoStore';

describe('cryptoStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCryptoStore.setState({
      prices: {},
      loading: true,
      error: null,
      selectedCryptoSymbol: null,
      connectionStatus: 'idle',
    });
  });

  describe('addOrUpdatePrice', () => {
    it('adds a new crypto price', () => {
      const { addOrUpdatePrice } = useCryptoStore.getState();
      addOrUpdatePrice({
        symbol: 'BTCUSDT',
        price: 45000,
        change24h: 2.5,
        volume24h: 1_000_000_000,
        high24h: 46000,
        low24h: 44000,
        lastUpdateTimestamp: Date.now(),
      });

      const state = useCryptoStore.getState();
      expect(state.prices['BTCUSDT']).toBeDefined();
      expect(state.prices['BTCUSDT'].price).toBe(45000);
      expect(state.prices['BTCUSDT'].change24h).toBe(2.5);
    });

    it('updates an existing crypto price', () => {
      const { addOrUpdatePrice } = useCryptoStore.getState();
      const timestamp = Date.now();

      addOrUpdatePrice({
        symbol: 'BTCUSDT',
        price: 45000,
        change24h: 2.5,
        volume24h: 1_000_000_000,
        high24h: 46000,
        low24h: 44000,
        lastUpdateTimestamp: timestamp,
      });

      addOrUpdatePrice({
        symbol: 'BTCUSDT',
        price: 46000,
        change24h: 3.0,
        volume24h: 1_100_000_000,
        high24h: 47000,
        low24h: 44000,
        lastUpdateTimestamp: timestamp + 1000,
      });

      const state = useCryptoStore.getState();
      expect(state.prices['BTCUSDT'].price).toBe(46000);
      expect(state.prices['BTCUSDT'].previousPrice).toBe(45000);
    });

    it('tracks previousPrice correctly', () => {
      const { addOrUpdatePrice } = useCryptoStore.getState();

      addOrUpdatePrice({
        symbol: 'ETHUSDT',
        price: 3000,
        change24h: 1.5,
        volume24h: 500_000_000,
        high24h: 3100,
        low24h: 2900,
        lastUpdateTimestamp: Date.now(),
      });

      addOrUpdatePrice({
        symbol: 'ETHUSDT',
        price: 3100,
        change24h: 2.0,
        volume24h: 510_000_000,
        high24h: 3150,
        low24h: 2900,
        lastUpdateTimestamp: Date.now(),
      });

      const state = useCryptoStore.getState();
      expect(state.prices['ETHUSDT'].previousPrice).toBe(3000);
    });

    it('performs immutable updates', () => {
      const { addOrUpdatePrice } = useCryptoStore.getState();
      const stateBefore = useCryptoStore.getState().prices;

      addOrUpdatePrice({
        symbol: 'BTCUSDT',
        price: 45000,
        change24h: 2.5,
        volume24h: 1_000_000_000,
        high24h: 46000,
        low24h: 44000,
        lastUpdateTimestamp: Date.now(),
      });

      const stateAfter = useCryptoStore.getState().prices;
      expect(stateBefore).not.toBe(stateAfter); // Different object references
    });

    it('handles multiple cryptocurrencies independently', () => {
      const { addOrUpdatePrice } = useCryptoStore.getState();

      addOrUpdatePrice({
        symbol: 'BTCUSDT',
        price: 45000,
        change24h: 2.5,
        volume24h: 1_000_000_000,
        high24h: 46000,
        low24h: 44000,
        lastUpdateTimestamp: Date.now(),
      });

      addOrUpdatePrice({
        symbol: 'ETHUSDT',
        price: 3000,
        change24h: -1.5,
        volume24h: 500_000_000,
        high24h: 3100,
        low24h: 2900,
        lastUpdateTimestamp: Date.now(),
      });

      const state = useCryptoStore.getState();
      expect(Object.keys(state.prices)).toHaveLength(2);
      expect(state.prices['BTCUSDT'].price).toBe(45000);
      expect(state.prices['ETHUSDT'].price).toBe(3000);
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      const { setLoading } = useCryptoStore.getState();
      setLoading(false);
      expect(useCryptoStore.getState().loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      const { setError } = useCryptoStore.getState();
      setError('Connection failed');
      expect(useCryptoStore.getState().error).toBe('Connection failed');
    });

    it('clears error with null', () => {
      const { setError } = useCryptoStore.getState();
      setError('Some error');
      setError(null);
      expect(useCryptoStore.getState().error).toBeNull();
    });
  });

  describe('setSelectedCryptoSymbol', () => {
    it('sets selected symbol', () => {
      const { setSelectedCryptoSymbol } = useCryptoStore.getState();
      setSelectedCryptoSymbol('BTCUSDT');
      expect(useCryptoStore.getState().selectedCryptoSymbol).toBe('BTCUSDT');
    });

    it('clears selection with null', () => {
      const { setSelectedCryptoSymbol } = useCryptoStore.getState();
      setSelectedCryptoSymbol('BTCUSDT');
      setSelectedCryptoSymbol(null);
      expect(useCryptoStore.getState().selectedCryptoSymbol).toBeNull();
    });
  });

  describe('setConnectionStatus', () => {
    it('sets connection status', () => {
      const { setConnectionStatus } = useCryptoStore.getState();
      setConnectionStatus('connected');
      expect(useCryptoStore.getState().connectionStatus).toBe('connected');
    });

    it('can set all valid statuses', () => {
      const { setConnectionStatus } = useCryptoStore.getState();
      const statuses = ['connected', 'disconnected', 'error', 'reconnecting', 'idle'] as const;
      
      for (const status of statuses) {
        setConnectionStatus(status);
        expect(useCryptoStore.getState().connectionStatus).toBe(status);
      }
    });
  });

  describe('clearPrices', () => {
    it('clears all price data', () => {
      const { addOrUpdatePrice, clearPrices } = useCryptoStore.getState();
      
      addOrUpdatePrice({
        symbol: 'BTCUSDT',
        price: 45000,
        change24h: 2.5,
        volume24h: 1_000_000_000,
        high24h: 46000,
        low24h: 44000,
        lastUpdateTimestamp: Date.now(),
      });

      expect(Object.keys(useCryptoStore.getState().prices)).toHaveLength(1);
      
      clearPrices();
      expect(useCryptoStore.getState().prices).toEqual({});
    });
  });
});
