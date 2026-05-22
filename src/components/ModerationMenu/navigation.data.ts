import { ModerationMenuType } from '@/schemas/moderation'

export type NavItem = {
  label: string
  type: ModerationMenuType
  requests?: number
}

export type NavSectionData = {
  heading: string
  items: readonly NavItem[]
}

export const NAVIGATION_SECTIONS: NavSectionData[] = [
  {
    heading: 'Контент',
    items: [
      { label: 'Додавання твору', requests: 87, type: 'works' },
      { label: 'Редагування твору', requests: 34, type: 'suggestions' },
      { label: 'Додавання розділу', requests: 112, type: 'chapters' },
      { label: 'Створення команди', requests: 5, type: 'teams' },
    ],
  },
  {
    heading: 'Скарги',
    items: [
      { label: 'На коментарі', requests: 12, type: 'comment-complaints' },
    ],
  },
  {
    heading: 'Користувачі',
    items: [{ label: 'Керування дозволами', type: 'users-management' }],
  },
] as const
