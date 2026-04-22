import { LinkType } from '@/generated/prisma/enums'
import { useState } from 'react'
import { Select } from '@base-ui/react'
import { motion } from 'motion/react'
import { tapAnimation } from '../MotionButton'
import VisuallyHidden from '../VisuallyHidden'
import { Check, ChevronDown, CircleQuestionMark } from 'lucide-react'
import ClickTargetHelper from '../ClickTargetHelper'
import { LINK_META } from './use-team-form'
import styles from './CreateTeamForm.module.scss'

interface LinkSelectorProps {
  value: LinkType | null
  onChange: (value: LinkType) => void
  availableTypes: LinkType[]
}

export function LinkSelector({
  value,
  onChange,
  availableTypes,
}: LinkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const CurrentIcon = value ? LINK_META[value].icon : null
  return (
    <div>
      <Select.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        value={value}
        onValueChange={(val) => onChange(val as LinkType)}
      >
        <div className={styles.SelectWrapper}>
          <Select.Trigger
            render={<motion.button {...tapAnimation} />}
            className={styles.Select}
          >
            {CurrentIcon ? (
              <>
                <CurrentIcon style={{ width: 16, height: 16 }} />
                <VisuallyHidden>{value}</VisuallyHidden>
              </>
            ) : (
              <>
                <CircleQuestionMark size={16} />
                <VisuallyHidden>Тип посилання не вибрано</VisuallyHidden>
              </>
            )}
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? '180deg' : '0deg' }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            >
              <ChevronDown className={styles.ChevronDown} size={16} />
            </motion.div>
            <ClickTargetHelper />
          </Select.Trigger>
        </div>
        <Select.Portal>
          <Select.Positioner
            className={styles.Positioner}
            sideOffset={8}
            alignItemWithTrigger={false}
          >
            <Select.Popup className={styles.Popup}>
              {availableTypes.map((type) => {
                const ItemIcon = LINK_META[type].icon
                const label = LINK_META[type].label
                return (
                  <Select.Item className={styles.Item} key={type} value={type}>
                    <Select.ItemText>
                      <ItemIcon style={{ width: 24, height: 24 }} />
                    </Select.ItemText>
                    <div className={styles.ItemText}>{label}</div>
                    <Select.ItemIndicator className={styles.ItemIndicator}>
                      <Check size={18} />
                    </Select.ItemIndicator>
                  </Select.Item>
                )
              })}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
