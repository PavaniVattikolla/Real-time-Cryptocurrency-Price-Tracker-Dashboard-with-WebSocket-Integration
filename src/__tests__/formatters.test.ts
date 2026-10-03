/**
 * Unit tests for formatter utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatPercentage,
  formatVolume,
  calculateBackoffDelay,
  getShortSymbol,
  debounce,
  throttle,
} from '../utils/formatters';

describe('formatPrice', () => {
  it('formats prices >= 1000 with 2 decimal places', () => {
    expect(formatPrice(45000)).toBe('$45,000.00');
    expect(formatPrice(1234.56)).toBe('$1,234.56');
  });

  it('formats prices between 1 and 999 with up to 4 decimal places', () => {
    expect(formatPrice(1.5)).toBe('$1.50');
    expect(formatPrice(99.99)).toBe('$99.99');
  });

  it('formats prices less than 1 with up to 6 decimal places', () => {
    const result = formatPrice(0.00001234);
    expect(result).toContain('$');
    expect(result).toContain('0.00001234');
  });

  it('handles zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('$');
    expect(result).toContain('0');
  });
});

describe('formatPercentage', () => {
  it('formats positive values with + sign', () => {
    expect(formatPercentage(5.25)).toBe('+5.25%');
    expect(formatPercentage(0.1)).toBe('+0.10%');
  });

  it('formats negative values with - sign', () => {
    expect(formatPercentage(-3.5)).toBe('-3.50%');
  });

  it('formats zero correctly', () => {
    expect(formatPercentage(0)).toBe('+0.00%');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatPercentage(1.2345)).toBe('+1.23%');
  });
});

describe('formatVolume', () => {
  it('formats billions', () => {
    expect(formatVolume(1_500_000_000)).toBe('$1.50B');
  });

  it('formats millions', () => {
    expect(formatVolume(2_500_000)).toBe('$2.50M');
  });

  it('formats thousands', () => {
    expect(formatVolume(5_000)).toBe('$5.00K');
  });

  it('formats small values', () => {
    expect(formatVolume(500)).toBe('$500.00');
  });
});

describe('calculateBackoffDelay', () => {
  it('increases delay with each attempt', () => {
    const delay0 = calculateBackoffDelay(0, 1000, 30000);
    const delay1 = calculateBackoffDelay(1, 1000, 30000);
    const delay2 = calculateBackoffDelay(2, 1000, 30000);
    // With jitter, we can't do exact comparisons, but base delays should increase
    expect(delay1).toBeGreaterThan(delay0);
    expect(delay2).toBeGreaterThan(delay1);
  });

  it('does not exceed maxDelay', () => {
    const maxDelay = 5000;
    for (let i = 0; i < 20; i++) {
      const delay = calculateBackoffDelay(i, 1000, maxDelay);
      expect(delay).toBeLessThanOrEqual(maxDelay + 1000); // +1000 for jitter
    }
  });

  it('returns positive values', () => {
    for (let i = 0; i < 5; i++) {
      expect(calculateBackoffDelay(i)).toBeGreaterThan(0);
    }
  });
});

describe('getShortSymbol', () => {
  it('removes USDT suffix', () => {
    expect(getShortSymbol('BTCUSDT')).toBe('BTC');
    expect(getShortSymbol('ETHUSDT')).toBe('ETH');
    expect(getShortSymbol('SOLUSDT')).toBe('SOL');
  });

  it('returns original if no USDT', () => {
    expect(getShortSymbol('BTC')).toBe('BTC');
  });
});

describe('debounce', () => {
  it('delays execution', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    expect(callCount).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(callCount).toBe(1);
  });
});

describe('throttle', () => {
  it('limits execution frequency', async () => {
    let callCount = 0;
    const fn = () => { callCount++; };
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    expect(callCount).toBe(1); // Only first call executes immediately
  });
});
