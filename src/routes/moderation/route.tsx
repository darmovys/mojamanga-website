import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/moderation')({
  component: Outlet,
  beforeLoad: async ({ context, location }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }

    const userRole = context.authState.user.role

    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      throw redirect({
        to: '/forbidden',
      })
    }
  },
})
