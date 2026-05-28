import CreateWorkForm from '@/components/CreateWorkForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/work/create/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateWorkForm />
}
