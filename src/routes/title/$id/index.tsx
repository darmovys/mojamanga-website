import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/title/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>TODO</div>
}
