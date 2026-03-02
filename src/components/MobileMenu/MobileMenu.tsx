import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import {
  motion,
  AnimatePresence,
  type Variants,
  useReducedMotion,
} from 'motion/react'
import styles from './MobileMenu.module.scss'
import {
  Sun,
  Moon,
  Clock,
  LogIn,
  X,
  ChevronDown,
  Layers,
  Users,
  Pencil,
  Palette,
  User,
  Newspaper,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from '@/lib/theme-provider'
import { Accordion, ScrollArea, Separator } from '@base-ui/react'
import { Link, linkOptions } from '@tanstack/react-router'
import { WorkType } from '@/generated/prisma/enums'
import useNestedMenuAnimation from './use-nested-menu-animation'

const WORK_TYPE_TITLES: Record<WorkType, string> = {
  [WorkType.MANGA]: 'Манга',
  [WorkType.MANHWA]: 'Манхва',
  [WorkType.MANHUA]: 'Маньхва',
  [WorkType.MALOPUS]: 'Мальопис',
  [WorkType.COMIC]: 'Комікс',
  [WorkType.WEBCOMIC]: 'Вебкомікс',
}

const catalogLinks = linkOptions([
  {
    title: 'Твори',
    icon: Layers,
    to: '/catalog',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Команди',
    icon: Users,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Автори',
    icon: Pencil,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Художники',
    icon: Palette,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
  {
    title: 'Користувачі',
    icon: User,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
])

const otherLinks = linkOptions([
  {
    title: 'Новини',
    icon: Newspaper,
    to: '/about',
    activeOptions: {
      exact: false,
    },
  },
])

const innerLinks = linkOptions(
  Object.entries(WORK_TYPE_TITLES).map(([type, title]) => ({
    title,
    to: '/catalog',
    search: {
      types: [type as WorkType],
    },
  })),
)

const outerListVariants: Variants = {
  hidden: { opacity: 0, x: -10, transition: { duration: 0.1 } },
  visible: { opacity: 1, x: 0, transition: { duration: 0.1 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.1 } },
}

const innerListVariants: Variants = {
  hidden: { opacity: 0, x: 10, transition: { duration: 0.1 } },
  visible: { opacity: 1, x: 0, transition: { duration: 0.1 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.1 } },
}

type MobileMenuProps = {
  trigger: (open: () => void) => React.ReactNode
}

export default function MobileMenu({ trigger }: MobileMenuProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const {
    showInnerList,
    setShowInnerList,
    isMotionAllowed,
    setIsMotionAllowed,
    handleAccordionOpenChange,
  } = useNestedMenuAnimation()

  return (
    <Dialog.Root open={showMobileMenu} onOpenChange={setShowMobileMenu}>
      {trigger(() => setShowMobileMenu(true))}
      <AnimatePresence>
        {showMobileMenu && (
          <Dialog.Portal keepMounted={true}>
            <Dialog.Backdrop
              onClick={() => setShowMobileMenu(false)}
              className={styles.Overlay}
              render={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              }
            />
            <Dialog.Popup
              finalFocus={false}
              initialFocus={false}
              className={styles.Content}
              render={
                <motion.div
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? '0%' : '100%',
                  }}
                  animate={{
                    opacity: 1,
                    y: '0%',
                    transition: { ease: 'easeOut' },
                  }}
                  exit={{
                    opacity: 0,
                    y: shouldReduceMotion ? '0%' : '100%',
                    transition: { ease: 'easeIn' },
                  }}
                  transition={{
                    duration: 0.2,
                    // ease: 'easeInOut',
                  }}
                />
              }
            >
              <div className={styles.CloseSection}>
                <div className={styles.Logo}>
                  <span>Моя</span> <span>Манга</span>
                </div>
                <Dialog.Close
                  className={clsx({
                    [styles.CloseButton]: true,
                    Gradient: true,
                  })}
                >
                  <X size={24} />
                </Dialog.Close>
              </div>
              <ScrollArea.Root className={styles.ScrollArea}>
                <ScrollArea.Viewport className={styles.Viewport}>
                  <ScrollArea.Content>
                    <div className={styles.TopSection}>
                      <button
                        onClick={toggleTheme}
                        className={styles.ThemeButton}
                      >
                        {theme === 'system' && (
                          <>
                            <Clock />
                            <span className={styles.Text}>
                              Режим «Системний»
                            </span>
                          </>
                        )}
                        {theme === 'light' && (
                          <>
                            <Sun />
                            <span className={styles.Text}>Режим «Сяйво»</span>
                          </>
                        )}
                        {theme === 'dark' && (
                          <>
                            <Moon />
                            <span className={styles.Text}>Режим «Пітьма»</span>
                          </>
                        )}
                      </button>
                      <button
                        className={clsx({
                          [styles.LoginButton]: true,
                          Gradient: true,
                        })}
                      >
                        <LogIn size={24} />
                        <span>Увійти | Зареєструватися</span>
                      </button>
                    </div>
                    <Separator
                      orientation="horizontal"
                      className={styles.Separator}
                    />
                    <Accordion.Root className={styles.Accordion}>
                      <Accordion.Item
                        className={styles.AccordionItem}
                        onOpenChange={handleAccordionOpenChange}
                      >
                        <Accordion.Header>
                          <Accordion.Trigger
                            className={styles.AccordionTrigger}
                          >
                            Каталог
                            <ChevronDown
                              className={styles.ChevronDown}
                              size={24}
                            />
                          </Accordion.Trigger>
                        </Accordion.Header>

                        <Accordion.Panel
                          className={styles.AccordionPanel}
                          /* по завершенню звичайної анімації появи елементів (fadeIn), 
                            використовуй анімацію motion для переключення
                            між внутрішнім та зовнішнім списком */
                          onAnimationEnd={() => setIsMotionAllowed(true)}
                        >
                          <AnimatePresence mode="wait">
                            {!showInnerList ? (
                              <motion.div
                                key="outer-list"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                // Даємо можливість вперше програти звичайну анімацію fadeIn
                                variants={
                                  isMotionAllowed && !shouldReduceMotion
                                    ? outerListVariants
                                    : undefined
                                }
                              >
                                {catalogLinks.map((item) => {
                                  if (item.title === 'Твори') {
                                    return (
                                      <div
                                        key={item.title}
                                        style={{ position: 'relative' }}
                                      >
                                        <Link
                                          activeProps={{
                                            className: styles.Active,
                                          }}
                                          activeOptions={item.activeOptions}
                                          to={item.to}
                                          className={styles.AccordionLink}
                                          onClick={() =>
                                            setShowMobileMenu(false)
                                          }
                                        >
                                          <item.icon size={16} />
                                          <span>{item.title}</span>
                                          <ChevronRight
                                            style={{ marginLeft: 'auto' }}
                                            size={16}
                                          />
                                        </Link>
                                        <button
                                          onClick={() => setShowInnerList(true)}
                                          className={styles.ChevronRightButton}
                                        />
                                      </div>
                                    )
                                  } else
                                    return (
                                      <Link
                                        key={item.title}
                                        activeProps={{
                                          className: styles.Active,
                                        }}
                                        to={item.to}
                                        className={styles.AccordionLink}
                                        onClick={() => setShowMobileMenu(false)}
                                      >
                                        <item.icon size={16} />
                                        <span>{item.title}</span>
                                      </Link>
                                    )
                                })}
                              </motion.div>
                            ) : (
                              <motion.div
                                key="inner-list"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                // Даємо можливість вперше програти звичайну анімацію fadeIn
                                variants={
                                  isMotionAllowed && !shouldReduceMotion
                                    ? innerListVariants
                                    : undefined
                                }
                              >
                                <button
                                  className={styles.BackButton}
                                  onClick={() => setShowInnerList(false)}
                                >
                                  <ArrowLeft size={18} />
                                </button>
                                {innerLinks.map((item) => (
                                  <Link
                                    key={item.title}
                                    to={item.to}
                                    search={item.search}
                                    className={styles.AccordionLink}
                                    onClick={() => setShowMobileMenu(false)}
                                  >
                                    <span>{item.title}</span>
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item className={styles.AccordionItem}>
                        <Accordion.Header>
                          <Accordion.Trigger
                            className={styles.AccordionTrigger}
                          >
                            Інше
                            <ChevronDown
                              className={styles.ChevronDown}
                              size={24}
                            />
                          </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Panel className={styles.AccordionPanel}>
                          {otherLinks.map((item) => (
                            <Link
                              activeProps={{ className: styles.Active }}
                              to={item.to}
                              className={styles.AccordionLink}
                              key={item.title}
                            >
                              <item.icon size={16} />
                              <span>{item.title}</span>
                            </Link>
                          ))}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion.Root>
                  </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar className={styles.Scrollbar}>
                  <ScrollArea.Thumb className={styles.Thumb} />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </Dialog.Popup>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
