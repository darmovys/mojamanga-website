import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'url'
import contentCollections from '@content-collections/vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react-swc'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    contentCollections(),
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    allowedHosts: ['.run.pinggy-free.link'],
  },
  optimizeDeps: {
    include: ['@tanstack/react-form-start'], // solves use-sync-external-store error with tanstack form
  },
})

export default config
