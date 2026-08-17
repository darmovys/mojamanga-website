import { createFileRoute } from '@tanstack/react-router'
import Homepage from '@/components/Homepage'

export const Route = createFileRoute('/')({
  staticData: { showGlobalSearchSection: false },
  component: Homepage,
})
