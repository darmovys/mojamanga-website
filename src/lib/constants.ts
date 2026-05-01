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
}

export const LINK_META: Record<LinkType, LinkMeta> = {
  DISCORD: { label: 'Discord', icon: DiscordIcon },
  INSTAGRAM: { label: 'Instagram', icon: InstagramIcon },
  TELEGRAM: { label: 'Telegram', icon: TelegramIcon },
  TIKTOK: { label: 'TikTok', icon: TikTokIcon },
  FACEBOOK: { label: 'Facebook', icon: FacebookIcon },
  X: { label: 'X / Twitter', icon: XIcon },
  MONOBANK: { label: 'monobank', icon: MonobankIcon },
  BUYMEACOFFEE: { label: 'Buy me a coffee', icon: BuyMeACoffeeIcon },
  DONATELLO: { label: 'Donatello', icon: DonatelloIcon },
  SITE: { label: 'Сайт', icon: Globe },
}
