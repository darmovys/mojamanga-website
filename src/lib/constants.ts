import {
  BuyMeACoffeeIcon,
  DiscordIcon,
  DonatelloIcon,
  FacebookIcon,
  InstagramIcon,
  MonobankIcon,
  TelegramIcon,
  TikTokIcon,
  XIcon,
} from '@/components/icons'
import {
  AgeRestriction,
  LinkType,
  TranslationStatus,
  TitleStatus,
  TitleType,
  TitleFieldName,
  UserRole,
} from '@/generated/prisma/enums'

import { Globe } from 'lucide-react'

type LinkMeta = {
  label: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  tone: string
  toneDark?: string
}

type RoleMeta = {
  label: string
  tone: string
}

export const TITLE_TYPE_LABELS: Record<TitleType, string> = {
  [TitleType.MANGA]: 'Манга',
  [TitleType.MANHWA]: 'Манхва',
  [TitleType.MANHUA]: 'Маньхва',
  [TitleType.MALOPUS]: 'Мальопис',
  [TitleType.COMIC]: 'Комікс',
  [TitleType.WEBCOMIC]: 'Вебкомікс',
}

export const TITLE_STATUS_LABELS: Record<TitleStatus, string> = {
  [TitleStatus.ONGOING]: 'Видається',
  [TitleStatus.ENDED]: 'Закінчено',
  [TitleStatus.PAUSED]: 'Призупинено',
  [TitleStatus.LICENSED]: 'Ліцензовано',
  [TitleStatus.ANNOUNCEMENT]: 'Анонсовано',
}

export const TRANSLATION_STATUS_LABELS: Record<TranslationStatus, string> = {
  [TranslationStatus.ONGOING]: 'Перекладається',
  [TranslationStatus.ENDED]: 'Закінчено',
  [TranslationStatus.FREEZED]: 'Призупинено',
  [TranslationStatus.DROPPED]: 'Не перекладається',
}

export const AGE_RESTRICTION_LABELS: Record<AgeRestriction, string> = {
  [AgeRestriction.NO_RESTRICTION]: 'Для всіх',
  [AgeRestriction.SIX_PLUS]: '6+',
  [AgeRestriction.TWELVE_PLUS]: '12+',
  [AgeRestriction.SIXTEEN_PLUS]: '16+',
  [AgeRestriction.EIGHTEEN_PLUS]: '18+',
}

export const FIELD_LABELS: Record<TitleFieldName, string> = {
  [TitleFieldName.coverUrl]: 'Обкладинка',
  [TitleFieldName.backgroundUrl]: 'Фонове зображення',
  [TitleFieldName.nameUkr]: 'Назва українською',
  [TitleFieldName.nameEng]: 'Назва англійською',
  [TitleFieldName.alternativeNames]: 'Альтернативні назви',
  [TitleFieldName.description]: 'Опис',
  [TitleFieldName.type]: 'Тип',
  [TitleFieldName.titleStatus]: 'Статус твору',
  [TitleFieldName.translationStatus]: 'Статус перекладу',
  [TitleFieldName.ageRestriction]: 'Вікові обмеження',
  [TitleFieldName.releaseYear]: 'Рік випуску',
  [TitleFieldName.genres]: 'Жанри',
  [TitleFieldName.tags]: 'Теги',
  [TitleFieldName.authors]: 'Автори',
  [TitleFieldName.artists]: 'Художники',
  [TitleFieldName.sources]: 'Джерела',
}

export const USER_ROLES: Record<UserRole, RoleMeta> = {
  [UserRole.USER]: {
    label: 'Користувач',
    tone: 'blue',
  },
  [UserRole.MODERATOR]: {
    label: 'Модератор',
    tone: '#07ca38',
  },
  [UserRole.ADMIN]: {
    label: 'Адмін',
    tone: '#ffae52',
  },
}

export const LINK_META: Record<LinkType, LinkMeta> = {
  DISCORD: {
    label: 'Discord',
    icon: DiscordIcon,
    tone: '#92c0ff85',
    toneDark: '#2533468a',
  },
  INSTAGRAM: { label: 'Instagram', icon: InstagramIcon, tone: '#c72bb32b' },
  TELEGRAM: { label: 'Telegram', icon: TelegramIcon, tone: '#6298ff29' },
  TIKTOK: { label: 'TikTok', icon: TikTokIcon, tone: '#99434a4d' },
  FACEBOOK: { label: 'Facebook', icon: FacebookIcon, tone: '#4f6fac36' },
  X: {
    label: 'X / Twitter',
    icon: XIcon,
    tone: '#01010136',
    toneDark: '#4e4e4e36',
  },
  MONOBANK: { label: 'monobank', icon: MonobankIcon, tone: '#30343c54' },
  BUYMEACOFFEE: {
    label: 'Buy me a coffee',
    icon: BuyMeACoffeeIcon,
    tone: '#ffe8564d',
    toneDark: '#f7d81526',
  },
  DONATELLO: {
    label: 'Donatello',
    icon: DonatelloIcon,
    tone: '#4a6b9945',
  },
  SITE: {
    label: 'Сайт',
    icon: Globe,
    tone: '#c3c3c34d',
    toneDark: '#c3c3c31f',
  },
}
