import { useState } from 'react'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'
import { createIsomorphicFn } from '@tanstack/react-start'

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const getMatches = createIsomorphicFn()
  .server((_query: string, fallback: boolean): boolean => fallback)
  .client((query: string) => window.matchMedia(query).matches)

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {},
): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    initializeWithValue ? getMatches(query, defaultValue) : defaultValue,
  )

  // Обробляє подію зміни медіазапиту.
  function handleChange() {
    setMatches(getMatches(query, defaultValue))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)

    // Активується під час першого завантаження на стороні клієнта та у разі зміни запиту
    handleChange()

    /**
     * Використовуємо застарілі методи `addListener` та `removeListener`
     * для забезпечення сумісності з Safari версій нижче 14
     */
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange)
    } else {
      matchMedia.addEventListener('change', handleChange)
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange)
      } else {
        matchMedia.removeEventListener('change', handleChange)
      }
    }
  }, [query])

  return matches
}
