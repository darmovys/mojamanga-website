import TeamProfile from '@/components/TeamProfile'
import { teamsQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/team/$id/')({
  loader: async ({ params, context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(teamsQueries.teamProfile(params.id)),
      context.queryClient.ensureQueryData(
        teamsQueries.getTeamTitles(params.id),
      ),
    ])
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'team-roles-info',
    )
    if (!helperInfo) throw new Error('Не знайдено файлу "team-roles-info"')
    return helperInfo
  },
  component: TeamProfile,
})
