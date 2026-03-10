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
  Search,
  Settings,
  Bookmark,
  Bell,
  MessageSquare,
} from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from '@/lib/theme-provider'
import { Accordion, Button, ScrollArea, Separator } from '@base-ui/react'
import { Link, linkOptions } from '@tanstack/react-router'
import { WorkType } from '@/generated/prisma/enums'
import useNestedMenuAnimation from './use-nested-menu-animation'
import Logo from '../Logo'
import VisuallyHidden from '../VisuallyHidden'
import { Image } from '@unpic/react'

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
    title: 'Користувачі',
    icon: User,
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
  const [isAuthed, setIsAuthed] = useState(true)

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
                  }}
                />
              }
            >
              <div className={styles.CloseSection}>
                <Logo />
                <Button
                  render={<Dialog.Close />}
                  className={clsx({
                    [styles.CloseButton]: true,
                    Gradient: true,
                  })}
                >
                  <VisuallyHidden>Закрити Вікно</VisuallyHidden>
                  <X size={24} />
                </Button>
              </div>
              <ScrollArea.Root className={styles.ScrollArea}>
                <ScrollArea.Viewport className={styles.Viewport}>
                  <ScrollArea.Content>
                    <div className={styles.TopSection}>
                      <div className={styles.FlexRow}>
                        <Button
                          onClick={toggleTheme}
                          className={styles.SecondaryButton}
                        >
                          {theme === 'system' && (
                            <>
                              <Clock size={20} />
                              <VisuallyHidden>Системний </VisuallyHidden>
                            </>
                          )}
                          {theme === 'light' && (
                            <>
                              <Sun size={20} />
                              <VisuallyHidden>Світлий </VisuallyHidden>
                            </>
                          )}
                          {theme === 'dark' && (
                            <>
                              <Moon size={20} />
                              <VisuallyHidden>Темний </VisuallyHidden>
                            </>
                          )}
                          <span className={styles.Text}>Режим</span>
                        </Button>
                        {isAuthed ? (
                          <Button className={styles.SecondaryButton}>
                            <Settings size={20} />
                            <span className={styles.Text}>Налаштування</span>
                          </Button>
                        ) : (
                          <Button className={styles.SecondaryButton}>
                            <Search size={20} />
                            <span className={styles.Text}>Пошук</span>
                          </Button>
                        )}
                      </div>
                      {isAuthed && (
                        <Button
                          style={{ marginTop: 'calc(var(--4px) * -1)' }}
                          className={styles.SecondaryButton}
                        >
                          <Search size={20} />
                          <span className={styles.Text}>Пошук</span>
                        </Button>
                      )}
                      {!isAuthed ? (
                        <Button
                          nativeButton={false}
                          render={<Link to="/signup" />}
                          className={clsx({
                            [styles.LoginButton]: true,
                            Gradient: true,
                          })}
                        >
                          <LogIn size={20} />
                          <span>Вхід | Реєстрація</span>
                        </Button>
                      ) : (
                        <div className={styles.UserCard}>
                          <Link
                            to="/about"
                            className={styles.UserAvatarWrapper}
                          >
                            <Image
                              className={styles.UserAvatar}
                              src="https://api.dicebear.com/9.x/glass/svg?seed=Blue"
                              layout="fullWidth"
                              alt="User Avatar"
                            />
                            <div className={styles.UserName}>Darmovys</div>
                          </Link>
                          <div className={styles.UserCardLinks}>
                            <Link to="/" className={styles.UserCardLink}>
                              <VisuallyHidden>Коментарі</VisuallyHidden>
                              <MessageSquare size={20} />
                            </Link>

                            <Link
                              to="/bookmarks"
                              className={styles.UserCardLink}
                            >
                              <VisuallyHidden>Закладки</VisuallyHidden>
                              <Bookmark size={20} />
                            </Link>
                            <Link
                              to="/notifications"
                              className={styles.UserCardLink}
                            >
                              <VisuallyHidden>Сповіщення</VisuallyHidden>
                              <Bell size={20} />
                            </Link>
                          </div>
                        </div>
                      )}
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
                                        <Button
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
                                <Button
                                  className={styles.BackButton}
                                  onClick={() => setShowInnerList(false)}
                                >
                                  <ArrowLeft size={18} />
                                </Button>
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
