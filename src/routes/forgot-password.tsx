import ForgotPassword from '@/components/ForgotPassword'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
})
