/**
 * HistoricalChart component
 * Interactive line chart for historical cryptocurrency prices using Chart.js
 */

import React, { memo, useMemo, useRef, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import type { HistoricalDataPoint, TimeRange } from '../../types';
import { TIME_RANGE_OPTIONS } from '../../types';
import { formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import './HistoricalChart.css';


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoricalChartProps {
  cryptoName: string;
  symbol: string;
  data: HistoricalDataPoint[];
  loading: boolean;
  error: string | null;
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

function formatLabel(timestamp: number, range: TimeRange): string {
  const date = new Date(timestamp);
  if (range === '1H' || range === '24H') {
    return format(date, 'HH:mm');
  } else if (range === '7D') {
    return format(date, 'MMM d');
  } else {
    return format(date, 'MMM d');
  }
}

const HistoricalChart = memo(function HistoricalChart({
  cryptoName,
  symbol,
  data,
  loading,
  error,
  selectedRange,
  onRangeChange,
}: HistoricalChartProps) {
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    const labels = data.map((d) => formatLabel(d.timestamp, selectedRange));
    const prices = data.map((d) => d.price);
    
    const isPositive =
      prices.length > 1 ? prices[prices.length - 1] >= prices[0] : true;

    const lineColor = isPositive ? '#48bb78' : '#f56565';
    const fillColor = isPositive ? 'rgba(72, 187, 120, 0.08)' : 'rgba(245, 101, 101, 0.08)';

    return {
      labels,
      datasets: [
        {
          label: `${cryptoName} Price`,
          data: prices,
          borderColor: lineColor,
          backgroundColor: fillColor,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: lineColor,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [data, cryptoName, selectedRange]);

  const chartOptions = useMemo((): ChartOptions<'line'> => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 32, 44, 0.95)',
        titleColor: '#a0aec0',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(99, 179, 237, 0.3)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => ` ${formatPrice(context.parsed.y ?? 0)}`,

          title: (items) => items[0]?.label ?? '',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#718096',
          maxTicksLimit: 8,
          maxRotation: 0,
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#718096',
          font: { size: 11 },
          callback: (value) => formatPrice(Number(value ?? 0)),

        },
        position: 'right',
      },
    },
  }), []);

  const handleRangeKeyDown = useCallback(
    (e: React.KeyboardEvent, range: TimeRange) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRangeChange(range);
      }
    },
    [onRangeChange]
  );

  return (
    <section className="historical-chart" aria-label={`Historical price chart for ${cryptoName}`}>
      <div className="historical-chart__header">
        <div className="historical-chart__title-area">
          <h2 className="historical-chart__title">
            {cryptoName} <span className="historical-chart__symbol">({symbol.replace('USDT', '/USDT')})</span>
          </h2>
          <p className="historical-chart__subtitle">Historical Price Chart</p>
        </div>
        
        <nav
          className="historical-chart__range-controls"
          aria-label="Time range selection"
          role="group"
        >
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`historical-chart__range-btn ${
                selectedRange === option.value ? 'active' : ''
              }`}
              onClick={() => onRangeChange(option.value)}
              onKeyDown={(e) => handleRangeKeyDown(e, option.value)}
              aria-pressed={selectedRange === option.value}
              aria-label={`Show ${option.label} history`}
            >
              {option.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="historical-chart__body">
        {loading && (
          <div className="historical-chart__loading" role="status" aria-live="polite">
            <LoadingSpinner />
            <span>Loading {selectedRange} chart data...</span>
          </div>
        )}

        {!loading && error && (
          <div
            className="historical-chart__error"
            role="alert"
            aria-live="assertive"
          >
            <span className="historical-chart__error-icon" aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div
            className="historical-chart__no-data"
            role="status"
            aria-live="polite"
          >
            <span className="historical-chart__no-data-icon" aria-hidden="true">📊</span>
            <span>No Data Available</span>
            <p>Historical data could not be fetched for this time range.</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div className="historical-chart__canvas-wrapper">
            <Line
              ref={chartRef}
              data={chartData}
              options={chartOptions}
              aria-label={`${cryptoName} price chart for the past ${selectedRange}`}
            />
          </div>
        )}
      </div>
    </section>
  );
});

export default HistoricalChart;
