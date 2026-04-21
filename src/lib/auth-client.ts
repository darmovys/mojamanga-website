import { createAuthClient } from 'better-auth/react'
import {
  inferAdditionalFields,
  usernameClient,
} from 'better-auth/client/plugins'
import type { auth } from './auth'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SITE_URL,
  plugins: [inferAdditionalFields<typeof auth>(), usernameClient()],
})
