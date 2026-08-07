import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import './styles/index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

async function bootstrap() {
  // Development-only mock API, awaited so the adapter is installed before the
  // first request fires. `import.meta.env.DEV` is replaced with `false` at
  // build time, so this branch and the entire `src/mocks/` chunk are dropped
  // from production bundles. Delete both lines once the backend is live.
  if (import.meta.env.DEV) {
    const { installDevApi } = await import('./mocks/devApi');
    installDevApi();
  }

  createRoot(container!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
