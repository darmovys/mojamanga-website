import LoginComponent from '@/components/LoginComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/login/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LoginComponent />
}
