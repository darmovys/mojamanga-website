import { createFileRoute } from '@tanstack/react-router'
import SignupComponent from '@/components/SignupComponent'

export const Route = createFileRoute('/_auth/signup/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignupComponent />
}
