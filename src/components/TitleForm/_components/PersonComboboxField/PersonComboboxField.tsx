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
import clsx from 'clsx'
import { Person } from '@/lib/treaty-types'
import { showTimedToast } from '@/lib/toast'
import { usePersonCombobox } from './use-person-combobox'
import styles from './PersonComboboxField.module.scss'

interface PersonComboboxFieldProps {
  selectedPeople: Person[]
  onChange: (value: Person[]) => void
  debounceMs?: number
  isLocked: boolean
}

export function PersonComboboxField({
  selectedPeople,
  onChange,
  debounceMs = 300,
  isLocked,
}: PersonComboboxFieldProps) {
  const {
    isOpen,
    setIsOpen,
    searchResults,
    isSearching,
    error,
    searchValue,
    handleInputValueChange,
    handleClear,
  } = usePersonCombobox(debounceMs)
  const shouldReduceMotion = useReducedMotion()
  const triggerAnimation = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.85, filter: 'blur(4px)' },
        transition: {
          type: 'spring',
          duration: 0.3,
          bounce: 0,
        } as const,
      }

  function getStatus() {
    if (isSearching && searchResults.length === 0) {
      return (
        <>
          <LoaderCircle size={22} className={styles.Spinner} />
          <VisuallyHidden>Шукаємо персон</VisuallyHidden>
        </>
      )
    }

    if (error) {
      return error
    }

    if (searchValue.length < 2 && !isSearching && searchResults.length === 0) {
      return 'Введіть принаймні 2 символи'
    }

    return null
  }

  const status = getStatus()

  return (
    <Combobox.Root
      value={selectedPeople}
      multiple={true}
      items={searchResults}
      filter={null}
      itemToStringLabel={(item: Person) => item.nameUkr}
      isItemEqualToValue={(item: Person, value: Person) => item.id === value.id}
      onValueChange={(nextSelectedValues: Person[]) => {
        onChange(nextSelectedValues)
        handleClear()
      }}
      onInputValueChange={(
        nextSearchValue: string,
        { reason }: Combobox.Root.ChangeEventDetails,
      ) => {
        if (reason !== 'item-press') {
          handleInputValueChange(nextSearchValue)
        }
      }}
      onOpenChange={setIsOpen}
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
                <>
                  {isOpen ? <XIcon size={16} /> : <Plus size={16} />}
                  {isOpen ? 'Закрити' : 'Додати'}
                </>
              </motion.div>
            </AnimatePresence>
          </Combobox.Trigger>

          <Separator
            orientation="vertical"
            className={styles.HorizontalSeparator}
          />
          <ChipList selectedPeople={selectedPeople} />
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
              <Combobox.Status className={styles.Status}>
                {status}
              </Combobox.Status>
              <Combobox.Empty className={styles.Empty}>
                {searchValue.length >= 2 &&
                  !isSearching &&
                  searchResults.length === 0 &&
                  !error &&
                  'Нічого не знайдено'}
              </Combobox.Empty>
              <Combobox.List
                render={<ScrollArea.Viewport />}
                className={clsx(styles.List, {
                  [styles.Loading]: isSearching && searchResults.length > 0,
                })}
              >
                {(person: Person) => (
                  <Combobox.Item
                    key={person.id}
                    value={person}
                    className={styles.Item}
                  >
                    <div className={styles.ItemNameGroup}>
                      <span>{person.nameUkr}</span>
                      <span className={styles.ItemSubtitle}>
                        {person.nameLat}
                      </span>
                    </div>
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

function ChipList({ selectedPeople }: { selectedPeople: Person[] }) {
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
      {selectedPeople.map((person) => (
        <Combobox.Chip
          key={person.id}
          render={
            <motion.span layout={!shouldReduceMotion} {...chipAnimation} />
          }
          aria-label={person.nameUkr}
          className={styles.Chip}
        >
          {person.nameUkr}
          <Combobox.ChipRemove className={styles.RemoveBtn}>
            <X size={14} />
            <ClickTargetHelper />
            <VisuallyHidden>Видалити {person.nameUkr}</VisuallyHidden>
          </Combobox.ChipRemove>
        </Combobox.Chip>
      ))}
    </AnimatePresence>
  )
}
