import {
  offset,
  shift,
  useFloating,
  useFocus,
  useInteractions,
} from '@floating-ui/react'
import { createId } from '@paralleldrive/cuid2'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from '@tanstack/react-hotkeys'

export const SLIDES = [
  {
    id: createId(),
    title: 'Навіть потрапивши у жахи, мушу працювати',
    author: 'Пак Дек Су',
    chapterNumber: 27,
    chapterTitle: undefined,
    viewsCount: '2,4 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Test-nhn10t69h0oac6lai7t1aq0e/cover/s4s64rz0qhfsmw09sc7vcmx0-d57181ac-c5bc-4b05-b3de-6e64cd2b42af.webp',
  },
  {
    id: createId(),
    title: 'Людина-бензопила',
    author: 'Тацукі Фуджімото',
    chapterNumber: 5,
    chapterTitle: 'Спосіб пожмакати цицьки',
    viewsCount: '56,9 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Chainsaw Man-oe6x4y28ov8q9bkcvp4ncca5/cover/csm.png',
  },
  {
    id: createId(),
    title: 'Всезнаючий читач',
    author: 'Сінг Шонг',
    chapterNumber: 127,
    chapterTitle: 'Те, що можна змінити. Частина 2',
    viewsCount: '41,8 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Omniscient Reader-gu62qsl5dkz3se9yxp5jbuoq/cover/w7n1hlpeg92gp2t2j9fxaqm8-omniscirent-reader-cover.webp',
  },
  {
    id: createId(),
    title: 'Милий Дім',
    author: 'Кім Карнбі',
    chapterTitle: undefined,
    chapterNumber: 10,
    viewsCount: '52,2 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Sweet Home-ndml1sz6tlwyu8m4thefn8vf/cover/m3433aluypfsd5o1pgx1vqti-1dfdf288-b0f7-4f0b-8e2a-0bb57324e0c0.webp',
  },
  {
    id: createId(),
    title: 'Королева Драми',
    author: 'Кураку Ічікава',
    chapterTitle: 'Нудота',
    chapterNumber: 7,
    viewsCount: '3,9 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Drama Queen-lbuci5yas3r7yf70d6rrjjny/cover/lloia8hychy6u8oyk41049q7-1758475639_3.webp',
  },
  {
    id: createId(),
    title: 'Навіть потрапивши у жахи, мушу працювати',
    author: 'Пак Дек Су',
    chapterNumber: 27,
    chapterTitle: undefined,
    viewsCount: '2,4 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Test-nhn10t69h0oac6lai7t1aq0e/cover/s4s64rz0qhfsmw09sc7vcmx0-d57181ac-c5bc-4b05-b3de-6e64cd2b42af.webp',
  },
  {
    id: createId(),
    title: 'Людина-бензопила',
    author: 'Тацукі Фуджімото',
    chapterNumber: 5,
    chapterTitle: 'Спосіб пожмакати цицьки',
    viewsCount: '56,9 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Chainsaw Man-oe6x4y28ov8q9bkcvp4ncca5/cover/csm.png',
  },
  {
    id: createId(),
    title: 'Всезнаючий читач',
    author: 'Сінг Шонг',
    chapterNumber: 127,
    chapterTitle: 'Те, що можна змінити. Частина 2',
    viewsCount: '41,8 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Omniscient Reader-gu62qsl5dkz3se9yxp5jbuoq/cover/w7n1hlpeg92gp2t2j9fxaqm8-omniscirent-reader-cover.webp',
  },
  {
    id: createId(),
    title: 'Милий Дім',
    author: 'Кім Карнбі',
    chapterTitle: undefined,
    chapterNumber: 10,
    viewsCount: '52,2 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Sweet Home-ndml1sz6tlwyu8m4thefn8vf/cover/m3433aluypfsd5o1pgx1vqti-1dfdf288-b0f7-4f0b-8e2a-0bb57324e0c0.webp',
  },
  {
    id: createId(),
    title: 'Королева Драми',
    author: 'Кураку Ічікава',
    chapterTitle: 'Нудота',
    chapterNumber: 7,
    viewsCount: '3,9 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Drama Queen-lbuci5yas3r7yf70d6rrjjny/cover/lloia8hychy6u8oyk41049q7-1758475639_3.webp',
  },
  {
    id: createId(),
    title: 'Навіть потрапивши у жахи, мушу працювати',
    author: 'Пак Дек Су',
    chapterNumber: 27,
    chapterTitle: undefined,
    viewsCount: '2,4 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Test-nhn10t69h0oac6lai7t1aq0e/cover/s4s64rz0qhfsmw09sc7vcmx0-d57181ac-c5bc-4b05-b3de-6e64cd2b42af.webp',
  },
  {
    id: createId(),
    title: 'Людина-бензопила',
    author: 'Тацукі Фуджімото',
    chapterNumber: 5,
    chapterTitle: 'Спосіб пожмакати цицьки',
    viewsCount: '56,9 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Chainsaw Man-oe6x4y28ov8q9bkcvp4ncca5/cover/csm.png',
  },
  {
    id: createId(),
    title: 'Всезнаючий читач',
    author: 'Сінг Шонг',
    chapterNumber: 127,
    chapterTitle: 'Те, що можна змінити. Частина 2',
    viewsCount: '41,8 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Omniscient Reader-gu62qsl5dkz3se9yxp5jbuoq/cover/w7n1hlpeg92gp2t2j9fxaqm8-omniscirent-reader-cover.webp',
  },
  {
    id: createId(),
    title: 'Милий Дім',
    author: 'Кім Карнбі',
    chapterTitle: undefined,
    chapterNumber: 10,
    viewsCount: '52,2 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Sweet Home-ndml1sz6tlwyu8m4thefn8vf/cover/m3433aluypfsd5o1pgx1vqti-1dfdf288-b0f7-4f0b-8e2a-0bb57324e0c0.webp',
  },
  {
    id: createId(),
    title: 'Королева Драми',
    author: 'Кураку Ічікава',
    chapterTitle: 'Нудота',
    chapterNumber: 7,
    viewsCount: '3,9 тис.',
    thumbImage:
      import.meta.env.VITE_STORAGE_URL +
      'uploads/titles/Drama Queen-lbuci5yas3r7yf70d6rrjjny/cover/lloia8hychy6u8oyk41049q7-1758475639_3.webp',
  },
]

