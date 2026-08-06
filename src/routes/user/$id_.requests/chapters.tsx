import { ChaptersRequests } from '@/components/UserRequests/ChaptersRequests'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/requests/chapters')({
  component: ChaptersRequests,
})
