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
import { LinkType } from '@/generated/prisma/enums'

import { Globe } from 'lucide-react'

type LinkMeta = {
  label: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  tone: string
  toneDark?: string
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
