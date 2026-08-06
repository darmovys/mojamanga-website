import NavigationLayout from '@/components/UserRequests'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/requests')({
  beforeLoad: async ({ params: { id }, context, location }) => {
    const authState = context.authState
    if (!authState.isAuthenticated || authState.user.id !== id) {
      throw redirect({
        to: '/forbidden',
        search: { redirect: location.href },
      })
    }
  },
  component: NavigationLayout,
})
