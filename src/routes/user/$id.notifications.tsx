import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Сповіщення користувача</div>
}
