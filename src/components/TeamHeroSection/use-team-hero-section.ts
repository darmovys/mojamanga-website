import { teamsQueries } from '@/services/queries'
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { oklch } from 'culori'
import { produce } from 'immer'
import { useState } from 'react'

export function useTeamHeroSection(id: string) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(teamsQueries.teamProfile(id))
  const {
    data: avgChaptersPerMonth,
    isPending,
    isError,
  } = useQuery(teamsQueries.averageTeamChaptersPerMonth(id))

  useQuery({
    ...teamsQueries.getAccentColor(id),
    enabled: !data.backgroundAccentColor && !!data.backgroundUrl,
    select: (fetchedColor) => {
      queryClient.setQueryData(
        teamsQueries.teamProfile(id).queryKey,
        (oldData) =>
          produce(oldData, (draft) => {
            if (draft) {
              draft.backgroundAccentColor = fetchedColor
            }
          }),
      )
    },
  })

  const accentColor = oklch(
    data.backgroundAccentColor ?? 'oklch(0.1396 0.0242 210.1)',
  )

  const handleOpenInfo = () => setIsInfoOpen(true)

  return {
    isInfoOpen,
    setIsInfoOpen,
    handleOpenInfo,
    profileData: data,
    avgChaptersPerMonth,
    isPending,
    isError,
    accentColor,
  }
}
