import { Button, Progress } from '@base-ui/react'
import {
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import MotionButton from '../MotionButton'
import ShiftBy from '../ShiftBy'
import { Link } from '@tanstack/react-router'
import ClickTargetHelper from '../ClickTargetHelper'
import { Image } from '@unpic/react'
import { useHeroCarousel } from './use-hero-carousel'
import clsx from 'clsx'
import { createId } from '@paralleldrive/cuid2'
import styles from './HeroCarousel.module.scss'

const RADIUS = 13
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Демонстраційні дані слайдів
const SLIDES = [
  {
    id: createId(),
    title: 'Навіть потрапивши у жахи, мушу працювати',
    badge: 'Рекомендовано',
    rating: 'Оцінка 9.77',
    genre: 'Пригоди • Трилер',
    chapters: '27 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Got Dropped into a Ghost Story, Still Gotta Work-nhn10t69h0oac6lai7t1aq0e/background/cgq5gy5vffdolg8cttk09hea-7645d22c-2c92-4b04-9e1a-2a3e2c10d20e-1.webp',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Test-nhn10t69h0oac6lai7t1aq0e/cover/s4s64rz0qhfsmw09sc7vcmx0-d57181ac-c5bc-4b05-b3de-6e64cd2b42af.webp',
  },
  {
    id: createId(),
    title: 'Людина-бензопила',
    badge: 'Новинка на сайті',
    rating: 'Оцінка 9.42',
    genre: 'Бойовик •  Комедія',
    chapters: '5 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Chainsaw Man-oe6x4y28ov8q9bkcvp4ncca5/background/chainsaw-man-manga-anime-tatsuki-fujimoto-devil-hunters-denji-chainsaw-devil.png',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Chainsaw Man-oe6x4y28ov8q9bkcvp4ncca5/cover/csm.png',
  },
  {
    id: createId(),
    title: 'Всезнаючий читач',
    badge: 'Новий розділ',
    rating: 'Оцінка 9.79',
    genre: 'Бойовик • Пригоди',
    chapters: '127 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Omniscient%20Reader-gu62qsl5dkz3se9yxp5jbuoq/background/1362708.jpeg',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Omniscient Reader-gu62qsl5dkz3se9yxp5jbuoq/cover/w7n1hlpeg92gp2t2j9fxaqm8-omniscirent-reader-cover.webp',
  },
  {
    id: createId(),
    title: 'Милий Дім',
    badge: 'Популярне',
    rating: 'Оцінка 9.68',
    genre: 'Психологія • Трилер',
    chapters: '10 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Sweet Home-ndml1sz6tlwyu8m4thefn8vf/background/b2fp92tio7mmnzpr5aj5vnvy-0a50e960-ea80-4b75-8cbf-a9b940f8544d.webp',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Sweet Home-ndml1sz6tlwyu8m4thefn8vf/cover/m3433aluypfsd5o1pgx1vqti-1dfdf288-b0f7-4f0b-8e2a-0bb57324e0c0.webp',
  },
  {
    id: createId(),
    title: 'Навіть потрапивши у жахи, мушу працювати',
    badge: 'Рекомендовано',
    rating: 'Оцінка 9.77',
    genre: 'Пригоди • Трилер',
    chapters: '27 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Got Dropped into a Ghost Story, Still Gotta Work-nhn10t69h0oac6lai7t1aq0e/background/cgq5gy5vffdolg8cttk09hea-7645d22c-2c92-4b04-9e1a-2a3e2c10d20e-1.webp',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Test-nhn10t69h0oac6lai7t1aq0e/cover/s4s64rz0qhfsmw09sc7vcmx0-d57181ac-c5bc-4b05-b3de-6e64cd2b42af.webp',
  },
  {
    id: createId(),
    title: 'Людина-бензопила',
    badge: 'Новинка на сайті',
    rating: 'Оцінка 9.42',
    genre: 'Бойовик •  Комедія',
    chapters: '5 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Chainsaw Man-oe6x4y28ov8q9bkcvp4ncca5/background/chainsaw-man-manga-anime-tatsuki-fujimoto-devil-hunters-denji-chainsaw-devil.png',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Chainsaw Man-oe6x4y28ov8q9bkcvp4ncca5/cover/csm.png',
  },
  {
    id: createId(),
    title: 'Всезнаючий читач',
    badge: 'Новий розділ',
    rating: 'Оцінка 9.79',
    genre: 'Бойовик • Пригоди',
    chapters: '127 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Omniscient%20Reader-gu62qsl5dkz3se9yxp5jbuoq/background/1362708.jpeg',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Omniscient Reader-gu62qsl5dkz3se9yxp5jbuoq/cover/w7n1hlpeg92gp2t2j9fxaqm8-omniscirent-reader-cover.webp',
  },
  {
    id: createId(),
    title: 'Милий Дім',
    badge: 'Популярне',
    rating: 'Оцінка 9.68',
    genre: 'Психологія • Трилер',
    chapters: '10 розділів',
    bgImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Sweet Home-ndml1sz6tlwyu8m4thefn8vf/background/b2fp92tio7mmnzpr5aj5vnvy-0a50e960-ea80-4b75-8cbf-a9b940f8544d.webp',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Sweet Home-ndml1sz6tlwyu8m4thefn8vf/cover/m3433aluypfsd5o1pgx1vqti-1dfdf288-b0f7-4f0b-8e2a-0bb57324e0c0.webp',
  },
]

export default function HeroCarousel() {
  const {
    selectedIndex,
    progress,
    mainRef,
    thumbsRef,
    setIsPaused,
    scrollPrev,
    scrollNext,
    onThumbClick,
  } = useHeroCarousel()

  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  return (
    <>
      <div
        className={styles.HeroWrapper}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Верхня панель: Круговий таймер та кнопки навігації */}
        <div className={styles.TopControls}>
          <Progress.Root
            className={styles.ProgressRoot}
            value={progress}
            aria-label="Час до наступного слайду"
          >
            <svg className={styles.ProgressSvg} viewBox="0 0 32 32">
              <circle
                className={styles.ProgressTrack}
                cx="16"
                cy="16"
                r={RADIUS}
              />

              <circle
                className={styles.ProgressIndicator}
                cx="16"
                cy="16"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
          </Progress.Root>

          <div className={styles.NavButtonsGroup}>
            <MotionButton
              className={clsx(styles.NavBtn, 'Gradient')}
              onClick={scrollPrev}
            >
              <ShiftBy x={-1}>
                <ChevronLeftIcon />
              </ShiftBy>
              <VisuallyHidden>Гортати назад</VisuallyHidden>
              <ClickTargetHelper />
            </MotionButton>
            <MotionButton
              className={clsx(styles.NavBtn, 'Gradient')}
              onClick={scrollNext}
            >
              <ShiftBy x={1}>
                <ChevronRightIcon />
              </ShiftBy>
              <VisuallyHidden>Гортати вперед</VisuallyHidden>
              <ClickTargetHelper />
            </MotionButton>
          </div>
        </div>

        {/* Головний слайдер */}
        <div className={styles.MainViewport} ref={mainRef}>
          <div className={styles.MainContainer}>
            {SLIDES.map((slide, index) => {
              const isActive = index === selectedIndex
              return (
                <div className={styles.MainSlide} key={slide.id}>
                  <img
                    src={slide.bgImage}
                    alt={slide.title}
                    className={styles.BackgroundImage}
                  />
                  <div className={styles.BackdropGradient} />

                  <div className={styles.ContentOverlay}>
                    <div className={styles.MetaRow}>
                      <span className={styles.Badge}>
                        <ShiftBy y={1}>{slide.badge}</ShiftBy>
                      </span>

                      <ShiftBy y={1}>
                        <span className={styles.Rating}>
                          <span className={styles.StarIcon}>
                            <ShiftBy y={-1}>
                              <StarIcon size={14} />
                            </ShiftBy>
                          </span>{' '}
                          {slide.rating}
                        </span>
                      </ShiftBy>
                    </div>

                    <h1 className={styles.Title}>{slide.title}</h1>
                    <p className={styles.SubTitle}>
                      {slide.genre} • {slide.chapters}
                    </p>

                    <MotionButton
                      className={clsx(styles.GoToButton, 'Gradient')}
                      nativeButton={false}
                      tabIndex={isActive ? 0 : -1}
                      onFocus={() => setIsPaused(true)}
                      onBlur={() => setIsPaused(false)}
                      render={<Link to="/" />}
                    >
                      <ArrowUpRightIcon />
                      До твору
                    </MotionButton>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Слайдер мініатюр */}
        <div className={styles.ThumbsViewport} ref={thumbsRef}>
          <div className={styles.ThumbsContainer}>
            {SLIDES.map((slide, index) => {
              const isActive = index === selectedIndex
              return (
                <div key={slide.id} className={styles.ThumbSlideWrapper}>
                  <Button
                    data-active={isActive ? '' : undefined}
                    className={styles.ThumbSlide}
                    onClick={() => onThumbClick(index)}
                    tabIndex={-1}
                  >
                    <Image
                      layout="fullWidth"
                      src={slide.thumbImage}
                      alt={slide.title}
                    />
                    <div className={styles.ThumbGradient} />
                    <span className={styles.ThumbTitle}>{slide.title}</span>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
