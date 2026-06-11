import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { notFound } from '@tanstack/react-router'

export const authQueries = {
  all: ['auth'],
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

export const teamsQueries = {
  all: ['teams'] as const,
  lists: () => [...teamsQueries.all, 'lists'] as const,
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

export const worksQueries = {
  all: ['works'] as const,
  lists: () => [...genresQueries.all, 'lists'] as const,
}
