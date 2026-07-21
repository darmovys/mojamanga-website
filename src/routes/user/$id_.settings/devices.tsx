import DevicesSection from '@/components/UserSettings/DevicesSection'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/$id_/settings/devices')({
  component: DevicesSection,
})
