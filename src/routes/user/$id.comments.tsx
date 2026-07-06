import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/comments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Коментарі користувача</div>
}
