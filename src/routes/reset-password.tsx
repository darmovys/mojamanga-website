import ResetPassword from '@/components/ResetPassword'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  error: z.literal('INVALID_TOKEN').catch('INVALID_TOKEN').optional(),
  token: z.string().optional(),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: resetPasswordSchema,
  loaderDeps: ({ search: { error, token } }) => ({
    search: {
      error,
      token,
    },
  }),
  component: ResetPassword,
})
