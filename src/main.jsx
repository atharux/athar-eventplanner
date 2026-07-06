import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Tailwind CSS file

/* All views are lazy so the dark CRM's theme.css never loads into the
   RT-light client/provider chunks (and vice versa). */
const App = React.lazy(() => import('./App'));
const PlanEvent = React.lazy(() => import('./planEvent'));
const Backstage = React.lazy(() => import('./backstage'));
const QuoteStatus = React.lazy(() => import('./quoteStatus'));
const Impressum = React.lazy(() => import('./legalPages').then(m => ({ default: m.Impressum })));
const Datenschutz = React.lazy(() => import('./legalPages').then(m => ({ default: m.Datenschutz })));
const ClientTerms = React.lazy(() => import('./legalPages').then(m => ({ default: m.ClientTerms })));

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
  const quoteRef = hash.match(/^#quote\/(RT-[A-Za-z0-9-]{6,40})$/);

  // Root is the client-facing landing (RT Network's public face); the
  // operator CRM lives behind #ops so a bare share link never opens the
  // dark ops tool with seed data.
  let view = <PlanEvent />;
  let bg = '#ffffff';
  if (hash === '#ops' || hash.startsWith('#ops/')) { view = <App />; bg = '#0a0a0a'; }
  else if (backstage) view = <Backstage token={backstage[1]} key={backstage[1]} />;
  else if (quoteRef) view = <QuoteStatus ref={quoteRef[1]} key={quoteRef[1]} />;
  else if (hash === '#impressum') view = <Impressum />;
  else if (hash === '#datenschutz') view = <Datenschutz />;
  else if (hash === '#terms') view = <ClientTerms />;

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: bg }} />}>
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
