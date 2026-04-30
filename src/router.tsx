import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

import { QueryClient } from '@tanstack/react-query'
import DefaultErrorComponent from './components/DefaultErrorComponent'

export const getRouter = () => {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,

    context: { queryClient },

    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,

    defaultErrorComponent: ({ error, reset }) => (
      <DefaultErrorComponent error={error} reset={reset} />
    ),
  })
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
  interface StaticDataRouteOption {
    showStandardHeader?: boolean
    showGlobalSearchSection?: boolean
  }
}
