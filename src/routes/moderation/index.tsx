import ModerationMenu from '@/components/ModerationMenu'
import { moderationMenuSchema } from '@/schemas/moderation'
import { authQueries, teamsQueries } from '@/services/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/moderation/')({
  validateSearch: moderationMenuSchema,
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }
  },
  loaderDeps: ({ search: { type, page } }) => ({
    search: {
      type,
      page,
    },
  }),
  loader: async ({ context, deps: { search } }) => {
    if (search.type === 'teams') {
      const page = search.page || 1
      context.queryClient.prefetchQuery(teamsQueries.pendingTeams(page))
    }
  },
})

function RouteComponent() {
  const { data: authState } = useSuspenseQuery(authQueries.user())

  /* 
  TypeScript не знає, що beforeLoad звужує тип authState, 
  тому щоб не писати опційний оператор, прописуємо просту логіку 
  */
  if (!authState.isAuthenticated) return null
  if (authState.user.role !== 'ADMIN' && authState.user.role !== 'MODERATOR') {
    return <div>У вас недостатньо прав для взаємодії з цією сторінкою</div>
  }
  return <ModerationMenu />
}
