import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/teams')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Команди користувача</div>
}
