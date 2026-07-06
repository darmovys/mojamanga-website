import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id/')({
  beforeLoad: ({ params: { id } }) => {
    throw redirect({
      to: '/user/$id/bookmarks',
      params: { id },
    })
  },
})
