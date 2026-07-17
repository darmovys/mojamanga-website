import SecuritySection from '@/components/UserSettings/SecuritySection'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/security')({
  component: SecuritySection,
})
