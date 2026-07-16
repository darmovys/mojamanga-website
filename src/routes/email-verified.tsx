import EmailVerified from '@/components/EmailVerified'
import { useVerificationStore } from '@/stores/email-verification-store'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/email-verified')({
  beforeLoad: async ({ context }) => {
    const { isExpired } = useVerificationStore.getState()
    const authstate = context.authState
    if (!authstate.isAuthenticated || isExpired) {
      throw redirect({ to: '/' })
    }
  },
  component: EmailVerified,
})
