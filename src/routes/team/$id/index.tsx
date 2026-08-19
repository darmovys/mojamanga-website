import TeamProfile from '@/components/TeamProfile'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/team/$id/')({
  component: TeamProfile,
})
