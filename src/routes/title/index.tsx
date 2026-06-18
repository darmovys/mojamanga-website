import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/title/')({
  beforeLoad: () => {
    throw redirect({ to: '/title/create' })
  },
})
