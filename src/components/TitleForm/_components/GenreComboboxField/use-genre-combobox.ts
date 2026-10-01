import { genresQueries } from '@/services/queries'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export function useGenreCombobox() {
  const [isOpen, setIsOpen] = useState(false)

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery(genresQueries.getAllGenres())

  const allGenres = response?.data ?? []

  return { allGenres, isOpen, setIsOpen, isLoading, isError }
}
