import { useMediaQuery } from '@/hooks/use-media-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/user/$id_/settings/root')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  // Має збігатися з tablet breakpoint
  const isTabletOrUp = useMediaQuery('(min-width: 40.625rem)')

  useEffect(() => {
    if (isTabletOrUp) {
      navigate({
        to: '/user/$id/settings/profile',
        params: { id },
        replace: true, // replace, щоб не засмічувати історію переходів назад
      })
    }
  }, [isTabletOrUp, navigate, id])

  return null
}
