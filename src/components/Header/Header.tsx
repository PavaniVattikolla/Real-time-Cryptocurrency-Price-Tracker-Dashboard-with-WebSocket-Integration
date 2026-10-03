/**
 * Header component
 * Application header with title, subtitle, and connection status
 */

import React, { memo } from 'react';
import { useCryptoStore } from '../../store/cryptoStore';
import ConnectionStatus from '../ConnectionStatus/ConnectionStatus';
import './Header.css';

const Header = memo(function Header() {
  const connectionStatus = useCryptoStore((state) => state.connectionStatus);

  return (
    <header className="header" role="banner">
      <div className="header__container">
        <div className="header__brand">
          <div className="header__logo" aria-hidden="true">₿</div>
          <div className="header__text">
            <h1 className="header__title">CryptoTracker</h1>
            <p className="header__subtitle">Real-time Cryptocurrency Dashboard</p>
          </div>
        </div>

        <div className="header__right">
          <ConnectionStatus status={connectionStatus} />
          <div className="header__meta" aria-live="polite" aria-atomic="true">
            <span className="header__live-indicator" aria-label="Live data">
              <span className="header__live-dot" aria-hidden="true" />
              LIVE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
