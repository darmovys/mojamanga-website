import { createFileRoute } from '@tanstack/react-router'
import CreateTeamForm from '@/components/CreateTeamForm'

export const Route = createFileRoute('/team/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateTeamForm />
}
