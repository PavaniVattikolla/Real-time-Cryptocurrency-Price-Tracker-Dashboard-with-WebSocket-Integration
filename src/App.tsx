/**
 * App.tsx - Root application component
 */

import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import './styles/global.css';

function App() {
  return (
    <ErrorBoundary>
      {/* Skip to main content for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Dashboard />
    </ErrorBoundary>
  );
}

export default App;
