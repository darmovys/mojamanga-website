import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/team/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Hello "/team/{id}"!</div>
}
