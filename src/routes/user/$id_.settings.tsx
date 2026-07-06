import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Налаштування користувача</div>
}
