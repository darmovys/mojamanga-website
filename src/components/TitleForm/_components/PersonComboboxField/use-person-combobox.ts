import { api } from '@/lib/api-client'
import { Person } from '@/lib/treaty-types'

import { useEffect, useRef, useState } from 'react'

export function usePersonCombobox(debounceMs: number) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<Person[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (searchValue.length >= 2) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }

    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    if (debouncedSearchValue.length < 2) {
      setIsSearching(false)
      setError(null)
      return
    }
    const controller = new AbortController()
    abortControllerRef.current?.abort()
    abortControllerRef.current = controller

    setError(null)

    api()
      .people['people-to-attach'].get({
        query: {
          search: debouncedSearchValue,
        },
      })
      .then(({ data, error }) => {
        if (controller.signal.aborted) return

        setIsSearching(false)

        if (error) {
          setError('Не вдалося отримати персон')
          setSearchResults([])
        } else {
          setSearchResults(data)
          setError(null)
        }
      })

    return () => controller.abort()
  }, [debouncedSearchValue])

  function handleInputValueChange(nextValue: string) {
    setSearchValue(nextValue)
  }

  function handleClear() {
    setSearchValue('')
    setDebouncedSearchValue('')
    setError(null)
  }

  return {
    isOpen,
    setIsOpen,
    searchResults,
    isSearching,
    error,
    searchValue,
    handleInputValueChange,
    handleClear,
  }
}
