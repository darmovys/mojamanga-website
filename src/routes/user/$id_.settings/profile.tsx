import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/$id_/settings/profile"!</div>
}
