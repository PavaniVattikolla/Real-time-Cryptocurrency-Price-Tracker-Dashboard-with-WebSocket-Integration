# Real-time Cryptocurrency Price Tracker Dashboard

A high-performance, real-time cryptocurrency price dashboard built with React, TypeScript, WebSockets, and Chart.js.

## 🚀 Features

- **Real-time WebSocket updates** via Binance streaming API with automatic reconnection (exponential backoff)
- **Historical price charts** using Chart.js with 1H, 24H, 7D, and 30D time ranges
- **Live market data** for 7 major cryptocurrencies (BTC, ETH, SOL, ADA, XRP, DOT, BNB)
- **Client-side caching** for historical data (5-minute TTL) with request deduplication
- **Price change animations** (green flash for up, red flash for down)
- **Fully responsive** layout (mobile 375px+, tablet 768px+, desktop 1440px+)
- **WCAG 2.1 AA accessibility** with ARIA live regions, keyboard navigation, semantic HTML
- **Zustand** for reactive global state management
- **Docker** multi-stage containerization

## 🏗️ Architecture

```
src/
├── components/          # UI components
│   ├── CryptoCard/      # Individual crypto price card
│   ├── CryptoList/      # Grid of crypto cards
│   ├── HistoricalChart/ # Chart.js line chart
│   ├── ChartSection/    # Chart container with state
│   ├── Header/          # App header
│   ├── ConnectionStatus/ # WebSocket status indicator
│   ├── LoadingSpinner/  # Accessible loading indicator
│   ├── ErrorBoundary/   # React error boundary
│   └── Dashboard/       # Main layout
├── services/            # API and WebSocket logic
│   ├── WebSocketService.ts  # WS client with reconnect
│   └── CryptoApiService.ts  # REST API with caching
├── store/               # Zustand state management
│   └── cryptoStore.ts
├── hooks/               # Custom React hooks
│   ├── useWebSocket.ts
│   └── useHistoricalData.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── formatters.ts
├── styles/              # Global CSS
│   └── global.css
└── __tests__/           # Test suites
    ├── formatters.test.ts
    ├── cryptoStore.test.ts
    ├── WebSocketService.test.ts
    ├── CryptoApiService.test.ts
    └── CryptoCard.test.tsx
```

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Zustand | State management |
| Chart.js + react-chartjs-2 | Data visualization |
| date-fns | Date formatting |
| Vitest + React Testing Library | Testing |
| Docker + Nginx | Containerization |

## 📦 Installation & Development

### Prerequisites
- Node.js 18+
- npm 9+

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Production Build

```bash
npm run build
npm run preview
```

## 🐳 Docker

### Build and Run

```bash
# Build Docker image
docker build -t crypto-dashboard .

# Run container
docker run -p 8080:80 crypto-dashboard

# Open http://localhost:8080
```

### Docker Compose

```bash
docker-compose up --build
```

## 🌐 Environment Variables

Create a `.env` file in the root:

```env
VITE_WS_URL=wss://stream.binance.com:9443/ws/!miniTicker@arr
VITE_REST_API_URL=https://api.coingecko.com/api/v3
```

## ♿ Accessibility

- Semantic HTML5 (`header`, `main`, `nav`, `section`, `article`, `footer`)
- ARIA live regions for real-time price updates (`aria-live="polite"`)
- Full keyboard navigation (Tab, Enter, Space)
- Visible focus indicators (WCAG AA contrast ratio)
- Skip navigation link
- Screen reader announcements for price changes
- Reduced motion support (`prefers-reduced-motion`)

## ⚡ Performance Optimizations

- `React.memo` on all components
- `useCallback` for event handlers
- `useMemo` for chart data and options computation
- Request deduplication in API service
- 5-minute client-side cache for historical data
- Debounced API calls (300ms) for rapid range changes
- Tracked symbol filtering (only update 7 known coins)
- Flash animations via CSS (no JS frame blocking)

## 📊 Data Sources

- **WebSocket**: [Binance Stream API](https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md) (`!miniTicker@arr`)
- **Historical**: [CoinGecko API](https://www.coingecko.com/en/api) (free tier)

## 📄 License

MIT
