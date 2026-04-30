import ModerationMenu, {
  ModerationMenuSkeleton,
} from '@/components/ModerationMenu'
import { moderationMenuSchema } from '@/schemas/moderation'
import { teamsQueries } from '@/services/queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/moderation/')({
  validateSearch: moderationMenuSchema,
  component: RouteComponent,
  loaderDeps: ({ search: { type, page } }) => ({
    search: {
      type,
      page,
    },
  }),
  loader: async ({ context, deps: { search } }) => {
    if (search.type === 'teams') {
      const page = search.page || 1
      await context.queryClient.ensureQueryData(teamsQueries.pendingTeams(page))
    }
  },
  pendingComponent: () => {
    return <ModerationMenuSkeleton />
  },
})

function RouteComponent() {
  return <ModerationMenu />
}
