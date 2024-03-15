import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { vercelPreset } from '@vercel/remix/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  ssr: {
    noExternal: [/^@nivo\/.*/, /^@react-spring\/.*/, /^.*prisma.*/, /^@neondatabase\/.*/],
  },
  plugins: [
    remix({
      serverModuleFormat: 'esm',
      ignoredRouteFiles: ['**/.*'],
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
});
