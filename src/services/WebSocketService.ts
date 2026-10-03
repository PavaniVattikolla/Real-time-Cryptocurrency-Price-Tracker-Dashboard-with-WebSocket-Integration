/**
 * WebSocket Service
 * Manages real-time WebSocket connections to Binance streaming API
 * with automatic reconnection and exponential backoff
 */

import type { MiniTickerMessage, WebSocketMessage } from '../types';
import { calculateBackoffDelay } from '../utils/formatters';

type MessageCallback = (data: MiniTickerMessage) => void;
type StatusCallback = (status: 'connected' | 'disconnected' | 'error' | 'reconnecting') => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private isConnected: boolean = false;
  private isManuallyClosed: boolean = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private messageCallbacks: Set<MessageCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Establish a WebSocket connection
   */
  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isManuallyClosed = false;
    this.createConnection();
  }

  private createConnection(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('[WebSocketService] Failed to create connection:', error);
      this.notifyStatus('error');
      this.attemptReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WebSocketService] Connected to WebSocket');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyStatus('connected');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const rawData = JSON.parse(event.data) as WebSocketMessage[];
        
        // Binance !miniTicker@arr returns an array of tickers
        if (Array.isArray(rawData)) {
          rawData.forEach((msg) => {
            const parsed = this.parseMessage(msg);
            if (parsed) {
              this.messageCallbacks.forEach((cb) => cb(parsed));
            }
          });
        }
      } catch (error) {
        console.error('[WebSocketService] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error('[WebSocketService] WebSocket error:', error);
      this.notifyStatus('error');
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log(`[WebSocketService] Connection closed (code: ${event.code}, reason: ${event.reason})`);
      this.isConnected = false;
      this.notifyStatus('disconnected');

      if (!this.isManuallyClosed) {
        this.attemptReconnect();
      }
    };
  }

  private parseMessage(msg: WebSocketMessage): MiniTickerMessage | null {
    try {
      if (msg.e !== '24hrMiniTicker') return null;

      const price = parseFloat(msg.c);
      const open = msg.o ? parseFloat(msg.o) : 0;

      let change24h = 0;
      if (msg.P !== undefined && !isNaN(parseFloat(msg.P))) {
        change24h = parseFloat(msg.P);
      } else if (open > 0) {
        change24h = ((price - open) / open) * 100;
      }

      return {
        symbol: msg.s,
        price,
        change24h: isNaN(change24h) ? 0 : change24h,
        volume24h: parseFloat(msg.q),
        high24h: parseFloat(msg.h),
        low24h: parseFloat(msg.l),
      };
    } catch {
      return null;
    }
  }


  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketService] Max reconnection attempts reached');
      return;
    }

    const delay = calculateBackoffDelay(this.reconnectAttempts);
    this.reconnectAttempts++;
    
    console.log(`[WebSocketService] Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    this.notifyStatus('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, delay);
  }

  /**
   * Disconnect the WebSocket connection
   */
  public disconnect(): void {
    this.isManuallyClosed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.isConnected = false;
  }

  /**
   * Subscribe to incoming messages
   * Returns an unsubscribe function
   */
  public subscribeToMessages(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to connection status updates
   * Returns an unsubscribe function
   */
  public subscribeToStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  private notifyStatus(status: 'connected' | 'disconnected' | 'error' | 'reconnecting'): void {
    this.statusCallbacks.forEach((cb) => cb(status));
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

// Singleton instance using Binance public WebSocket stream
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://stream.binance.com:9443/ws/!miniTicker@arr';

export const wsService = new WebSocketService(WS_URL);
export default WebSocketService;
