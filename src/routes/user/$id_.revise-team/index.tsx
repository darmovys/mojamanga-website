import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/revise-team/')({
  beforeLoad: () => {
    throw redirect({
      to: '/',
    })
  },
})
