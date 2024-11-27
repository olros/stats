import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: [/^@nivo\/.*/, /^@react-spring\/.*/, 'react-syntax-highlighter', 'tailwind-merge'],
  },
  plugins: [
    remix({
      serverModuleFormat: 'esm',
      ignoredRouteFiles: ['**/.*'],
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
        unstable_optimizeDeps: true,
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
