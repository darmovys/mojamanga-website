import { LinkType } from '@/generated/prisma/enums'
import { ActiveLink } from './CreateTeamForm'
import { motion } from 'motion/react'
import { LinkSelector } from './LinkSelector'
import MotionButton from '../MotionButton'
import { Trash2 } from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import styles from './CreateTeamForm.module.scss'

interface LinkInputField {
  link: ActiveLink
  availableTypes: LinkType[]
  onChangeLinkType: (id: string, newType: LinkType) => void
  onChangeLinkUrl: (id: string, value: string) => void
  onRemoveLink: (id: string) => void
  hasAccordionAnimationFinished: boolean
}

export function LinkInputField({
  link,
  availableTypes,
  onChangeLinkType,
  onChangeLinkUrl,
  onRemoveLink,
  hasAccordionAnimationFinished,
}: LinkInputField) {
  return (
    <motion.div
      layout={true}
      initial={
        hasAccordionAnimationFinished
          ? { opacity: 0, height: 0, scale: 0.96 }
          : false
      }
      animate={
        hasAccordionAnimationFinished
          ? {
              opacity: 1,
              height: 'auto',
              scale: 1,
              transition: {
                type: 'spring',
                duration: 0.25,
                bounce: 0,
              },
            }
          : false
      }
      exit={{
        x: -80,
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        overflow: 'hidden',
        transition: {
          x: { duration: 0.25, ease: 'easeOut' },
          opacity: { delay: 0.1, duration: 0.2 },
          height: { delay: 0.25, duration: 0.25, ease: 'easeInOut' },
          marginTop: { delay: 0.25, duration: 0.25 },
          marginBottom: { delay: 0.25, duration: 0.25 },
        },
      }}
      className={styles.LinkFieldInputWrapper}
    >
      <LinkSelector
        value={link.type}
        onChange={(newType) => onChangeLinkType(link.id, newType)}
        availableTypes={availableTypes}
      />
      <input
        type="url"
        placeholder="https://"
        value={link.url}
        onChange={(e) => onChangeLinkUrl(link.id, String(e.target.value))}
        autoComplete="off"
        className={styles.LinkFieldInput}
      />

      <div className={styles.TrashLinkButtonWrapper}>
        <MotionButton
          className={styles.TrashButton}
          onClick={() => onRemoveLink(link.id)}
        >
          <Trash2 size={16} />
          <VisuallyHidden>Видалити зображення</VisuallyHidden>
        </MotionButton>
      </div>
    </motion.div>
  )
}
