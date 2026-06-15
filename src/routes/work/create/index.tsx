import CreateWorkForm from '@/components/CreateWorkForm'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/work/create/')({
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
      (entry) => entry._meta.path === 'create-work',
    )
    if (!helperInfo) throw new Error('Не знайдено файлу "create-work"')
    return helperInfo
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateWorkForm />
}
