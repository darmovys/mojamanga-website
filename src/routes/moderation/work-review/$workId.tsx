import ModerateWorkAddingRequest, {
  ModerateWorkAddingRequestSkeleton,
} from '@/components/ModerateWorkAddingRequest'
import { worksQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/moderation/work-review/$workId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      worksQueries.getWorkAddingRequest(params.workId),
    )
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'review-work-adding-request',
    )
    if (!helperInfo)
      throw new Error('Не знайдено файлу "review-work-adding-request"')
    return helperInfo
  },
  pendingComponent: () => {
    return <ModerateWorkAddingRequestSkeleton />
  },
})

function RouteComponent() {
  return <ModerateWorkAddingRequest />
}
