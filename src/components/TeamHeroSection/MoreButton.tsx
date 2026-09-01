import { Button, Menu } from '@base-ui/react'
import { EllipsisIcon, InfoIcon, PencilIcon, UserPenIcon } from 'lucide-react'
import MotionButton from '../MotionButton'
import VisuallyHidden from '../VisuallyHidden'
import styles from './TeamHeroSection.module.scss'
import ClickTargetHelper from '../ClickTargetHelper'

interface MoreButtonProps {
  size: number
  onOpenAbout?: () => void
}

export function MoreButton({ size, onOpenAbout }: MoreButtonProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <MotionButton className={styles.MoreButton}>
            <EllipsisIcon size={size} />
            <VisuallyHidden>Додаткові дії</VisuallyHidden>
            <ClickTargetHelper />
          </MotionButton>
        }
      />
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          className={styles.Positioner}
        >
          <Menu.Popup className={styles.Popup}>
            <Menu.Item
              className={styles.Item}
              nativeButton={true}
              onClick={onOpenAbout}
              render={
                <Button>
                  <InfoIcon size={16} className={styles.icon} />
                  <span className={styles.label}>Про команду</span>
                </Button>
              }
            />
            <Menu.Item className={styles.Item}>
              <PencilIcon size={16} className={styles.icon} />
              <span className={styles.label}>Редагування команди</span>
            </Menu.Item>
            <Menu.Item className={styles.Item}>
              <UserPenIcon size={17} className={styles.icon} />
              <span className={styles.label}>Редагування прав учасників</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
