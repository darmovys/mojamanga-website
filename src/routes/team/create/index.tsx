import { createFileRoute } from '@tanstack/react-router'
import CreateTeamForm from '@/components/CreateTeamForm'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/team/create/')({
  component: RouteComponent,
  loader: () => {
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'create-team',
    )
    if (!helperInfo) throw new Error('Не знайдено файлу "create-team"')
    return helperInfo
  },
})

function RouteComponent() {
  return <CreateTeamForm />
}
