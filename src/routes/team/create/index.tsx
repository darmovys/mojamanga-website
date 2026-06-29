import { createFileRoute, redirect } from '@tanstack/react-router'
import CreateTeamForm from '@/components/CreateTeamForm'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/team/create/')({
  component: CreateTeamForm,
  beforeLoad: async ({ context, location }) => {
    if (!context.authState.isAuthenticated) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }
  },
  loader: () => {
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'create-team',
    )
    if (!helperInfo) throw new Error('Не знайдено файлу "create-team"')
    return helperInfo
  },
})
