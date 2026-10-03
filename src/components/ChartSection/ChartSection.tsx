/**
 * ChartSection component
 * Container that manages historical chart display for selected cryptocurrency
 */

import { memo, useState, useCallback } from 'react';
import { useCryptoStore } from '../../store/cryptoStore';
import { TRACKED_CRYPTOS } from '../../types';
import type { TimeRange } from '../../types';

import useHistoricalData from '../../hooks/useHistoricalData';
import HistoricalChart from '../HistoricalChart/HistoricalChart';
import './ChartSection.css';

const ChartSection = memo(function ChartSection() {
  const selectedSymbol = useCryptoStore((state) => state.selectedCryptoSymbol);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24H');

  const handleRangeChange = useCallback((range: TimeRange) => {
    setSelectedRange(range);
  }, []);

  const selectedCrypto = selectedSymbol
    ? TRACKED_CRYPTOS.find((c) => c.symbol === selectedSymbol)
    : null;

  const { data, loading, error } = useHistoricalData(selectedSymbol, selectedRange);

  if (!selectedSymbol || !selectedCrypto) {
    return (
      <section
        className="chart-section chart-section--empty"
        aria-label="Historical chart section"
      >
        <div className="chart-section__placeholder">
          <div className="chart-section__placeholder-icon" aria-hidden="true">📈</div>
          <h2 className="chart-section__placeholder-title">Select a Cryptocurrency</h2>
          <p className="chart-section__placeholder-text">
            Click on any cryptocurrency card above to view its detailed historical price chart.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="chart-section" aria-label={`Historical chart for ${selectedCrypto.name}`}>
      <HistoricalChart
        cryptoName={selectedCrypto.name}
        symbol={selectedCrypto.symbol}
        data={data}
        loading={loading}
        error={error}
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
      />
    </section>
  );
});

export default ChartSection;
