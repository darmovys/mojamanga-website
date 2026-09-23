import { useState } from 'react'
import { PreviewCard } from '@base-ui/react'
import { TitlePreviewPopup } from './_components'

interface TitlePreviewProps {
  titleId: string
  children: React.ReactElement
  delay?: number
  closeDelay?: number
}

function TitlePreview({
  titleId,
  children,
  delay = 250,
  closeDelay = 150,
}: TitlePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <PreviewCard.Root open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PreviewCard.Trigger
        delay={delay}
        closeDelay={closeDelay}
        render={children}
      />
      <TitlePreviewPopup titleId={titleId} isOpen={isOpen} />
    </PreviewCard.Root>
  )
}

export default TitlePreview
