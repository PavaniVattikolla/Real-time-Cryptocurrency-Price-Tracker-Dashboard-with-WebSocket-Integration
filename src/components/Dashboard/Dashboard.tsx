/**
 * Dashboard component
 * Main layout container orchestrating all dashboard sections
 */

import React, { memo } from 'react';
import { useCryptoStore } from '../../store/cryptoStore';
import useWebSocket from '../../hooks/useWebSocket';
import Header from '../Header/Header';
import CryptoList from '../CryptoList/CryptoList';
import ChartSection from '../ChartSection/ChartSection';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './Dashboard.css';

const Dashboard = memo(function Dashboard() {
  // Initialize WebSocket connection
  useWebSocket();

  const connectionStatus = useCryptoStore((state) => state.connectionStatus);
  const error = useCryptoStore((state) => state.error);
  const loading = useCryptoStore((state) => state.loading);

  return (
    <div className="dashboard">
      <Header />

      <main className="dashboard__main" id="main-content">
        {/* Global error banner */}
        {error && connectionStatus !== 'connected' && (
          <div
            className="dashboard__error-banner"
            role="alert"
            aria-live="assertive"
          >
            <span className="dashboard__error-icon" aria-hidden="true">⚡</span>
            <span>{error}</span>
          </div>
        )}

        {/* Initial loading state */}
        {loading && connectionStatus === 'idle' && (
          <div
            className="dashboard__initial-loading"
            role="status"
            aria-live="polite"
            aria-label="Loading cryptocurrency data"
          >
            <LoadingSpinner size="large" label="Connecting to live market data..." />
            <p>Connecting to live market data...</p>
          </div>
        )}

        <div className="dashboard__container">
          {/* Crypto prices section */}
          <ErrorBoundary>
            <CryptoList />
          </ErrorBoundary>

          {/* Historical chart section */}
          <ErrorBoundary>
            <ChartSection />
          </ErrorBoundary>
        </div>
      </main>

      <footer className="dashboard__footer" role="contentinfo">
        <p>
          Data provided by{' '}
          <a
            href="https://www.binance.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Binance WebSocket API (opens in new tab)"
          >
            Binance WebSocket
          </a>{' '}
          &amp;{' '}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CoinGecko API (opens in new tab)"
          >
            CoinGecko API
          </a>
        </p>
        <p className="dashboard__footer-disclaimer">
          For informational purposes only. Not financial advice.
        </p>
      </footer>
    </div>
  );
});

export default Dashboard;