export function useTitlesUpdates() {
  const [isEntered, setIsEntered] = useState(false) // Чи здійснений вхід у секцію оновлень
  const [isFocused, setIsFocused] = useState(false) // Чи наведений фокус на секцію оновлень
  const [isPrevButtonDisabled, setIsPrevButtonDisabled] = useState(true)
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true)

  const prevBtnRef = useRef<HTMLButtonElement>(null) // Посилання на кнопку "Гортати назад"
  const nextBtnRef = useRef<HTMLButtonElement>(null) // Посилання на кнопку "Гортати вперед"
  const wrapperRef = useRef<HTMLDivElement>(null) // Посилання на секцію оновлень
  const lastSlideRef = useRef<HTMLElement>(null) // Посилання на останній слайд
  const slideRefs = useRef<(HTMLElement | null)[]>([]) // Посилання на слайди

  const [titlesRef, titlesApi] = useEmblaCarousel({
    containScroll: 'trimSnaps', // При перемиканні кнопками, не довзоляти першому слайду відображатися лише на частину
    dragFree: true, // Перетягування без фіксованого переміщення
    align: 'start',
    inViewThreshold: 0.9, // Якщо слайд видно на 90%, то він вважається видимим
    slidesToScroll: 2, // При перемиканні кнопками, два слайди перемикаються за раз
    // Чим більше простору, тим більше слайдів перемикаються за раз
    breakpoints: {
      '(min-width: 480px)': { slidesToScroll: 3 },
      '(min-width: 635px)': { slidesToScroll: 4 },
      '(min-width: 930px)': { slidesToScroll: 5 },
      '(min-width: 1160px)': { slidesToScroll: 6 },
      '(min-width: 1330px)': { slidesToScroll: 7 },
      '(min-width: 1500px)': { slidesToScroll: 8 },
    },
  })

  useHotkeys([
    // Вхід в секцію оновлень через клавішу Enter
    {
      hotkey: 'Enter',
      callback: () => {
        setIsEntered(true)
        prevBtnRef.current?.focus()
      },
      options: {
        target: wrapperRef,
        enabled: !isEntered,
      },
    },
    // Вихід із секції оновлень через клавішу Esc
    {
      hotkey: 'Escape',
      callback: () => {
        setIsEntered(false)
        wrapperRef.current?.focus()
      },
      options: {
        target: wrapperRef,
        enabled: isEntered,
      },
    },
    // Вихід із секції оновлень комбінацією клавіш Shift+Tab на кнопці "Гортати назад"
    {
      hotkey: 'Shift+Tab',
      callback: () => {
        setIsEntered(false)
        wrapperRef.current?.focus()
      },
      options: {
        target: prevBtnRef,
        enabled: isEntered,
      },
    },
    // Вихід із секції оновлень при переході з останнього слайду через клавішу Tab
    {
      hotkey: 'Tab',
      callback: () => {
        setIsEntered(false)
        wrapperRef.current?.focus()
      },
      options: {
        target: lastSlideRef,
        enabled: isEntered,
      },
    },
    // Фокус на першому видимому слайді при переході з кнопки "Гортати вперед" через клавішу Tab
    {
      hotkey: 'Tab',
      callback: () => {
        const firstVisibleIndex = titlesApi?.slidesInView()[0] ?? 0
        slideRefs.current[firstVisibleIndex]?.focus()
      },
      options: {
        target: nextBtnRef,
        enabled: isEntered,
      },
    },
  ])

  // Повернення стану isEntered на false, якщо дія здійснилася за межами секції оновлень
  const handleWrapperBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsEntered(false)
    }
  }

  // Вимкнення кнопок навігації за умови досягення відповідних меж
  const toggleButtonsDisabled = useCallback(() => {
    if (!titlesApi) return
    setIsPrevButtonDisabled(!titlesApi.canScrollPrev())
    setIsNextButtonDisabled(!titlesApi.canScrollNext())
  }, [titlesApi])

  // Гортання каруселі вперед
  const scrollPrev = useCallback(
    () => titlesApi && titlesApi.scrollPrev(),
    [titlesApi],
  )

  // Гортання каруселі назад
  const scrollNext = useCallback(
    () => titlesApi && titlesApi.scrollNext(),
    [titlesApi],
  )

  // Синхронізація стан кнопок навігації зі станом каруселі Embla
  useEffect(() => {
    if (!titlesApi) return
    toggleButtonsDisabled()

    titlesApi.on('reInit', toggleButtonsDisabled)
    titlesApi.on('select', toggleButtonsDisabled)

    return () => {
      titlesApi.off('reInit', toggleButtonsDisabled)
      titlesApi.off('select', toggleButtonsDisabled)
    }
  }, [titlesApi, toggleButtonsDisabled])

  // Налаштування клавіатурної підказки через хук useFloating
  const {
    refs: tooltipRefs,
    floatingStyles: tooltipStyles,
    context,
  } = useFloating({
    open: isFocused,
    onOpenChange: setIsFocused,
    // Елемент, до якого прикріплюється підказка
    elements: { reference: wrapperRef.current },
    // Підказка з'являється у лівому верхньому куті
    placement: 'top-start',
    // Відступ від елемента в 10px та інвертування позиції на протилежну в разі нестачі місця
    middleware: [offset(10), shift({ crossAxis: true })],
  })

  // Підказка викликається лише коли навігація відбувається за допомогою клавіатури
  const focus = useFocus(context, {
    visibleOnly: true,
  })

  // Пропси, які необхідно передати елементу прикріплення та підказці для роботи бібліотеки
  const { getReferenceProps, getFloatingProps: getTooltipProps } =
    useInteractions([focus])

  return {
    isFocused,
    isEntered,
    titlesRef,
    wrapperRef,
    prevBtnRef,
    nextBtnRef,
    lastSlideRef,
    slideRefs,
    tooltipRefs,
    getReferenceProps,
    getTooltipProps,
    tooltipStyles,
    isPrevButtonDisabled,
    isNextButtonDisabled,
    handleWrapperBlur,
    scrollPrev,
    scrollNext,
  }
}
