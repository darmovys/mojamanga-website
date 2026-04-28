import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/moderation/team-review/$teamId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { teamId } = Route.useParams()
  return <div>Hello {teamId}!</div>
}
