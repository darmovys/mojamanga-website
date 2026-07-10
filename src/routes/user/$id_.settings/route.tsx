import SettingsLayout from '@/components/UserSettings'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings')({
  beforeLoad: async ({ params: { id }, context, location }) => {
    const authState = context.authState
    if (!authState.isAuthenticated || authState.user.id !== id) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }
  },
  component: SettingsLayout,
})
