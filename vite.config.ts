import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { fileURLToPath, URL } from 'url'
import contentCollections from '@content-collections/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    tsconfigPaths: true,
  },
  plugins: [
    contentCollections(),
    devtools(),
    nitro(),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    allowedHosts: ['.run.pinggy-free.link'],
  },
  optimizeDeps: {
    include: ['@tanstack/react-form-start'], // solves use-sync-external-store error with tanstack form
  },
  build: {
    rollupOptions: {
      external: ['sharp'],
    },
  },
})

export default config
