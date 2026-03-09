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
import Header from '@/components/Header'
import GlobalSearchSection from '@/components/GlobalSearchSection'

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
        title: 'Читати мангу українською · Моя Манга',
      },
    ],

    links: [
      { rel: 'stylesheet', href: globalCSS },
      // { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      // {
      //   rel: 'preconnect',
      //   href: 'https://fonts.gstatic.com',
      //   // crossOrigin: true,
      // },
      // {
      //   rel: 'stylesheet',
      //   href: 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&display=swap',
      // },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const showNavbar = useMatches({
    select: (matches) =>
      !matches.some((m) => m.staticData?.showMobileNavbar === false),
  })
  const showStandardHeader = useMatches({
    select: (matches) =>
      !matches.some((m) => m.staticData?.showStandardHeader === false),
  })
  const showGlobalSearchSection = useMatches({
    select: (matches) =>
      !matches.some((m) => m.staticData?.showGlobalSearchSection === false),
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
              {showStandardHeader && <Header />}
              {showGlobalSearchSection && <GlobalSearchSection />}
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
