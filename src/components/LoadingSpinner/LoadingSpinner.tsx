/**
 * LoadingSpinner component
 * Accessible animated loading indicator
 */

import React, { memo } from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

const LoadingSpinner = memo(function LoadingSpinner({
  size = 'medium',
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`loading-spinner loading-spinner--${size}`}
      role="status"
      aria-label={label}
    >
      <div className="loading-spinner__circle" aria-hidden="true" />
      <span className="loading-spinner__sr-text">{label}</span>
    </div>
  );
});

export default LoadingSpinner;
