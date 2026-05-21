import ModerateTeamCreationRequest from '@/components/ModerateTeamCreationRequest'
import { teamsQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/moderation/team-review/$teamId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      teamsQueries.getTeamRequest(params.teamId),
    )
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'review-team-creation-request',
    )
    if (!helperInfo)
      throw new Error('Не знайдено файлу "review-team-creation-request"')
    return helperInfo
  },
  pendingComponent: () => {
    return <div>Завантажуємо дані команди... Ось ось зараз буде</div>
  },
})

function RouteComponent() {
  return <ModerateTeamCreationRequest />
}
