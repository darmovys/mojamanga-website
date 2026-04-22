import { linkOptions } from '@tanstack/react-router'
import { WorkType } from '@/generated/prisma/enums'
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

export const WORK_TYPE_TITLES: Record<WorkType, string> = {
  [WorkType.MANGA]: 'Манга',
  [WorkType.MANHWA]: 'Манхва',
  [WorkType.MANHUA]: 'Маньхва',
  [WorkType.MALOPUS]: 'Мальопис',
  [WorkType.COMIC]: 'Комікс',
  [WorkType.WEBCOMIC]: 'Вебкомікс',
}

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

export const workTypeLinks = linkOptions(
  Object.entries(WORK_TYPE_TITLES).map(([type, title]) => ({
    title,
    to: '/catalog',
    search: {
      types: [type as WorkType],
    },
  })),
)

export const addContentLinks = linkOptions([
  {
    title: 'Додати твір',
    icon: BookPlus,
    to: '/about',
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
    title: 'Додати людину',
    icon: UserRound,
    to: '/about',
    activeOptions: {
      exact: true,
    },
  },
])

export const userLinks = linkOptions([
  {
    title: 'Сповіщення',
    icon: Bell,
    to: '/about',
    activeOptions: {
      exact: true,
    },
  },
  {
    title: 'Коментарі',
    icon: MessageSquare,
    to: '/about',
    activeOptions: {
      exact: true,
    },
  },
  {
    title: 'Закладки',
    icon: Bookmark,
    to: '/about',
    activeOptions: {
      exact: true,
    },
  },
  {
    title: 'Модераторска',
    icon: Shield,
    to: '/moderation',
    activeOptions: {
      exact: true,
    },
  },
  {
    title: 'Налаштування',
    icon: Settings,
    to: '/about',
    activeOptions: {
      exact: true,
    },
  },
])
