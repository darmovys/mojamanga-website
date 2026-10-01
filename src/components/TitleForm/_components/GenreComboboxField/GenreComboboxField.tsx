import {
  Plus,
  X,
  Search,
  Check,
  XIcon,
  LoaderCircle,
  LockIcon,
} from 'lucide-react'
import { Combobox, ScrollArea, Separator } from '@base-ui/react'
import MotionButton from '@/components/MotionButton'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import VisuallyHidden from '@/components/VisuallyHidden'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import { Genre } from '@/lib/treaty-types'
import { showTimedToast } from '@/lib/toast'
import { useGenreCombobox } from './use-genre-combobox'
import styles from './GenreComboboxField.module.scss'

interface GenresComboboxFieldProps {
  value: Genre[]
  onChange: (value: Genre[]) => void
  isLocked: boolean
}

export function GenreComboboxField({
  value,
  onChange,
  isLocked,
}: GenresComboboxFieldProps) {
  const { allGenres, isOpen, setIsOpen, isLoading, isError } =
    useGenreCombobox()
  const shouldReduceMotion = useReducedMotion()
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
      items={allGenres}
      value={value}
      onValueChange={onChange}
      onOpenChange={setIsOpen}
      itemToStringLabel={(item: Genre) => item.name}
      isItemEqualToValue={(item: Genre, value: Genre) => item.id === value.id}
    >
      <div className={styles.Wrapper} data-locked={isLocked ? '' : undefined}>
        <Combobox.Chips className={styles.ChipGroup}>
          <Combobox.Trigger
            render={<MotionButton />}
            className={styles.AddButton}
            disabled={isLocked}
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
          <ChipList selectedGenres={value} />
        </Combobox.Chips>
        {isLocked && (
          <div
            className={styles.LockOverlay}
            onClick={() => {
              showTimedToast(
                {
                  type: 'warning',
                  title: 'Попередження',
                  description: 'Поле заблоковано для внесення змін',
                },
                1500,
              )
            }}
          >
            <LockIcon size={20} />
          </div>
        )}
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
                <div className={styles.Status}>Помилка завантаження жанрів</div>
              )}

              <GenresEmptyState isLoading={isLoading} isError={isError} />

              <Combobox.List
                render={<ScrollArea.Viewport />}
                className={styles.List}
              >
                {(genre: Genre) => (
                  <Combobox.Item
                    key={genre.id}
                    value={genre}
                    className={styles.Item}
                  >
                    <span>{genre.name}</span>
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

function ChipList({ selectedGenres }: { selectedGenres: Genre[] }) {
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
      {selectedGenres.map((genre) => (
        <Combobox.Chip
          key={genre.id}
          render={
            <motion.span layout={!shouldReduceMotion} {...chipAnimation} />
          }
          className={styles.Chip}
        >
          {genre.name}
          <Combobox.ChipRemove className={styles.RemoveBtn}>
            <X size={14} />
            <ClickTargetHelper />
            <VisuallyHidden>Видалити {genre.name}</VisuallyHidden>
          </Combobox.ChipRemove>
        </Combobox.Chip>
      ))}
    </AnimatePresence>
  )
}

function GenresEmptyState({
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
