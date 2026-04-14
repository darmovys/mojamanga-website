import { useForm } from '@tanstack/react-form-start'
import { useState } from 'react'
import { useImageUpload } from './use-image-upload'
import { LinkType } from '@/generated/prisma/enums'
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
} from '../icons'
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

export interface ActiveLink {
  id: string
  type: LinkType | null
  url: string
}

export function useTeamForm() {
  const avatar = useImageUpload({ width: 375, height: 525 })
  const background = useImageUpload({ width: 1450, height: 540 })
  const [isLinksSectionShown, setIsLinksSectionShown] = useState(true)
  const [isOverflowVisible, setIsOverflowVisible] = useState(true)
  const [hasAccordionAnimationFinished, setHasAccordionAnimationFinished] =
    useState(false)

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      links: [] as ActiveLink[],
    },
    onSubmit: async ({ value }) => {
      console.log('Дані форми: ', value)
    },
  })

  function handleClearForm() {
    if (avatar.fileState !== null) avatar.removeFile()
    if (background.fileState !== null) background.removeFile()

    form.reset()

    setIsLinksSectionShown(true)
    setIsOverflowVisible(true)
    setHasAccordionAnimationFinished(false)
  }

  function handleLinksPresence() {
    if (!isLinksSectionShown) {
      setIsLinksSectionShown(true)
      setTimeout(() => setIsOverflowVisible(true), 250)
    } else {
      setHasAccordionAnimationFinished(false)
      setIsOverflowVisible(false)
      setIsLinksSectionShown(false)
    }
  }
  return {
    form,
    avatar,
    background,
    handleClearForm,
    handleLinksPresence,
    isLinksSectionShown,
    setIsLinksSectionShown,
    isOverflowVisible,
    hasAccordionAnimationFinished,
    setHasAccordionAnimationFinished,
  }
}
