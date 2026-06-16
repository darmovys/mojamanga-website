import ModerationMenu, {
  ModerationMenuSkeleton,
} from '@/components/ModerationMenu'
import {
  moderationMenuSchema,
  ModerationMenuSearch,
} from '@/schemas/moderation'
import { peopleQueries, teamsQueries, worksQueries } from '@/services/queries'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { produce } from 'immer'

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
      const data = await context.queryClient.ensureQueryData(
        teamsQueries.pendingTeams(page),
      )
      if (page > data.totalPages && data.totalPages > 0) {
        throw redirect({
          to: '/moderation',
          search: (prev) =>
            produce(prev as ModerationMenuSearch, (draft) => {
              delete draft.page
            }),
          replace: true,
        })
      }
    } else if (search.type === 'people') {
      const page = search.page || 1
      const data = await context.queryClient.ensureQueryData(
        peopleQueries.pendingPeople(page),
      )
      if (page > data.totalPages && data.totalPages > 0) {
        throw redirect({
          to: '/moderation',
          search: (prev) =>
            produce(prev as ModerationMenuSearch, (draft) => {
              delete draft.page
            }),
          replace: true,
        })
      }
    } else if (search.type === 'works') {
      const page = search.page || 1
      const data = await context.queryClient.ensureQueryData(
        worksQueries.pendingWorks(page),
      )
      if (page > data.totalPages && data.totalPages > 0) {
        throw redirect({
          to: '/moderation',
          search: (prev) =>
            produce(prev as ModerationMenuSearch, (draft) => {
              delete draft.page
            }),
          replace: true,
        })
      }
    }
  },
  pendingComponent: () => {
    return <ModerationMenuSkeleton />
  },
})

function RouteComponent() {
  return <ModerationMenu />
}
