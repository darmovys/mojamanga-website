import ModerateTitleAddingRequest, {
  ModerateTitleAddingRequestSkeleton,
} from '@/components/ModerateTitleAddingRequest'
import { titlesQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/moderation/title-review/$titleId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      titlesQueries.getTitleAddingRequest(params.titleId),
    )
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'review-title-adding-request',
    )
    if (!helperInfo)
      throw new Error('Не знайдено файлу "review-title-adding-request"')
    return helperInfo
  },
  pendingComponent: () => {
    return <ModerateTitleAddingRequestSkeleton />
  },
})

function RouteComponent() {
  return <ModerateTitleAddingRequest />
}
