/**
 * ConnectionStatus component
 * Displays WebSocket connection state with visual indicator
 */

import React, { memo } from 'react';
import './ConnectionStatus.css';

type Status = 'connected' | 'disconnected' | 'error' | 'reconnecting' | 'idle';

interface ConnectionStatusProps {
  status: Status;
}

const STATUS_CONFIG: Record<
  Status,
  { label: string; className: string; icon: string }
> = {
  connected: { label: 'Connected', className: 'connected', icon: '●' },
  disconnected: { label: 'Disconnected', className: 'disconnected', icon: '●' },
  error: { label: 'Connection Error', className: 'error', icon: '●' },
  reconnecting: { label: 'Reconnecting...', className: 'reconnecting', icon: '○' },
  idle: { label: 'Connecting...', className: 'idle', icon: '○' },
};

const ConnectionStatus = memo(function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`connection-status connection-status--${config.className}`}
      role="status"
      aria-live="polite"
      aria-label={`WebSocket status: ${config.label}`}
      title={`WebSocket: ${config.label}`}
    >
      <span className="connection-status__dot" aria-hidden="true">
        {config.icon}
      </span>
      <span className="connection-status__label">{config.label}</span>
    </div>
  );
});

export default ConnectionStatus;
