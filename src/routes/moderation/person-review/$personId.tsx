import ModeratePersonAddingRequest, {
  ModeratePersonAddingRequestSkeleton,
} from '@/components/ModeratePersonAddingRequest'
import { peopleQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/moderation/person-review/$personId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(
      peopleQueries.getPersonRequest(params.personId),
    )
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'review-person-adding-request',
    )
    if (!helperInfo)
      throw new Error('Не знайдено файлу "review-person-adding-request"')
    return helperInfo
  },
  pendingComponent: () => {
    return <ModeratePersonAddingRequestSkeleton />
  },
})

function RouteComponent() {
  return <ModeratePersonAddingRequest />
}
