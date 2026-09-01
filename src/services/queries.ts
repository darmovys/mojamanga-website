import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { notFound, redirect } from '@tanstack/react-router'
import { Treaty } from '@elysiajs/eden'
import { Api } from '@/lib/api-client'
import { UserTeamsRequests, UserTitlesRequests } from '@/schemas/users'

export const authQueries = {
  all: ['auth'] as const,
  user: () =>
    queryOptions({
      queryKey: [...authQueries.all, 'user'],
      queryFn: async () => {
        const response = await api().user_session.get()

        if (response.error) {
          throw response.error
        }

        return response.data
      },
    }),
}

const fetchPendingTeams = async (page: number) => {
  const response = await api().teams['get-pending-teams'].get({
    query: { page },
  })
  if (response.error) throw response.error
  return response.data
}

export type PendingTeam = NonNullable<
  Awaited<ReturnType<typeof fetchPendingTeams>>
>['teams'][number]

export type TeamEditData = Treaty.Data<ReturnType<Api['teams']>['edit']['get']>
export type TeamDetailedProfileData = Treaty.Data<
  ReturnType<Api['teams']>['detailed-profile-info']['get']
>

export const teamsQueries = {
  all: ['teams'] as const,
  lists: () => [...teamsQueries.all, 'lists'] as const,
  teamEditData: (id: string) =>
    queryOptions({
      queryKey: [...teamsQueries.all, id, 'edit'],
      queryFn: async () => {
        const response = await api().teams({ id }).edit.get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else if (error.status === 403) {
            throw redirect({ to: '/forbidden' })
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  teamProfile: (id: string) =>
    queryOptions({
      queryKey: [...teamsQueries.all, id, 'profile'],
      queryFn: async () => {
        const response = await api().teams({ id }).profile.get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  teamDetailedProfile: (id: string) =>
    queryOptions({
      queryKey: [...teamsQueries.all, id, 'profile-full'],
      queryFn: async () => {
        const response = await api()
          .teams({ id })
          ['detailed-profile-info'].get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  averageTeamChaptersPerMonth: (id: string) =>
    queryOptions({
      queryKey: [...teamsQueries.all, id, 'avg-chapters'],
      queryFn: async () => {
        const { data, error } = await api()
          .teams({ id })
          ['average-chapters-per-month'].get()

        if (error) {
          throw error.value
        }

        return data
      },
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    }),
  getAccentColor: (id: string) =>
    queryOptions({
      queryKey: [...teamsQueries.all, id, 'accent-bg-color'],
      queryFn: async () => {
        const response = await api().teams({ id })['accent-bg-color'].get()
        const { error } = response

        if (error) {
          throw error
        }

        return response.data
      },
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    }),
  pendingTeams: (page: number) =>
    queryOptions({
      queryKey: [...teamsQueries.lists(), 'pending', page] as const,
      queryFn: () => fetchPendingTeams(page),
    }),
  getUserTeams: () =>
    queryOptions({
      queryKey: [...teamsQueries.lists(), 'user_teams'] as const,
      queryFn: () => api().teams['teams-to-attach'].get(),
    }),
  getTeamRequest: (id: string) =>
    queryOptions({
      queryKey: [...teamsQueries.all, id] as const,
      queryFn: async () => {
        const response = await api()
          .teams['team-creation-request']({ id: id })
          .get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
}

export type PendingPerson = NonNullable<
  Awaited<ReturnType<typeof fetchPendingPeople>>
>['people'][number]

const fetchPendingPeople = async (page: number) => {
  const response = await api().people['get-pending-people'].get({
    query: { page },
  })
  if (response.error) throw response.error
  return response.data
}

export const peopleQueries = {
  all: ['people'] as const,
  lists: () => [...peopleQueries.all, 'lists'] as const,
  pendingPeople: (page: number) =>
    queryOptions({
      queryKey: [...peopleQueries.lists(), 'pending', page] as const,
      queryFn: () => fetchPendingPeople(page),
    }),
  getPersonRequest: (id: string) =>
    queryOptions({
      queryKey: [...peopleQueries.all, id] as const,
      queryFn: async () => {
        const response = await api()
          .people['person-adding-request']({ id: id })
          .get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
}

export const tagsQueries = {
  all: ['tags'] as const,
  lists: () => [...tagsQueries.all, 'lists'] as const,
  getAllTags: () =>
    queryOptions({
      queryKey: [...tagsQueries.lists()] as const,
      queryFn: () => api().tags.all.get(),
      staleTime: Infinity,
    }),
}

export const genresQueries = {
  all: ['genres'] as const,
  lists: () => [...genresQueries.all, 'lists'] as const,
  getAllGenres: () =>
    queryOptions({
      queryKey: [...genresQueries.lists()] as const,
      queryFn: () => api().genres.all.get(),
      staleTime: Infinity,
    }),
}

export type PendingTitle = NonNullable<
  Awaited<ReturnType<typeof fetchPendingTitles>>
>['titles'][number]

export type TitleEditableData = Treaty.Data<
  ReturnType<Api['titles']>['editable-data']['get']
>

const fetchPendingTitles = async (page: number) => {
  const response = await api().titles['get-pending-titles'].get({
    query: { page },
  })
  if (response.error) throw response.error
  return response.data
}

export const titlesQueries = {
  all: ['titles'] as const,
  lists: () => [...titlesQueries.all, 'lists'] as const,
  titleEditData: (id: string) =>
    queryOptions({
      queryKey: [...titlesQueries.all, id, 'edit'],
      queryFn: async () => {
        const response = await api().titles({ id })['editable-data'].get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  pendingTitles: (page: number) =>
    queryOptions({
      queryKey: [...titlesQueries.lists(), 'pending', page] as const,
      queryFn: () => fetchPendingTitles(page),
    }),
  getTitleAddingRequest: (id: string) =>
    queryOptions({
      queryKey: [...titlesQueries.all, id] as const,
      queryFn: async () => {
        const response = await api()
          .titles['title-adding-request']({ id: id })
          .get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
}

export const usersQueries = {
  all: ['users'] as const,
  lists: () => [...usersQueries.all, 'lists'] as const,
  settings: () => [...usersQueries.all, 'settings'] as const,
  requests: () => [...usersQueries.all, 'requests'] as const,
  getUserInfo: (id: string) =>
    queryOptions({
      queryKey: [...usersQueries.all, id] as const,
      queryFn: async () => {
        const response = await api().users.user({ id }).get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  getUserTeams: (id: string) =>
    queryOptions({
      queryKey: [...usersQueries.lists(), 'teams', id] as const,
      queryFn: async () => {
        const response = await api().users.user({ id }).teams.get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  getUserProfileSettingsInfo: (id: string) =>
    queryOptions({
      queryKey: [...usersQueries.settings(), 'profile', id] as const,
      queryFn: async () => {
        const response = await api().users.user({ id }).settings.profile.get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  getUserSecuritySettingsInfo: (id: string) =>
    queryOptions({
      queryKey: [...usersQueries.settings(), 'security', id] as const,
      queryFn: async () => {
        const response = await api().users.user({ id }).settings.security.get()
        const { error } = response
        if (error) {
          if (error.status === 404) {
            throw notFound()
          } else {
            throw error
          }
        }
        return response.data
      },
    }),
  getUserSessions: (id: string) =>
    queryOptions({
      queryKey: [...usersQueries.settings(), 'sessions', id] as const,
      queryFn: async () => {
        const response = await api().users.user({ id }).settings.devices.get()
        const { error } = response
        if (error) {
          throw error
        }
        return response.data
      },
    }),
  getUserTeamsRequests: (id: string, status: UserTeamsRequests['status']) =>
    queryOptions({
      queryKey: [...usersQueries.requests(), 'teams', id, status] as const,
      queryFn: async () => {
        const response = await api()
          .users.user({ id })
          .requests.teams.get({ query: { status } })
        const error = response.error
        if (error) {
          throw error
        }
        return response.data
      },
    }),
  getUserTitlesRequests: (id: string, status: UserTitlesRequests['status']) =>
    queryOptions({
      queryKey: [...usersQueries.requests(), 'titles', id, status] as const,
      queryFn: async () => {
        const response = await api()
          .users.user({ id })
          .requests.titles.get({ query: { status } })
        const error = response.error
        if (error) {
          throw error
        }
        return response.data
      },
    }),
}
