/**
 * Zustand store for cryptocurrency price data
 * Manages real-time prices, UI state, and connection status
 */

import { create } from 'zustand';
import type { CryptoPrice } from '../types';

type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'reconnecting' | 'idle';

interface CryptoState {
  // Data
  prices: Record<string, CryptoPrice>;
  
  // UI State
  loading: boolean;
  error: string | null;
  selectedCryptoSymbol: string | null;
  connectionStatus: ConnectionStatus;
  
  // Actions
  addOrUpdatePrice: (priceData: CryptoPrice) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (errorMessage: string | null) => void;
  setSelectedCryptoSymbol: (symbol: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  clearPrices: () => void;
}

export const useCryptoStore = create<CryptoState>((set) => ({
  prices: {},
  loading: true,
  error: null,
  selectedCryptoSymbol: null,
  connectionStatus: 'idle',

  addOrUpdatePrice: (priceData: CryptoPrice) =>
    set((state) => {
      const existing = state.prices[priceData.symbol];
      return {
        prices: {
          ...state.prices,
          [priceData.symbol]: {
            ...priceData,
            previousPrice: existing?.price,
          },
        },
      };
    }),

  setLoading: (isLoading: boolean) => set({ loading: isLoading }),

  setError: (errorMessage: string | null) => set({ error: errorMessage }),

  setSelectedCryptoSymbol: (symbol: string | null) =>
    set({ selectedCryptoSymbol: symbol }),

  setConnectionStatus: (status: ConnectionStatus) =>
    set({ connectionStatus: status }),

  clearPrices: () => set({ prices: {} }),
}));

// Selectors for efficient state access
export const selectPrices = (state: CryptoState) => state.prices;
export const selectSelectedSymbol = (state: CryptoState) => state.selectedCryptoSymbol;
export const selectConnectionStatus = (state: CryptoState) => state.connectionStatus;
export const selectIsLoading = (state: CryptoState) => state.loading;
export const selectError = (state: CryptoState) => state.error;
