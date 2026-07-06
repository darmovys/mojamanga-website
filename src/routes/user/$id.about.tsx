import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Про користувача</div>
}
