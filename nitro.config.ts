import { defineConfig } from 'nitro'

export default defineConfig({
  rollupConfig: {
    external: [/^@sentry\//],
  },
})
