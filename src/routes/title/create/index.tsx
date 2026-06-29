import CreateTitleForm from '@/components/CreateTitleForm'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { allHelperInfos } from 'content-collections'

export const Route = createFileRoute('/title/create/')({
  component: CreateTitleForm,
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
      (entry) => entry._meta.path === 'create-title',
    )
    if (!helperInfo) throw new Error('Не знайдено файлу "create-title"')
    return helperInfo
  },
})
