import { useCanGoBack, useRouter } from '@tanstack/react-router'

export function useGoBack() {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  const handleGoBack = () => {
    if (canGoBack) {
      router.history.back()
    } else {
      router.navigate({ to: '/' })
    }
  }

  return {
    handleGoBack,
  }
}
