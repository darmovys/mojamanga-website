import { Plus, X, Search, Check, XIcon, LoaderCircle } from 'lucide-react'
import styles from './ComboboxField.module.scss'
import { Combobox, ScrollArea, Separator } from '@base-ui/react'
import MotionButton from '../MotionButton'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import VisuallyHidden from '../VisuallyHidden'
import ClickTargetHelper from '../ClickTargetHelper'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tagsQueries } from '@/services/queries'
import { Tag } from '@/lib/treaty-types'

interface TagsComboboxFieldProps {
  value: Tag[]
  onChange: (value: Tag[]) => void
}

export function TagComboboxField({ value, onChange }: TagsComboboxFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery(tagsQueries.getAllTags())

  const allTags = response?.data ?? []

  const triggerAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
        transition: { type: 'spring', duration: 0.3, bounce: 0 } as const,
      }

  return (
    <Combobox.Root
      multiple={true}
      items={allTags}
      value={value}
      onValueChange={onChange}
      onOpenChange={setIsOpen}
      itemToStringLabel={(item: Tag) => item.name}
      isItemEqualToValue={(item: Tag, value: Tag) => item.id === value.id}
    >
      <div className={styles.Wrapper}>
        <Combobox.Chips className={styles.ChipGroup}>
          <Combobox.Trigger
            render={<MotionButton />}
            className={styles.AddButton}
          >
            <AnimatePresence
              mode={shouldReduceMotion ? undefined : 'popLayout'}
              initial={false}
            >
              <motion.div
                className={styles.AddButtonFront}
                {...triggerAnimation}
                key={isOpen ? 'open' : 'close'}
              >
                {isOpen ? (
                  <>
                    <XIcon size={16} key="icon-close" />
                    <span>Закрити</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} key="icon-add" />
                    <span>Додати</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </Combobox.Trigger>

          <Separator
            orientation="vertical"
            className={styles.HorizontalSeparator}
          />
          <ChipList selectedTags={value} />
        </Combobox.Chips>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={8} align="start">
          <Combobox.Popup className={styles.Popup}>
            <div className={styles.SearchWrapper}>
              <Search size={14} className={styles.SearchIcon} />
              <Combobox.Input
                placeholder="Фільтрувати за назвою"
                className={styles.Input}
              />
            </div>

            <Separator
              className={styles.VerticalSeparator}
              orientation="horizontal"
            />

            <ScrollArea.Root className={styles.ScrollArea}>
              {isLoading && (
                <div className={styles.Status}>
                  <LoaderCircle size={20} className={styles.Spinner} />
                  <span>Завантаження...</span>
                </div>
              )}

              {isError && (
                <div className={styles.Status}>Помилка завантаження тегів</div>
              )}

              <TagsEmptyState isLoading={isLoading} isError={isError} />

              <Combobox.List
                render={<ScrollArea.Viewport />}
                className={styles.List}
              >
                {(tag: Tag) => (
                  <Combobox.Item
                    key={tag.id}
                    value={tag}
                    className={styles.Item}
                  >
                    <span>{tag.name}</span>
                    <Combobox.ItemIndicator>
                      <Check size={16} />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                )}
              </Combobox.List>

              <ScrollArea.Scrollbar className={styles.Scrollbar}>
                <ScrollArea.Thumb className={styles.Thumb} />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}

function ChipList({ selectedTags }: { selectedTags: Tag[] }) {
  const shouldReduceMotion = useReducedMotion()
  const chipAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
        transition: {
          duration: 0.15,
          layout: { duration: 0.25, ease: 'easeOut' },
        },
      }

  return (
    <AnimatePresence mode={shouldReduceMotion ? undefined : 'popLayout'}>
      {selectedTags.map((tag) => (
        <Combobox.Chip
          key={tag.id}
          render={
            <motion.span layout={!shouldReduceMotion} {...chipAnimation} />
          }
          className={styles.Chip}
        >
          {tag.name}
          <Combobox.ChipRemove className={styles.RemoveBtn}>
            <X size={14} />
            <ClickTargetHelper />
            <VisuallyHidden>Видалити {tag.name}</VisuallyHidden>
          </Combobox.ChipRemove>
        </Combobox.Chip>
      ))}
    </AnimatePresence>
  )
}

function TagsEmptyState({
  isLoading,
  isError,
}: {
  isLoading: boolean
  isError: boolean
}) {
  const filteredTags = Combobox.useFilteredItems()

  if (isLoading || isError) return null

  return (
    <Combobox.Empty className={styles.Empty}>
      {filteredTags.length === 0 && 'Нічого не знайдено'}
    </Combobox.Empty>
  )
}
