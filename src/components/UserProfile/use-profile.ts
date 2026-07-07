import { USER_ROLES } from '@/lib/constants'
import { usersQueries } from '@/services/queries'
import { useSuspenseQuery } from '@tanstack/react-query'
import { formatDistanceToNowStrict } from 'date-fns'
import { uk } from 'date-fns/locale'
import { type MouseEvent } from 'react'

function useProfile(id: string) {
  const { data } = useSuspenseQuery(usersQueries.getUserInfo(id))

  const { label, tone } = USER_ROLES[data.user.role]

  const timeElapsed = formatDistanceToNowStrict(data.user.createdAt, {
    locale: uk,
    addSuffix: false,
  })

  const navItems = [
    { to: '/user/$id/bookmarks', label: 'Закладки' },
    { to: '/user/$id/comments', label: 'Коментарі' },
    { to: '/user/$id/teams', label: 'Команди' },
    { to: '/user/$id/notifications', label: 'Сповіщення' },
    {
      to: '/user/$id/about',
      label: `Про ${data.isMe ? 'себе' : 'користувача'}`,
    },
  ] as const

  function handleItemClick(e: MouseEvent<HTMLAnchorElement>) {
    e.currentTarget.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  const bookmarksCount = data.user._count.bookmarks
  const commentsCount = data.user._count.comments
  const likesCount = data.user._count.likes
  const titleAddingsCount = data.user._count.titleAddings
  const uploadedChaptersCount = data.user._count.uploadedChapters

  const primaryStats = [
    { count: bookmarksCount, words: ['закладка', 'закладки', 'закладок'] },
    { count: commentsCount, words: ['коментар', 'коментарі', 'коментарів'] },
    { count: likesCount, words: ['вподобайка', 'вподобайки', 'вподобайок'] },
  ]

  const secondaryStats = [
    {
      prefix: 'додано',
      count: titleAddingsCount,
      words: ['твір', 'твори', 'творів'],
    },
    {
      prefix: 'завантажено',
      count: uploadedChaptersCount,
      words: ['розділ', 'розділи', 'розділів'],
    },
  ]

  return {
    data,
    label,
    tone,
    timeElapsed,
    navItems,
    handleItemClick,
    primaryStats,
    secondaryStats,
  }
}

export default useProfile
