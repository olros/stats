import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { vercelPreset } from '@vercel/remix/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

installGlobals();

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
      presets: [vercelPreset()],
      future: {
        v3_throwAbortReason: true,
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
});
