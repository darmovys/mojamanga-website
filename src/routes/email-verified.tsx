import EmailVerified from '@/components/EmailVerified'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/email-verified')({
  beforeLoad: async ({ context }) => {
    const authState = context.authState
    if (!authState.isAuthenticated || !authState.user.emailVerified) {
      throw redirect({ to: '/' })
    }
  },
  component: EmailVerified,
})
