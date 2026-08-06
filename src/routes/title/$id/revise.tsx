import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/title/$id/revise')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>TODO</div>
}
