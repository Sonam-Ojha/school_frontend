import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * A production build carries every `VITE_` setting inside its JavaScript, for
 * anybody to read. So a build refuses to include the presentation-only
 * sign-in details, and says so when it would talk to a local API.
 */
function checkProductionEnv(mode: string): void {
  if (mode !== 'production') return;
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  if (env.VITE_DEMO_SUPERADMIN_PASSWORD || env.VITE_DEMO_SUPERADMIN_EMAIL) {
    throw new Error(
      'VITE_DEMO_SUPERADMIN_EMAIL / VITE_DEMO_SUPERADMIN_PASSWORD are set for a production build. ' +
        'They would be readable by anyone in the built JavaScript. Keep them in .env.development.local only.',
    );
  }
  if (/\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(env.VITE_API_BASE_URL ?? '')) {
    console.warn(
      '\n⚠  VITE_API_BASE_URL points at localhost. For a server, put the real address in .env.production ' +
        '(see .env.production.example) and build again.\n',
    );
  }
}

export default defineConfig(({ mode }) => {
  checkProductionEnv(mode);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Keep vendor chunks stable so long-lived caches survive app deploys.
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query', 'axios'],
            forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          },
        },
      },
    },
  };
});
