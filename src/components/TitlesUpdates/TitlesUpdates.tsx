import { Button } from '@base-ui/react'
import { Image } from '@unpic/react'
import { ChevronLeftIcon, ChevronRightIcon, HashIcon } from 'lucide-react'
import MotionButton from '../MotionButton'
import ShiftBy from '../ShiftBy'
import VisuallyHidden from '../VisuallyHidden'
import ClickTargetHelper from '../ClickTargetHelper'
import { SLIDES, useTitlesUpdates } from './use-titles-updates'
import clsx from 'clsx'
import styles from './TitlesUpdates.module.scss'

function TitlesUpdates() {
  const {
    isFocused,
    isEntered,
    titlesRef,
    wrapperRef,
    prevBtnRef,
    slideRefs,
    tooltipRefs,
    getTooltipProps,
    getReferenceProps,
    tooltipStyles,
    isPrevButtonDisabled,
    isNextButtonDisabled,
    handleWrapperKeyDown,
    handleWrapperBlur,
    handlePrevBtnKeyDown,
    handleNextBtnKeyDown,
    handleSlideKeyDown,
    scrollPrev,
    scrollNext,
  } = useTitlesUpdates()

  function enterHelper() {
    return (
      <>
        Натисніть <span className={styles.Hotkey}>↵ Enter</span> для навігації
        по списку
      </>
    )
  }

  function escapeHelper() {
    return (
      <>
        Натисніть <span className={styles.Hotkey}>Esc</span> для виходу зі
        списку
      </>
    )
  }

  return (
    <div className={styles.UpdatesWrapper}>
      <h2 className={styles.Heading}>Останні оновлення</h2>
      {isFocused && (
        <div
          ref={tooltipRefs.setFloating}
          {...getTooltipProps()}
          style={{ ...tooltipStyles }}
          className={styles.KeyboardHelp}
          id="keyboard-help"
          role="tooltip"
          aria-live="polite"
        >
          {isEntered ? escapeHelper() : enterHelper()}
        </div>
      )}
      <div
        ref={wrapperRef}
        {...getReferenceProps({ onBlur: handleWrapperBlur })}
        tabIndex={isEntered ? -1 : 0}
        onKeyDown={handleWrapperKeyDown}
        role="region"
        aria-label="Секція останніх оновлень. Натисніть Enter, щоб увійти"
        className={styles.UpdatesCarousel}
      >
        <div className={styles.Controls}>
          <MotionButton
            ref={prevBtnRef}
            className={clsx(styles.NavBtn, 'Gradient')}
            onClick={scrollPrev}
            onKeyDownCapture={handlePrevBtnKeyDown}
            disabled={isPrevButtonDisabled}
            focusableWhenDisabled={true}
            tabIndex={isEntered ? 0 : -1} // Доступні лише всередині секції
          >
            <ChevronLeftIcon />
            <VisuallyHidden>Гортати назад</VisuallyHidden>
            <ClickTargetHelper />
          </MotionButton>
          <MotionButton
            className={clsx(styles.NavBtn, 'Gradient')}
            onClick={scrollNext}
            onKeyDownCapture={handleNextBtnKeyDown}
            disabled={isNextButtonDisabled}
            focusableWhenDisabled={true}
            tabIndex={isEntered ? 0 : -1}
          >
            <ChevronRightIcon />
            <VisuallyHidden>Гортати вперед</VisuallyHidden>
            <ClickTargetHelper />
          </MotionButton>
        </div>
        <div className={styles.Viewport} ref={titlesRef}>
          <div className={styles.Container}>
            {SLIDES.map((t, index) => {
              return (
                <div key={t.id} className={styles.Slide}>
                  <Button
                    ref={(el) => {
                      slideRefs.current[index] = el
                    }}
                    className={styles.Card}
                    tabIndex={isEntered ? 0 : -1} // Фокусується лише після натискання enter
                    onKeyDown={(e) => handleSlideKeyDown(e, index)}
                  >
                    <Image
                      layout="fullWidth"
                      src={t.thumbImage}
                      alt={t.title}
                    />

                    <div className={styles.HoverOverlay}>
                      <span className={styles.OverlayTitle}>{t.title}</span>
                      <span className={styles.OverlayAuthor}>{t.author}</span>
                      <span className={styles.OverlayBadge}>
                        <HashIcon size={14} />
                        <ShiftBy y={1}>{t.chapterNumber}</ShiftBy>
                      </span>
                      <span className={styles.OverlayChapterTitle}>
                        {t.chapterTitle}
                      </span>
                      <span className={styles.OverlayViews}>
                        {t.viewsCount} переглядів
                      </span>
                    </div>
                  </Button>

                  <div className={styles.SlideMeta}>
                    <span className={styles.SlideTitle}>{t.title}</span>
                    <div className={styles.SlideInfoRow}>
                      <span className={styles.SlideChapter}>
                        <ShiftBy y={-0.3}>
                          <HashIcon size={12} />
                        </ShiftBy>
                        {t.chapterNumber}
                      </span>
                      <span className={styles.SlideViews}>{t.viewsCount}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TitlesUpdates
