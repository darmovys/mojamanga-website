import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/')({
  beforeLoad: async ({ params: { id } }) => {
    throw redirect({ to: '/user/$id/settings/root', params: { id } })
  },
})
