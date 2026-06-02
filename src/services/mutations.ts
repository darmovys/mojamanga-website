import { api } from '@/lib/api-client'

export const teamsMutations = {
  approve: () => ({
    mutationFn: async (id: string) => {
      const response = await api().teams['approve-team-request'].patch({ id })
      if (response.error) throw response.error
      return response.data
    },
  }),
  revise: () => ({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const response = await api().teams['revise-team-request'].patch({
        id,
        message,
      })
      if (response.error) throw response.error
      return response.data
    },
  }),
  decline: () => ({
    mutationFn: async ({
      id,
      message,
      coverUrl,
      backgroundUrl,
    }: {
      id: string
      message: string
      coverUrl: string | null
      backgroundUrl: string | null
    }) => {
      const response = await api().teams['decline-team-request'].delete({
        id,
        message,
        coverUrl,
        backgroundUrl,
      })
      if (response.error) throw response.error
      return response.data
    },
  }),
}

export const peopleMutations = {
  approve: () => ({
    mutationFn: async (id: string) => {
      const response = await api().people['approve-person-request'].patch({
        id,
      })
      if (response.error) throw response.error
      return response.data
    },
  }),
  decline: () => ({
    mutationFn: async ({
      id,
      message,
      coverUrl,
    }: {
      id: string
      message: string
      coverUrl: string | null
    }) => {
      const response = await api().people['decline-person-request'].delete({
        id,
        message,
        coverUrl,
      })
      if (response.error) throw response.error
      return response.data
    },
  }),
}
