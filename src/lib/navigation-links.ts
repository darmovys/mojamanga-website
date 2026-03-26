import { linkOptions } from '@tanstack/react-router'
import { WorkType } from '@/generated/prisma/enums'
import { Layers, Users, Pencil, Palette, User, Newspaper } from 'lucide-react'

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
