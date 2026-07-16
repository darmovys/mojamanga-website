import VerifyEmail from '@/components/VerifyEmail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmail,
})
