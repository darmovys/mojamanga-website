import TeamForm from '@/components/TeamForm'
import { teamsQueries } from '@/services/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/team/$id/edit')({
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
      teamsQueries.teamEditData(params.id),
    )
  },
  component: EditTeamPage,
})

function EditTeamPage() {
  const { id } = Route.useParams()
  const { data: initialData } = useSuspenseQuery(teamsQueries.teamEditData(id))

  return <TeamForm isEditMode={true} initialData={initialData} />
}
