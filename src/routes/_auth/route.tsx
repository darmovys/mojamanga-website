import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
  staticData: {
    showMobileNavbar: false,
    showGlobalSearchSection: false,
    showStandardHeader: false,
  },
})

function RouteComponent() {
  return <Outlet />
}
