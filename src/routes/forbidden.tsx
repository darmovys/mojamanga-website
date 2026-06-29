import Forbidden from '@/components/Forbidden'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forbidden')({
  component: Forbidden,
})
