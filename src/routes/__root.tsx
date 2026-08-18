import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useMatches,
} from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { HotkeysDevtoolsPanel } from '@tanstack/react-hotkeys-devtools'
import { FormDevtoolsPanel } from '@tanstack/react-form-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/lib/theme-provider'
import Header from '@/components/Header'
import GlobalSearchSection from '@/components/GlobalSearchSection'
import globalCSS from '@/styles/global.scss?url'
import AppToasts from '@/components/AppToasts'
import { authQueries } from '@/services/queries'
import { api } from '@/lib/api-client'

let lastPingTime = 0
const PING_INTERVAL = 30_000

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

      if (authState.isAuthenticated) {
        const now = Date.now()

        if (now - lastPingTime > PING_INTERVAL) {
          lastPingTime = now

          api()
            .users.ping.post()
            .then(({ error }) => {
              if (error) {
                console.error(error.value)
              }
            })
            .catch((err) => {
              console.error('Мережева помилка при ping:', err)
            })
        }
      }

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
        <TanStackDevtools
          config={{ position: 'bottom-left', hideUntilHover: true }}
          plugins={[
            {
              name: 'Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Query',
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: 'Form',
              render: <FormDevtoolsPanel />,
            },
            {
              name: 'Hotkeys',
              render: <HotkeysDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
