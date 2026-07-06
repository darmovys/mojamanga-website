import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/bookmarks')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Закладки користувача</div>
}
