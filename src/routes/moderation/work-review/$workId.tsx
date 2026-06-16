import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/moderation/work-review/$workId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>TODO</div>
}
