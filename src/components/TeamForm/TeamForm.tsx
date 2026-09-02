import {
  ArrowLeft,
  Asterisk,
  ChevronUp,
  CircleAlert,
  Info,
  Link,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { Image } from '@unpic/react'
import { Accordion, Button, Field } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import { AnimatePresence, motion } from 'motion/react'
import CropImageDialog from '../CropImageDialog'
import clsx from 'clsx'
import { LinkType } from '@/generated/prisma/enums'
import MotionButton, { tapAnimation } from '../MotionButton'
import MobileNavigation from '../MobileNavigation'
import { produce } from 'immer'
import { createId } from '@paralleldrive/cuid2'
import { LinkInputField } from './LinkInputField'
import { useTeamForm } from './use-team-form'
import HelperDialog from '../HelperDialog'
import { HelperData, useHelperDialog } from '@/hooks/use-helper-dialog'
import { useGoBack } from '@/hooks/use-go-back'
import { LINK_META } from '@/lib/constants'
import Tooltip from '../Tooltip'
import { TeamEditData } from '@/services/queries'
import styles from './TeamForm.module.scss'

const MAX_DESCRIPTION_LENGTH = 500

interface TeamFormProps {
  initialData?: TeamEditData
  helperData?: HelperData
  helperStorageKey?: string
  isEditMode?: boolean
}

function TeamForm({
  initialData,
  helperData,
  helperStorageKey,
  isEditMode = false,
}: TeamFormProps) {
  const {
    cover,
    background,
    form,
    handleClearForm,
    handleLinksPresence,
    hasAccordionAnimationFinished,
    setHasAccordionAnimationFinished,
    isOverflowVisible,
    isLinksSectionShown,
    setIsLinksSectionShown,
    isUploading,
  } = useTeamForm(initialData, isEditMode)

  const { handleGoBack } = useGoBack()
  const helper = useHelperDialog(helperStorageKey, helperData)

  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>
          {isEditMode ? 'Редагування команди' : 'Створення команди'}
        </h1>
        {helper && (
          <HelperDialog
            title={helper.title}
            content={helper.content}
            mdast={helper.mdast}
            open={helper.isHelperOpen}
            onOpenChange={helper.handleHelperOpenChange}
            trigger={(openDialog) => (
              <Button onClick={openDialog} className={styles.InfoButton}>
                <ClickTargetHelper />
                <Info size={20} />
                <VisuallyHidden>Довідка</VisuallyHidden>
              </Button>
            )}
          />
        )}
      </div>
      <div className={styles.Wrapper}>
        <div className={styles.Content}>
          <div className={styles.ContentHeaderWrapper}>
            <h1 className={styles.ContentTitle}>
              {isEditMode ? 'Редагування команди' : 'Створення команди'}
            </h1>
            {helper && (
              <HelperDialog
                title={helper.title}
                content={helper.content}
                mdast={helper.mdast}
                open={helper.isHelperOpen}
                onOpenChange={helper.handleHelperOpenChange}
                trigger={(openDialog) => (
                  <Button onClick={openDialog} className={styles.HelperButton}>
                    <Info size={16} />
                    <span>Довідка</span>
                  </Button>
                )}
              />
            )}
          </div>
          {initialData?.moderationFeedback && (
            <>
              <span className={styles.Label}>Коментар від модератора</span>
              <div className={styles.ModerationFeedback}>
                {initialData.moderationFeedback}
              </div>
            </>
          )}
          <form
            className={styles.Form}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field
              name="coverKey"
              children={(field) => {
                const currentCoverKey = field.state.value

                const hasNewCover = Boolean(cover.fileState?.objectUrl)

                const hasOriginalCover =
                  !cover.fileState &&
                  Boolean(initialData?.coverUrl) &&
                  currentCoverKey === initialData?.coverUrl

                const shouldShowPreview = hasNewCover || hasOriginalCover

                const shouldShowTrashButton =
                  !hasNewCover || !cover.fileState!.uploading

                const shouldShowUploadProgress =
                  hasNewCover &&
                  cover.fileState!.uploading &&
                  !cover.fileState!.isDeleting

                const shouldShowUploadError =
                  hasNewCover &&
                  !cover.fileState!.uploading &&
                  !cover.fileState!.isDeleting &&
                  Boolean(cover.fileState!.error)

                return (
                  <Field.Root
                    invalid={
                      !field.state.meta.isValid &&
                      form.state.submissionAttempts > 0
                    }
                  >
                    <Field.Label
                      nativeLabel={false}
                      render={<span />}
                      className={styles.Label}
                    >
                      Обкладинка
                      <Tooltip
                        className={styles.RedTooltip}
                        text="Обов'язкове поле"
                        align="start"
                      >
                        <Asterisk size={14} />
                      </Tooltip>
                    </Field.Label>

                    <div className={styles.UploadCoverWrapper}>
                      {!shouldShowPreview && (
                        <motion.div
                          {...tapAnimation}
                          {...cover.getRootProps({
                            role: 'button',
                            'aria-label': 'drag and drop area',
                          })}
                          className={styles.UploadZone}
                          data-drag-active={cover.isDragActive}
                        >
                          <input {...cover.getInputProps()} />
                          <UploadCloud size={20} />
                          <span>Завантажте</span>
                          <span>фото</span>

                          <svg
                            className={styles.UploadZoneBorder}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect className={styles.Rectangle} />
                          </svg>
                        </motion.div>
                      )}

                      {shouldShowPreview && (
                        <div className={styles.UploadedCover}>
                          <Image
                            layout="fullWidth"
                            alt="Обкладинка команди"
                            src={
                              hasNewCover
                                ? cover.fileState!.objectUrl!
                                : `${import.meta.env.VITE_STORAGE_URL}${initialData!.coverUrl}`
                            }
                            draggable={false}
                          />

                          {shouldShowUploadProgress && (
                            <div className={styles.Overlay}>
                              {cover.fileState!.progress}%
                            </div>
                          )}

                          {shouldShowUploadError && (
                            <div className={styles.Overlay}>
                              <CircleAlert className={styles.Error} size={30} />
                            </div>
                          )}

                          {shouldShowTrashButton && (
                            <div className={styles.TrashButtonWrapper}>
                              <MotionButton
                                focusableWhenDisabled={true}
                                disabled={
                                  hasNewCover
                                    ? cover.fileState!.isDeleting || isUploading
                                    : isUploading
                                }
                                onClick={() => {
                                  if (hasNewCover) {
                                    cover.removeFile()
                                  } else {
                                    field.handleChange(null)
                                  }
                                }}
                                className={styles.TrashButton}
                              >
                                <ClickTargetHelper />
                                {hasNewCover && cover.fileState!.isDeleting ? (
                                  <>
                                    <LoaderCircle
                                      className={styles.Loader}
                                      size={16}
                                    />
                                    <VisuallyHidden>
                                      Видаляємо зображення
                                    </VisuallyHidden>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={16} />
                                    <VisuallyHidden>
                                      Видалити зображення
                                    </VisuallyHidden>
                                  </>
                                )}
                              </MotionButton>
                            </div>
                          )}
                        </div>
                      )}
                      <AnimatePresence>
                        {cover.imageToCrop && cover.cropImageUrl && (
                          <CropImageDialog
                            src={cover.cropImageUrl}
                            originalName={cover.imageToCrop.name}
                            fileType={cover.imageToCrop.type}
                            originalFile={cover.imageToCrop}
                            croppedWidth={cover.croppedWidth}
                            croppedHeight={cover.croppedHeight}
                            onCropped={(file) => {
                              if (!file) return
                              cover.uploadFile(file)
                            }}
                            onClose={() => {
                              cover.setImageToCrop(null)
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </Field.Root>
                )
              }}
            />

            <form.Field
              name="backgroundKey"
              children={(field) => {
                const currentBackgroundKey = field.state.value

                const hasNewBackground = Boolean(
                  background.fileState?.objectUrl,
                )

                const hasOriginalBackground =
                  !background.fileState &&
                  Boolean(initialData?.backgroundUrl) &&
                  currentBackgroundKey === initialData?.backgroundUrl

                const shouldShowPreview =
                  hasNewBackground || hasOriginalBackground

                const shouldShowTrashButton =
                  !hasNewBackground || !background.fileState!.uploading

                const shouldShowUploadProgress =
                  hasNewBackground &&
                  background.fileState!.uploading &&
                  !background.fileState!.isDeleting

                const shouldShowUploadError =
                  hasNewBackground &&
                  !background.fileState!.uploading &&
                  !background.fileState!.isDeleting &&
                  Boolean(background.fileState!.error)

                return (
                  <Field.Root
                    invalid={
                      !field.state.meta.isValid &&
                      form.state.submissionAttempts > 0
                    }
                  >
                    <Field.Label
                      nativeLabel={false}
                      render={<span />}
                      className={styles.Label}
                    >
                      Фонове зображення
                    </Field.Label>
                    <div className={styles.UploadBackgroundWrapper}>
                      {!shouldShowPreview && (
                        <motion.div
                          {...tapAnimation}
                          {...background.getRootProps({
                            role: 'button',
                            'aria-label': 'drag and drop area',
                          })}
                          className={styles.UploadZone}
                          data-drag-active={background.isDragActive}
                        >
                          <input {...background.getInputProps()} />
                          <UploadCloud size={20} />
                          <span>Завантажте</span>
                          <span>фото</span>

                          <svg
                            className={styles.UploadZoneBorder}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect className={styles.Rectangle} />
                          </svg>
                        </motion.div>
                      )}

                      {shouldShowPreview && (
                        <div className={styles.UploadedCover}>
                          <Image
                            layout="fullWidth"
                            alt="Фонове зображення команди"
                            src={
                              hasNewBackground
                                ? background.fileState!.objectUrl!
                                : `${import.meta.env.VITE_STORAGE_URL}${initialData!.backgroundUrl}`
                            }
                            draggable={false}
                          />

                          {shouldShowUploadProgress && (
                            <div className={styles.Overlay}>
                              {background.fileState!.progress}%
                            </div>
                          )}

                          {shouldShowUploadError && (
                            <div className={styles.Overlay}>
                              <CircleAlert className={styles.Error} size={30} />
                            </div>
                          )}

                          {shouldShowTrashButton && (
                            <div className={styles.TrashButtonWrapper}>
                              <MotionButton
                                className={styles.TrashButton}
                                focusableWhenDisabled={true}
                                disabled={
                                  hasNewBackground
                                    ? background.fileState!.isDeleting ||
                                      background.fileState!.uploading ||
                                      background.fileState!
                                        .isExtractingAccentColor ||
                                      isUploading
                                    : isUploading
                                }
                                onClick={() => {
                                  if (hasNewBackground) {
                                    background.removeFile()
                                  } else {
                                    field.handleChange(null)
                                  }
                                }}
                              >
                                <ClickTargetHelper />
                                {hasNewBackground &&
                                background.fileState!.isDeleting ? (
                                  <>
                                    <LoaderCircle
                                      className={styles.Loader}
                                      size={16}
                                    />
                                    <VisuallyHidden>
                                      Видаляємо зображення
                                    </VisuallyHidden>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 size={16} />
                                    <VisuallyHidden>
                                      Видалити зображення
                                    </VisuallyHidden>
                                  </>
                                )}
                              </MotionButton>
                            </div>
                          )}
                        </div>
                      )}
                      <AnimatePresence>
                        {background.imageToCrop && background.cropImageUrl && (
                          <CropImageDialog
                            src={background.cropImageUrl}
                            originalName={background.imageToCrop.name}
                            fileType={background.imageToCrop.type}
                            originalFile={background.imageToCrop}
                            croppedWidth={background.croppedWidth}
                            croppedHeight={background.croppedHeight}
                            onCropped={(file) => {
                              if (!file) return
                              background.uploadFile(file)
                            }}
                            onClose={() => {
                              background.setImageToCrop(null)
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </Field.Root>
                )
              }}
            />

            <form.Field
              name="title"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <Field.Label htmlFor={field.name} className={styles.Label}>
                    Назва
                    <Tooltip
                      className={styles.RedTooltip}
                      text="Обов'язкове поле"
                      align="start"
                    >
                      <Asterisk size={14} />
                    </Tooltip>
                  </Field.Label>
                  <Field.Control
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="off"
                    className={styles.FieldInput}
                  />
                </Field.Root>
              )}
            />

            <form.Field
              name="description"
              children={(field) => {
                const remainingSymbols =
                  MAX_DESCRIPTION_LENGTH - field.state.value.length

                return (
                  <Field.Root
                    name={field.name}
                    invalid={!field.state.meta.isValid}
                    dirty={field.state.meta.isDirty}
                    touched={field.state.meta.isTouched}
                  >
                    <Field.Label htmlFor={field.name} className={styles.Label}>
                      Опис
                    </Field.Label>
                    <Field.Control
                      render={<textarea />}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
                          field.handleChange(e.target.value)
                        }
                      }}
                      autoComplete="off"
                      className={styles.FieldInput}
                      style={{
                        resize: 'vertical',
                        height: 'var(--160px)',
                      }}
                    />
                    <span className={styles.MaxDescriptionLength}>
                      {remainingSymbols}/{MAX_DESCRIPTION_LENGTH}
                    </span>
                  </Field.Root>
                )
              }}
            />

            <form.Field
              name="links"
              children={(field) => {
                const activeLinks = field.state.value
                const selectedLinkTypes = activeLinks
                  .map((link) => link.type)
                  .filter(Boolean) as LinkType[]
                const maxLinksReached =
                  activeLinks.length >= Object.keys(LINK_META).length

                function handleAddLink() {
                  field.handleChange(
                    produce((draft) => {
                      draft.push({
                        id: createId(),
                        type: null,
                        url: '',
                      })
                    }),
                  )
                }

                function handleRemoveLink(id: string) {
                  field.handleChange(
                    produce((draft) => {
                      const index = draft.findIndex((link) => link.id === id)
                      if (index !== -1) draft.splice(index, 1)
                    }),
                  )
                }

                function handleChangeLinkType(id: string, newType: LinkType) {
                  field.handleChange(
                    produce((draft) => {
                      const link = draft.find((link) => link.id === id)
                      if (link) link.type = newType
                    }),
                  )
                }

                function handleChangeLinkUrl(id: string, newUrl: string) {
                  field.handleChange(
                    produce((draft) => {
                      const link = draft.find((link) => link.id === id)
                      if (link) link.url = newUrl
                    }),
                  )
                }

                return (
                  <Field.Root
                    name={field.name}
                    invalid={!field.state.meta.isValid}
                    dirty={field.state.meta.isDirty}
                    touched={field.state.meta.isTouched}
                  >
                    <div className={styles.LinksHeader}>
                      <Field.Label
                        nativeLabel={false}
                        render={<span />}
                        className={styles.Label}
                      >
                        Посилання
                        <Tooltip
                          className={styles.YellowTooltip}
                          text="Наполегливо просимо надати принаймні одне посилання на групу чи сайт команди"
                          align="start"
                        >
                          <Asterisk size={14} />
                        </Tooltip>
                      </Field.Label>
                      <AnimatePresence>
                        {activeLinks.length > 1 && (
                          <MotionButton
                            type="button"
                            initial={{ opacity: 0, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(4px)' }}
                            transition={{
                              type: 'spring',
                              duration: 0.25,
                              bounce: 0,
                            }}
                            className={styles.HideLinksButton}
                            onClick={(e) => {
                              e.preventDefault()
                              handleLinksPresence()
                            }}
                          >
                            <ClickTargetHelper />
                            <motion.div
                              initial={false}
                              animate={{
                                rotate: isLinksSectionShown ? '180deg' : '0deg',
                              }}
                              transition={{
                                type: 'spring',
                                duration: 0.4,
                                bounce: 0,
                              }}
                            >
                              <ChevronUp size={18} />
                            </motion.div>
                          </MotionButton>
                        )}
                      </AnimatePresence>
                    </div>

                    <Accordion.Root
                      value={isLinksSectionShown ? ['links'] : []}
                      onValueChange={(values) =>
                        setIsLinksSectionShown(values.length > 0)
                      }
                    >
                      <Accordion.Item value="links">
                        <Accordion.Header style={{ display: 'none' }}>
                          <Accordion.Trigger />
                        </Accordion.Header>
                        <Accordion.Panel
                          style={{
                            overflow: isOverflowVisible ? 'visible' : 'clip',
                          }}
                          className={styles.AccordionPanel}
                          onTransitionEnd={() =>
                            setHasAccordionAnimationFinished(true)
                          }
                        >
                          <div
                            className={clsx(styles.LinksList, {
                              [styles.MarginEnd]:
                                activeLinks.length > 0 && !maxLinksReached,
                            })}
                          >
                            <AnimatePresence>
                              {activeLinks.map((link) => {
                                const availableTypes = (
                                  Object.keys(LINK_META) as LinkType[]
                                ).filter(
                                  (type) =>
                                    !selectedLinkTypes.includes(type) ||
                                    type === link.type,
                                )

                                return (
                                  <LinkInputField
                                    key={link.id}
                                    link={link}
                                    availableTypes={availableTypes}
                                    onChangeLinkType={(id, newType) =>
                                      handleChangeLinkType(id, newType)
                                    }
                                    onChangeLinkUrl={(id, value) =>
                                      handleChangeLinkUrl(id, value)
                                    }
                                    onRemoveLink={(id) => handleRemoveLink(id)}
                                    hasAccordionAnimationFinished={
                                      hasAccordionAnimationFinished
                                    }
                                  />
                                )
                              })}
                            </AnimatePresence>
                          </div>

                          {!maxLinksReached && (
                            <MotionButton
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                handleAddLink()
                              }}
                              className={styles.AddLinkButton}
                            >
                              <span>Додати посилання</span>
                              <Link size={12} />
                            </MotionButton>
                          )}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion.Root>
                  </Field.Root>
                )
              }}
            />
          </form>
        </div>
        <footer className={styles.FooterMenu}>
          <MotionButton
            onClick={() => form.handleSubmit()}
            focusableWhenDisabled={true}
            disabled={isUploading}
            className={clsx(styles.SendButton, 'Gradient', {
              [styles.Loading]: isUploading,
            })}
          >
            {isUploading ? (
              <>
                <span>Надсилаємо..</span>
                <LoaderCircle size={14} />
              </>
            ) : (
              'Надіслати на розгляд'
            )}
          </MotionButton>

          <MotionButton
            onClick={handleClearForm}
            focusableWhenDisabled={true}
            className={clsx(styles.ClearButton, 'Gradient', {
              [styles.Loading]: isUploading,
            })}
          >
            {isEditMode ? 'Відновити' : 'Очистити'}
          </MotionButton>
        </footer>
        <MobileNavigation />
      </div>
    </div>
  )
}

export default TeamForm
