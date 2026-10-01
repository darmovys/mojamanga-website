import { tagsQueries } from '@/services/queries'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export function useTagCombobox() {
  const [isOpen, setIsOpen] = useState(false)

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery(tagsQueries.getAllTags())

  const allTags = response?.data ?? []

  return { allTags, isOpen, setIsOpen, isLoading, isError }
}
