import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useMatches,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import TanStackQueryProvider from '../integrations/tanstack-query/root-provider'

import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/lib/theme-provider'
import globalCSS from '@/styles/global.scss?url'
import MobileNavigation from '@/components/MobileNavigation'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],

    links: [{ rel: 'stylesheet', href: globalCSS }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const showNavbar = useMatches({
    select: (matches) =>
      !matches.some((m) => m.staticData?.showMobileNavbar === false),
  })
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <TanStackQueryProvider>
          <ThemeProvider>
            <div id="root">
              {showNavbar && <MobileNavigation />}
              {children}
            </div>
          </ThemeProvider>
          {/* <TanStackDevtools
            config={{
              position: 'middle-left',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          /> */}
        </TanStackQueryProvider>

        <Scripts />
      </body>
    </html>
  )
}
