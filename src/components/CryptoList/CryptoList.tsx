/**
 * CryptoList component
 * Renders list of CryptoCards from store data
 */

import React, { memo, useCallback } from 'react';
import { useCryptoStore } from '../../store/cryptoStore';
import { TRACKED_CRYPTOS } from '../../types';
import CryptoCard from '../CryptoCard/CryptoCard';
import './CryptoList.css';

const CryptoList = memo(function CryptoList() {
  const prices = useCryptoStore((state) => state.prices);
  const selectedSymbol = useCryptoStore((state) => state.selectedCryptoSymbol);
  const setSelectedSymbol = useCryptoStore((state) => state.setSelectedCryptoSymbol);

  const handleSelect = useCallback(
    (symbol: string) => {
      setSelectedSymbol(symbol === selectedSymbol ? null : symbol);
    },
    [selectedSymbol, setSelectedSymbol]
  );

  return (
    <section className="crypto-list" aria-label="Cryptocurrency prices">
      <h2 className="crypto-list__title">Live Market Prices</h2>
      <p className="crypto-list__subtitle">
        Click a cryptocurrency to view its historical chart
      </p>
      <div
        className="crypto-list__grid"
        role="list"
        aria-label="Cryptocurrency cards"
      >
        {TRACKED_CRYPTOS.map((crypto) => (
          <div role="listitem" key={crypto.symbol}>
            <CryptoCard
              crypto={crypto}
              priceData={prices[crypto.symbol]}
              isSelected={selectedSymbol === crypto.symbol}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

export default CryptoList;
