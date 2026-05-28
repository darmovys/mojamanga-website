import CreatePersonForm from '@/components/CreatePersonForm'
import { createFileRoute } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/people/create/')({
  component: RouteComponent,
  loader: () => {
    const helperInfo = allHelperInfos.find(
      (entry) => entry._meta.path === 'create-person',
    )
    if (!helperInfo) throw new Error('Не знайдено файлу "create-person"')
    return helperInfo
  },
})

function RouteComponent() {
  return <CreatePersonForm />
}
