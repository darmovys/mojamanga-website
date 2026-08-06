import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/requests/')({
  beforeLoad: async ({ params: { id } }) => {
    throw redirect({
      to: '/user/$id/requests/teams',
      params: { id },
      search: { status: 'pending' },
    })
  },
})
