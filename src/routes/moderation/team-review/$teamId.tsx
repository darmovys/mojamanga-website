import ModerateTeamCreationRequest, {
  ModerateTeamCreationRequestSkeleton,
} from '@/components/ModerateTeamCreationRequest'
import { teamsQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/moderation/team-review/$teamId')({
  component: ModerateTeamCreationRequest,
  pendingComponent: ModerateTeamCreationRequestSkeleton,
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
})
