/**
 * Unit tests for WebSocketService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import WebSocketService from '../services/WebSocketService';

// Mock WebSocket
class MockWebSocket {
  url: string;
  readyState: number = 0; // CONNECTING
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  constructor(url: string) {
    this.url = url;
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: code ?? 1000, reason }));
    }
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  simulateMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }

  simulateClose(code = 1000, reason = '') {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  }
}

let mockWsInstance: MockWebSocket | null = null;

vi.stubGlobal('WebSocket', class extends MockWebSocket {
  constructor(url: string) {
    super(url);
    mockWsInstance = this;
  }
});

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    mockWsInstance = null;
    service = new WebSocketService('wss://test.example.com/ws');
    vi.useFakeTimers();
  });

  afterEach(() => {
    service.disconnect();
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  describe('connect', () => {
    it('creates a WebSocket connection', () => {
      service.connect();
      expect(mockWsInstance).not.toBeNull();
      expect(mockWsInstance!.url).toBe('wss://test.example.com/ws');
    });

    it('does not create duplicate connections', () => {
      service.connect();
      const first = mockWsInstance;
      service.connect();
      expect(mockWsInstance).toBe(first);
    });
  });

  describe('message handling', () => {
    it('calls message callbacks when receiving miniTicker messages', () => {
      const callback = vi.fn();
      service.subscribeToMessages(callback);
      service.connect();
      mockWsInstance?.simulateOpen();

      const messages = [
        { e: '24hrMiniTicker', s: 'BTCUSDT', c: '45000.00', P: '2.50', q: '1000000', h: '46000', l: '44000' },
        { e: '24hrMiniTicker', s: 'ETHUSDT', c: '3000.00', P: '-1.50', q: '500000', h: '3100', l: '2900' },
      ];

      mockWsInstance?.simulateMessage(messages);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        symbol: 'BTCUSDT',
        price: 45000,
        change24h: 2.5,
      }));
    });

    it('ignores non-miniTicker messages', () => {
      const callback = vi.fn();
      service.subscribeToMessages(callback);
      service.connect();
      mockWsInstance?.simulateOpen();

      mockWsInstance?.simulateMessage([
        { e: 'trade', s: 'BTCUSDT', p: '45000' }, // Wrong event type
      ]);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('status callbacks', () => {
    it('notifies connected status on open', () => {
      const callback = vi.fn();
      service.subscribeToStatus(callback);
      service.connect();
      mockWsInstance?.simulateOpen();

      expect(callback).toHaveBeenCalledWith('connected');
    });

    it('notifies disconnected status on close', () => {
      const callback = vi.fn();
      service.subscribeToStatus(callback);
      service.connect();
      mockWsInstance?.simulateOpen();

      // Manually close to prevent reconnect attempts
      service.disconnect();

      expect(callback).toHaveBeenCalledWith('disconnected');
    });
  });

  describe('unsubscribe', () => {
    it('removes message callback on unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = service.subscribeToMessages(callback);
      service.connect();
      mockWsInstance?.simulateOpen();

      unsubscribe();

      mockWsInstance?.simulateMessage([
        { e: '24hrMiniTicker', s: 'BTCUSDT', c: '45000', P: '2.5', q: '1000', h: '46000', l: '44000' },
      ]);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('cleans up WebSocket connection', () => {
      service.connect();
      mockWsInstance?.simulateOpen();

      const closeSpy = vi.spyOn(mockWsInstance!, 'close');
      service.disconnect();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('returns connected status correctly', () => {
      service.connect();
      expect(service.getIsConnected()).toBe(false); // Not yet open
      
      mockWsInstance?.simulateOpen();
      expect(service.getIsConnected()).toBe(true);
      
      service.disconnect();
      expect(service.getIsConnected()).toBe(false);
    });
  });
});
