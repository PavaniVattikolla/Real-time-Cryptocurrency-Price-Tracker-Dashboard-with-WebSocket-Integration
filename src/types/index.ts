// Core data types for the cryptocurrency dashboard

export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdateTimestamp: number;
  previousPrice?: number;
}

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
}

export interface MarketChartResponse {
  prices: [number, number][];
  market_caps?: [number, number][];
  total_volumes?: [number, number][];
}

export type TimeRange = '1H' | '24H' | '7D' | '30D';

export interface TimeRangeOption {
  label: string;
  value: TimeRange;
  days: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface WebSocketMessage {
  e: string;    // Event type
  s: string;    // Symbol
  c: string;    // Current/Close price
  o?: string;   // Open price
  P?: string;   // Price change percent
  v: string;    // Base volume
  h: string;    // High price
  l: string;    // Low price
  q: string;    // Quote volume
}


export interface MiniTickerMessage {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export type PriceDirection = 'up' | 'down' | 'neutral';

export interface TrackedCrypto {
  symbol: string;       // e.g. BTCUSDT
  name: string;         // e.g. Bitcoin
  coinId: string;       // CoinGecko ID, e.g. bitcoin
  icon?: string;
}

export const TRACKED_CRYPTOS: TrackedCrypto[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', coinId: 'bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum', coinId: 'ethereum' },
  { symbol: 'SOLUSDT', name: 'Solana', coinId: 'solana' },
  { symbol: 'ADAUSDT', name: 'Cardano', coinId: 'cardano' },
  { symbol: 'XRPUSDT', name: 'XRP', coinId: 'ripple' },
  { symbol: 'DOTUSDT', name: 'Polkadot', coinId: 'polkadot' },
  { symbol: 'BNBUSDT', name: 'BNB', coinId: 'binancecoin' },
];

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: '1H', value: '1H', days: 1 },
  { label: '24H', value: '24H', days: 1 },
  { label: '7D', value: '7D', days: 7 },
  { label: '30D', value: '30D', days: 30 },
];
