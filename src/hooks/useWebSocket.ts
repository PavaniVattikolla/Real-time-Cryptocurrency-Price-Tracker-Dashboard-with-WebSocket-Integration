/**
 * useWebSocket hook
 * Manages WebSocket lifecycle and integrates with Zustand store
 */

import { useEffect, useRef, useCallback } from 'react';
import { wsService } from '../services/WebSocketService';
import { useCryptoStore } from '../store/cryptoStore';
import type { MiniTickerMessage } from '../types';
import { TRACKED_CRYPTOS } from '../types';

const TRACKED_SYMBOLS = new Set(TRACKED_CRYPTOS.map((c) => c.symbol));

export function useWebSocket() {
  const addOrUpdatePrice = useCryptoStore((state) => state.addOrUpdatePrice);
  const setConnectionStatus = useCryptoStore((state) => state.setConnectionStatus);
  const setLoading = useCryptoStore((state) => state.setLoading);
  const setError = useCryptoStore((state) => state.setError);
  const isInitialized = useRef(false);

  const handleMessage = useCallback(
    (data: MiniTickerMessage) => {
      // Only process tracked cryptocurrencies
      if (!TRACKED_SYMBOLS.has(data.symbol)) return;

      addOrUpdatePrice({
        symbol: data.symbol,
        price: data.price,
        change24h: data.change24h,
        volume24h: data.volume24h,
        high24h: data.high24h,
        low24h: data.low24h,
        lastUpdateTimestamp: Date.now(),
      });

      // Clear loading once we receive first data
      setLoading(false);
    },
    [addOrUpdatePrice, setLoading]
  );

  const handleStatus = useCallback(
    (status: 'connected' | 'disconnected' | 'error' | 'reconnecting') => {
      setConnectionStatus(status);
      
      if (status === 'error') {
        setError('WebSocket connection error. Attempting to reconnect...');
      } else if (status === 'connected') {
        setError(null);
      } else if (status === 'reconnecting') {
        setError('Connection lost. Reconnecting...');
      }
    },
    [setConnectionStatus, setError]
  );

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Subscribe to messages and status updates
    const unsubscribeMessages = wsService.subscribeToMessages(handleMessage);
    const unsubscribeStatus = wsService.subscribeToStatus(handleStatus);

    // Connect to WebSocket
    wsService.connect();

    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
      wsService.disconnect();
      isInitialized.current = false;
    };
  }, [handleMessage, handleStatus]);
}

export default useWebSocket;
