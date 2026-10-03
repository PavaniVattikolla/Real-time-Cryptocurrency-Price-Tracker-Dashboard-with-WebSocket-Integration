/**
 * Integration tests for CryptoCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CryptoCard from '../components/CryptoCard/CryptoCard';
import type { TrackedCrypto, CryptoPrice } from '../types';


const mockCrypto: TrackedCrypto = {
  symbol: 'BTCUSDT',
  name: 'Bitcoin',
  coinId: 'bitcoin',
};

const mockPriceData: CryptoPrice = {
  symbol: 'BTCUSDT',
  price: 45000,
  change24h: 2.5,
  volume24h: 1_500_000_000,
  high24h: 46000,
  low24h: 44000,
  lastUpdateTimestamp: Date.now(),
};

describe('CryptoCard', () => {
  it('renders crypto name and symbol', () => {
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('BTC')).toBeInTheDocument();
  });

  it('renders price correctly', () => {
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('$45,000.00')).toBeInTheDocument();
  });

  it('renders positive change with correct styling', () => {
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    const changeEl = screen.getByText(/\+2.50%/);
    expect(changeEl.closest('.crypto-card__change')).toHaveClass('positive');
  });

  it('renders negative change with correct styling', () => {
    const negativePriceData: CryptoPrice = { ...mockPriceData, change24h: -3.5 };
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={negativePriceData}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    const changeEl = screen.getByText(/-3.50%/);
    expect(changeEl.closest('.crypto-card__change')).toHaveClass('negative');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(onSelect).toHaveBeenCalledWith('BTCUSDT');
  });

  it('calls onSelect when Enter key is pressed', () => {
    const onSelect = vi.fn();
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith('BTCUSDT');
  });

  it('calls onSelect when Space key is pressed', () => {
    const onSelect = vi.fn();
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={onSelect}
      />
    );

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(onSelect).toHaveBeenCalledWith('BTCUSDT');
  });

  it('shows selected state when isSelected is true', () => {
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={true}
        onSelect={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('crypto-card--selected');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows skeleton when no price data', () => {
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={undefined}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    // Should not show a real price
    expect(screen.queryByText('$45,000.00')).not.toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('has aria-live on price element', () => {
    render(
      <CryptoCard
        crypto={mockCrypto}
        priceData={mockPriceData}
        isSelected={false}
        onSelect={vi.fn()}
      />
    );

    const priceEl = screen.getByLabelText(/Current price/i);
    expect(priceEl).toHaveAttribute('aria-live', 'polite');
  });
});
