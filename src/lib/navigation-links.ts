import { linkOptions } from '@tanstack/react-router'
import { TITLE_TYPE_LABELS } from './constants'
import { TitleType } from '@/generated/prisma/enums'
import {
  Layers,
  Users,
  Pencil,
  Palette,
  User,
  Newspaper,
  BookPlus,
  UserRound,
  Bell,
  Bookmark,
  MessageSquare,
  Settings,
  Shield,
} from 'lucide-react'

export const catalogLinks = linkOptions([
  {
    title: 'Твори',
    icon: Layers,
    to: '/catalog',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Команди',
    icon: Users,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Користувачі',
    icon: User,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Автори',
    icon: Pencil,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Художники',
    icon: Palette,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
])

export const otherLinks = linkOptions([
  {
    title: 'Новини',
    icon: Newspaper,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
])

export const titleTypeLinks = linkOptions(
  Object.entries(TITLE_TYPE_LABELS).map(([type, title]) => ({
    title,
    to: '/catalog',
    search: {
      types: [type as TitleType],
    },
  })),
)

export const addContentLinks = linkOptions([
  {
    title: 'Додати твір',
    icon: BookPlus,
    to: '/title/create',
    activeOptions: {
      exact: true,
    },
  },
  {
    title: 'Створити команду',
    icon: Users,
    to: '/team/create',
    activeOptions: {
      exact: true,
    },
  },
  {
    title: 'Додати персону',
    icon: UserRound,
    to: '/people/create',
    activeOptions: {
      exact: true,
    },
  },
])

export const getUserLinks = (userId: string, desktopLinks: boolean = true) => {
  return linkOptions([
    {
      title: 'Сповіщення',
      icon: Bell,
      to: '/user/$id/notifications',
      params: { id: userId },
      activeOptions: { exact: true },
    },
    {
      title: 'Коментарі',
      icon: MessageSquare,
      to: '/user/$id/comments',
      params: { id: userId },
      activeOptions: { exact: true },
    },
    {
      title: 'Закладки',
      icon: Bookmark,
      to: '/user/$id/bookmarks',
      params: { id: userId },
      activeOptions: { exact: true },
    },
    {
      title: 'Модераторска',
      icon: Shield,
      to: '/moderation',
      search: { type: 'titles' },
      activeOptions: { exact: true },
    },
    {
      title: 'Налаштування',
      icon: Settings,
      to: `/user/$id/settings/${desktopLinks ? 'profile' : 'root'}`,
      params: { id: userId },
      activeOptions: { exact: true },
    },
  ])
}
