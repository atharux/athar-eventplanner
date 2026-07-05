import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Tailwind CSS file

/* All three views are lazy so the dark CRM's theme.css never loads into the
   RT-light client/provider chunks (and vice versa). */
const App = React.lazy(() => import('./App'));
const PlanEvent = React.lazy(() => import('./planEvent'));
const Backstage = React.lazy(() => import('./backstage'));

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
              Reload RT Network
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function useHashRoute() {
  const [hash, setHash] = React.useState(() => window.location.hash);
  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return hash;
}

function Root() {
  const hash = useHashRoute();
  const backstage = hash.match(/^#backstage\/([A-Za-z0-9_-]{8,64})$/);
  let view = <App />;
  if (hash === '#plan' || hash.startsWith('#plan/')) view = <PlanEvent />;
  else if (backstage) view = <Backstage token={backstage[1]} key={backstage[1]} />;
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#ffffff' }} />}>
      {view}
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);
