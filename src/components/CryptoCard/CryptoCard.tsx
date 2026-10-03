/**
 * CryptoCard component
 * Displays individual cryptocurrency price with real-time animation
 */

import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import type { CryptoPrice, TrackedCrypto } from '../../types';
import { formatPrice, formatPercentage, formatVolume, getShortSymbol } from '../../utils/formatters';
import './CryptoCard.css';

interface CryptoCardProps {
  crypto: TrackedCrypto;
  priceData: CryptoPrice | undefined;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
}

const CryptoCard = memo(function CryptoCard({
  crypto,
  priceData,
  isSelected,
  onSelect,
}: CryptoCardProps) {
  const [flashClass, setFlashClass] = useState<'flash-up' | 'flash-down' | ''>('');
  const prevPriceRef = useRef<number | undefined>(undefined);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (priceData?.price === undefined) return;
    
    const currentPrice = priceData.price;
    const prevPrice = prevPriceRef.current;

    if (prevPrice !== undefined && prevPrice !== currentPrice) {
      // Clear any existing flash timer
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
      
      setFlashClass(currentPrice > prevPrice ? 'flash-up' : 'flash-down');
      
      flashTimerRef.current = setTimeout(() => {
        setFlashClass('');
      }, 600);
    }

    prevPriceRef.current = currentPrice;

    return () => {
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    };
  }, [priceData?.price]);

  const handleClick = useCallback(() => {
    onSelect(crypto.symbol);
  }, [crypto.symbol, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(crypto.symbol);
      }
    },
    [crypto.symbol, onSelect]
  );

  const isPositive = (priceData?.change24h ?? 0) >= 0;
  const shortSymbol = getShortSymbol(crypto.symbol);

  return (
    <article
      className={`crypto-card ${isSelected ? 'crypto-card--selected' : ''} ${flashClass}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${crypto.name} (${shortSymbol}). ${
        priceData
          ? `Price: ${formatPrice(priceData.price)}. 24h change: ${formatPercentage(priceData.change24h)}.`
          : 'Loading price data.'
      } Click to view historical chart.`}
    >
      <div className="crypto-card__header">
        <div className="crypto-card__identity">
          <div className="crypto-card__icon" aria-hidden="true">
            {shortSymbol.charAt(0)}
          </div>
          <div className="crypto-card__names">
            <span className="crypto-card__name">{crypto.name}</span>
            <span className="crypto-card__symbol">{shortSymbol}</span>
          </div>
        </div>

        {priceData ? (
          <div
            className={`crypto-card__change ${isPositive ? 'positive' : 'negative'}`}
            aria-label={`24 hour change: ${formatPercentage(priceData.change24h)}`}
          >
            <span className="crypto-card__change-arrow" aria-hidden="true">
              {isPositive ? '▲' : '▼'}
            </span>
            {formatPercentage(priceData.change24h)}
          </div>
        ) : (
          <div className="crypto-card__change skeleton" aria-hidden="true" />
        )}
      </div>

      <div className="crypto-card__price-container">
        {priceData ? (
          <span
            className="crypto-card__price"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Current price: ${formatPrice(priceData.price)}`}
          >
            {formatPrice(priceData.price)}
          </span>
        ) : (
          <span className="crypto-card__price skeleton" aria-label="Loading price" />
        )}
      </div>

      <div className="crypto-card__stats">
        <div className="crypto-card__stat">
          <span className="crypto-card__stat-label">Volume 24h</span>
          <span className="crypto-card__stat-value">
            {priceData ? formatVolume(priceData.volume24h) : '—'}
          </span>
        </div>
        <div className="crypto-card__stat">
          <span className="crypto-card__stat-label">High 24h</span>
          <span className="crypto-card__stat-value">
            {priceData ? formatPrice(priceData.high24h) : '—'}
          </span>
        </div>
        <div className="crypto-card__stat">
          <span className="crypto-card__stat-label">Low 24h</span>
          <span className="crypto-card__stat-value">
            {priceData ? formatPrice(priceData.low24h) : '—'}
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="crypto-card__selected-indicator" aria-hidden="true">
          Chart View Active
        </div>
      )}
    </article>
  );
});

export default CryptoCard;
