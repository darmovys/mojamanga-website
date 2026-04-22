import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useMatches,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/lib/theme-provider'
import Header from '@/components/Header'
import GlobalSearchSection from '@/components/GlobalSearchSection'
import globalCSS from '@/styles/global.scss?url'
import AppToasts from '@/components/AppToasts'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { authQueries } from '@/services/queries'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
          lang: 'uk',
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
        { rel: 'stylesheet', href: globalCSS, suppressHydrationWarning: true },
      ],
    }),
    beforeLoad: async ({ context }) => {
      const authState = await context.queryClient.ensureQueryData(
        authQueries.user(),
      )

      return { authState }
    },

    component: RootComponent,
    notFoundComponent: () => {
      return <p>Такої сторінки не існує!</p> // Переробити в майбутньому
    },
  },
)

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const showStandardHeader = useMatches({
    select: (matches) =>
      !matches.some((m) => m.staticData?.showStandardHeader === false),
  })
  const showGlobalSearchSection = useMatches({
    select: (matches) =>
      !matches.some((m) => m.staticData?.showGlobalSearchSection === false),
  })
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <AppToasts />
          <div id="root">
            {showStandardHeader && <Header />}
            {showGlobalSearchSection && (
              <GlobalSearchSection isHiddenOnMobile={true} />
            )}
            {children}
          </div>
        </ThemeProvider>
        {/* <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" /> */}

        <Scripts />
      </body>
    </html>
  )
}
