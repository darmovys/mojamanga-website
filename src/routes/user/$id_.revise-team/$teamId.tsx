import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/revise-team/$teamId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { teamId } = Route.useParams()

  return <div>ID команди, що підлягає змінам: {teamId}</div>
}
