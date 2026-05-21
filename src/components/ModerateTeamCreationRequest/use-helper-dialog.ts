import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'

export function useHelperDialog() {
  const routeApi = getRouteApi('/moderation/team-review/$teamId')
  const { title, content, mdast } = routeApi.useLoaderData()

  const [isHelperOpen, setIsHelperOpen] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem(
      'seen_create_team_request_moderation_rules',
    )
    if (hasSeen !== 'true') {
      setIsHelperOpen(true)
    }
  }, [])

  const handleHelperOpenChange = (open: boolean) => {
    setIsHelperOpen(open)

    if (!open) {
      localStorage.setItem('seen_create_team_request_moderation_rules', 'true')
    }
  }

  return {
    title,
    content,
    mdast,
    isHelperOpen,
    setIsHelperOpen,
    handleHelperOpenChange,
  }
}
