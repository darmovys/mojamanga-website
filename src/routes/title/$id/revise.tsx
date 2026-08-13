import TitleForm from '@/components/TitleForm'
import { titlesQueries } from '@/services/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/title/$id/revise')({
  beforeLoad: async ({ context, location }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }
  },
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      titlesQueries.titleEditData(params.id),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data } = useSuspenseQuery(titlesQueries.titleEditData(id))
  return <TitleForm mode="revise" initialData={data} />
}
