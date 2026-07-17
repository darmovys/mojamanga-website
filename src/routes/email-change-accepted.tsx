import EmailChangeAccepted from '@/components/EmailChangeAccepted'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/email-change-accepted')({
  component: EmailChangeAccepted,
})
