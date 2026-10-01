import { ChaptersRequests } from '@/components/UserRequests/_components'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/requests/chapters')({
  component: ChaptersRequests,
})
