import CreateWorkForm from '@/components/CreateWorkForm'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/work/create/')({
  beforeLoad: async ({ context, location }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateWorkForm />
}
