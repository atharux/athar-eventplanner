import React from "react";
import ReactDOM from "react-dom/client";
import App from './App';
import "./index.css"; // Tailwind CSS file

/* Top-level error boundary — a render error shows a recoverable fallback
   instead of a white screen. */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h1>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Your data is safe in this browser. Reload to continue — if it keeps happening, contact your organizer.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none', background: '#7e22ce', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Reload EventFlow
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
