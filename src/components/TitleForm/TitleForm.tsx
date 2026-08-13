import { Accordion, Button, Field } from '@base-ui/react'
import { useGoBack } from '@/hooks/use-go-back'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import Tooltip from '../Tooltip'
import { AnimatePresence, motion } from 'motion/react'
import MotionButton, { tapAnimation } from '../MotionButton'
import MobileNavigation from '../MobileNavigation'
import clsx from 'clsx'
import { Image } from '@unpic/react'
import { TitleFormMode, useTitleForm } from './use-title-form'
import CropImageDialog from '../CropImageDialog'
import { SelectField } from './SelectField'
import ShiftBy from '../ShiftBy'
import { PersonComboboxField } from './PersonComboboxField'
import { Link } from '@tanstack/react-router'
import { UserTeamsCheckboxList } from './UserTeamsCheckboxList'
import { TagComboboxField } from './TagComboboxField'
import { GenreComboboxField } from './GenreComboboxField'
import { HelperData, useHelperDialog } from '@/hooks/use-helper-dialog'
import HelperDialog from '../HelperDialog'
import { produce } from 'immer'
import { createId } from '@paralleldrive/cuid2'
import { MAX_NUMBER_OF_SOURCE_FIELDS, SourceShape } from '@/schemas/titles'
import { isValidUrl } from '@/lib/utils'
import { useId } from 'react'
import {
  ArrowLeft,
  Asterisk,
  ChevronUp,
  CircleAlert,
  Info,
  Link2Icon,
  LinkIcon,
  LoaderCircle,
  LockIcon,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import {
  AgeRestriction,
  TranslationStatus,
  TitleStatus,
  TitleType,
  TitleFieldName,
} from '@/generated/prisma/enums'
import {
  AGE_RESTRICTION_LABELS,
  TRANSLATION_STATUS_LABELS,
  TITLE_STATUS_LABELS,
  TITLE_TYPE_LABELS,
} from '@/lib/constants'
import { TitleEditableData } from '@/services/queries'
import styles from './TitleForm.module.scss'
import { showTimedToast } from '@/lib/toast'

const MAX_DESCRIPTION_LENGTH = 1000

interface TitleFormProps {
  initialData?: TitleEditableData
  helperData?: HelperData
  helperStorageKey?: string
  mode?: TitleFormMode
}

function TitleForm({
  initialData,
  helperData,
  helperStorageKey,
  mode = 'create',
}: TitleFormProps) {
  const { handleGoBack } = useGoBack()
  const {
    form,
    cover,
    background,
    isUploading,
    handleClearForm,
    isSourcesSectionShown,
    setIsSourcesSectionShown,
    isOverflowVisible,
    hasAccordionAnimationFinished,
    setHasAccordionAnimationFinished,
    handleSourcesPresence,
  } = useTitleForm(initialData, mode)

  const helper = useHelperDialog(helperStorageKey, helperData)

  const lockedFields = initialData?.lockedFields

  function isLockedField(fieldName: TitleFieldName) {
    return (lockedFields && lockedFields.includes(fieldName)) ?? false
  }

  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>
          {mode === 'create' && 'Додавання твору'}
          {mode === 'revise' && 'Редагування твору'}
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
              {mode === 'create' && 'Додавання твору'}
              {mode === 'revise' && 'Редагування твору'}
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
            <div className={styles.CoversWrapper}>
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

                  const isCoverLocked = isLockedField('coverUrl')

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
                        render={<div />}
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
                      <div
                        className={styles.UploadAvatarWrapper}
                        data-locked={isCoverLocked ? '' : undefined}
                      >
                        {!shouldShowPreview && (
                          <motion.div
                            {...tapAnimation}
                            {...cover.getRootProps({
                              role: 'button',
                              'aria-label': 'drag and drop area',
                            })}
                            tabIndex={isCoverLocked ? -1 : 0}
                            className={styles.UploadZone}
                            data-drag-active={cover.isDragActive}
                          >
                            <input
                              {...cover.getInputProps()}
                              disabled={isCoverLocked}
                            />
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
                              alt="Обкладинка твору"
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
                                <CircleAlert
                                  className={styles.Error}
                                  size={30}
                                />
                              </div>
                            )}

                            {shouldShowTrashButton && (
                              <div className={styles.FloatingButtonWrapper}>
                                <MotionButton
                                  focusableWhenDisabled={!isCoverLocked}
                                  disabled={
                                    isCoverLocked ||
                                    (hasNewCover
                                      ? cover.fileState!.isDeleting ||
                                        isUploading
                                      : isUploading)
                                  }
                                  onClick={() => {
                                    if (hasNewCover) {
                                      cover.removeFile()
                                    } else {
                                      field.handleChange(null)
                                    }
                                  }}
                                  className={styles.TrashImageButton}
                                >
                                  <ClickTargetHelper />
                                  {hasNewCover &&
                                  cover.fileState!.isDeleting ? (
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
                        {isLockedField('coverUrl') && <LockOverlay />}
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

                  const isBackgroundLocked = isLockedField('backgroundUrl')

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
                        render={<div />}
                        className={styles.Label}
                      >
                        Фонове зображення
                      </Field.Label>
                      <div
                        className={styles.UploadBackgroundWrapper}
                        data-locked={isBackgroundLocked ? '' : undefined}
                      >
                        {!shouldShowPreview && (
                          <motion.div
                            {...tapAnimation}
                            {...background.getRootProps({
                              role: 'button',
                              'aria-label': 'drag and drop area',
                            })}
                            tabIndex={isBackgroundLocked ? -1 : 0}
                            className={styles.UploadZone}
                            data-drag-active={background.isDragActive}
                          >
                            <input
                              {...background.getInputProps()}
                              disabled={isBackgroundLocked}
                            />
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
                              alt="Фонове зображення твору"
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
                                <CircleAlert
                                  className={styles.Error}
                                  size={30}
                                />
                              </div>
                            )}

                            {shouldShowTrashButton && (
                              <div className={styles.FloatingButtonWrapper}>
                                <MotionButton
                                  className={styles.TrashImageButton}
                                  focusableWhenDisabled={!isBackgroundLocked}
                                  disabled={
                                    isBackgroundLocked ||
                                    (hasNewBackground
                                      ? background.fileState!.isDeleting ||
                                        isUploading
                                      : isUploading)
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
                          {background.imageToCrop &&
                            background.cropImageUrl && (
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
                        {isLockedField('backgroundUrl') && <LockOverlay />}
                      </div>
                    </Field.Root>
                  )
                }}
              />
            </div>

            <form.Field
              name="ukrName"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <Field.Label htmlFor="ukrName" className={styles.Label}>
                    Назва українською
                    <Tooltip
                      className={styles.RedTooltip}
                      text="Обов'язкове поле"
                      align="start"
                    >
                      <Asterisk size={14} />
                    </Tooltip>
                  </Field.Label>
                  <div
                    className={styles.FieldInputWrapper}
                    data-locked={isLockedField('nameUkr') ? '' : undefined}
                  >
                    <Field.Control
                      id="ukrName"
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                      className={styles.FieldInput}
                      disabled={isLockedField('nameUkr')}
                    />
                    {isLockedField('nameUkr') && <LockOverlay />}
                  </div>
                </Field.Root>
              )}
            />

            <form.Field
              name="enName"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <Field.Label htmlFor="enName" className={styles.Label}>
                    Назва англійською
                    <Tooltip
                      className={styles.RedTooltip}
                      text="Обов'язкове поле"
                      align="start"
                    >
                      <Asterisk size={14} />
                    </Tooltip>
                  </Field.Label>
                  <div
                    className={styles.FieldInputWrapper}
                    data-locked={isLockedField('nameEng') ? '' : undefined}
                  >
                    <Field.Control
                      id="enName"
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                      className={styles.FieldInput}
                      disabled={isLockedField('nameEng')}
                    />
                    {isLockedField('nameEng') && <LockOverlay />}
                  </div>
                </Field.Root>
              )}
            />

            <form.Field
              name="alternativeNames"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <Field.Label
                    htmlFor="alternativeNames"
                    className={styles.Label}
                  >
                    Альтернативні назви
                    <Tooltip
                      className={styles.YellowTooltip}
                      text='Назви вказуйте за допомогою роздільника "/" через пробіл (назва 1 / назва 2 / назва 3)'
                      align="start"
                    >
                      <Asterisk size={14} />
                    </Tooltip>
                  </Field.Label>
                  <div
                    className={styles.FieldInputWrapper}
                    data-locked={
                      isLockedField('alternativeNames') ? '' : undefined
                    }
                  >
                    <Field.Control
                      id="alternativeNames"
                      name={field.name}
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                      className={styles.FieldInput}
                      disabled={isLockedField('alternativeNames')}
                    />
                    {isLockedField('alternativeNames') && <LockOverlay />}
                  </div>
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
                    <Field.Label htmlFor="description" className={styles.Label}>
                      Опис
                    </Field.Label>
                    <div
                      className={styles.FieldInputWrapper}
                      data-locked={
                        isLockedField('description') ? '' : undefined
                      }
                    >
                      <Field.Control
                        render={<textarea />}
                        id="description"
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
                        style={{ resize: 'vertical', height: 'var(--160px)' }}
                        disabled={isLockedField('description')}
                      />
                      {isLockedField('description') && <LockOverlay />}
                    </div>
                    <span className={styles.MaxDescriptionLength}>
                      {remainingSymbols}/{MAX_DESCRIPTION_LENGTH}
                    </span>
                  </Field.Root>
                )
              }}
            />

            <div className={styles.MetadataWrapper}>
              <h3 className={styles.MetadataHeading}>
                <span>Метадані</span>
                <ShiftBy x={1} y={1.5}>
                  <Tooltip
                    className={styles.RedTooltip}
                    text="Усі поля обов'язкові"
                    align="start"
                  >
                    <Asterisk size={14} />
                  </Tooltip>
                </ShiftBy>
              </h3>
              <form.Field
                name="type"
                children={(field) => (
                  <Field.Root
                    name={field.name}
                    invalid={!field.state.meta.isValid}
                    dirty={field.state.meta.isDirty}
                    touched={field.state.meta.isTouched}
                    className={styles.MetadataField}
                  >
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      htmlFor={field.name}
                      className={styles.Label}
                    >
                      Тип
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(TitleType)}
                      labels={TITLE_TYPE_LABELS}
                      isLocked={isLockedField('type')}
                    />
                  </Field.Root>
                )}
              />

              <form.Field
                name="titleStatus"
                children={(field) => (
                  <Field.Root
                    name={field.name}
                    invalid={!field.state.meta.isValid}
                    dirty={field.state.meta.isDirty}
                    touched={field.state.meta.isTouched}
                    className={styles.MetadataField}
                  >
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      htmlFor={field.name}
                      className={styles.Label}
                    >
                      Статус твору
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(TitleStatus)}
                      labels={TITLE_STATUS_LABELS}
                      isLocked={isLockedField('titleStatus')}
                    />
                  </Field.Root>
                )}
              />

              <form.Field
                name="translationStatus"
                children={(field) => (
                  <Field.Root
                    name={field.name}
                    invalid={!field.state.meta.isValid}
                    dirty={field.state.meta.isDirty}
                    touched={field.state.meta.isTouched}
                    className={styles.MetadataField}
                  >
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      htmlFor={field.name}
                      className={styles.Label}
                    >
                      Статус перекладу
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(TranslationStatus)}
                      labels={TRANSLATION_STATUS_LABELS}
                      isLocked={isLockedField('translationStatus')}
                    />
                  </Field.Root>
                )}
              />

              <form.Field
                name="ageRestriction"
                children={(field) => (
                  <Field.Root
                    name={field.name}
                    invalid={!field.state.meta.isValid}
                    dirty={field.state.meta.isDirty}
                    touched={field.state.meta.isTouched}
                    className={styles.MetadataField}
                  >
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      htmlFor={field.name}
                      className={styles.Label}
                    >
                      Вікові обмеження
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(AgeRestriction)}
                      labels={AGE_RESTRICTION_LABELS}
                      isLocked={isLockedField('ageRestriction')}
                    />
                  </Field.Root>
                )}
              />

              <form.Field
                name="releaseYear"
                children={(field) => (
                  <Field.Root
                    name={field.name}
                    invalid={!field.state.meta.isValid}
                    dirty={field.state.meta.isDirty}
                    touched={field.state.meta.isTouched}
                    className={styles.MetadataField}
                  >
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      htmlFor={field.name}
                      className={styles.Label}
                    >
                      Рік випуску
                    </Field.Label>
                    <div
                      className={styles.FieldInputWrapper}
                      data-locked={
                        isLockedField('releaseYear') ? '' : undefined
                      }
                    >
                      <Field.Control
                        id={field.name}
                        name={field.name}
                        type="text"
                        autoComplete="off"
                        inputMode="numeric"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={styles.FieldInput}
                        disabled={isLockedField('releaseYear')}
                      />
                      {isLockedField('releaseYear') && <LockOverlay />}
                    </div>
                  </Field.Root>
                )}
              />
            </div>

            <form.Field
              name="genres"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <Field.Label
                    nativeLabel={false}
                    render={<div />}
                    className={styles.Label}
                  >
                    Жанри
                  </Field.Label>
                  <GenreComboboxField
                    value={field.state.value}
                    onChange={field.handleChange}
                    isLocked={isLockedField('genres')}
                  />
                </Field.Root>
              )}
            />

            <form.Field
              name="tags"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <Field.Label
                    nativeLabel={false}
                    render={<div />}
                    className={styles.Label}
                  >
                    Теги
                  </Field.Label>
                  <TagComboboxField
                    value={field.state.value}
                    onChange={field.handleChange}
                    isLocked={isLockedField('tags')}
                  />
                </Field.Root>
              )}
            />

            <form.Field
              name="authors"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <div className={styles.LabelBox}>
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      className={styles.Label}
                    >
                      Автори
                      <Tooltip
                        className={styles.RedTooltip}
                        text="Обов'язкове поле"
                        align="start"
                      >
                        <Asterisk size={14} />
                      </Tooltip>
                    </Field.Label>
                    <Link className={styles.Link} to="/people/create">
                      Створити нового автора
                    </Link>
                  </div>
                  <PersonComboboxField
                    selectedPeople={field.state.value}
                    onChange={field.handleChange}
                    isLocked={isLockedField('authors')}
                  />
                </Field.Root>
              )}
            />

            <form.Field
              name="artists"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <div className={styles.LabelBox}>
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      className={styles.Label}
                    >
                      Художники
                      <Tooltip
                        className={styles.RedTooltip}
                        text="Обов'язкове поле"
                        align="start"
                      >
                        <Asterisk size={14} />
                      </Tooltip>
                    </Field.Label>
                    <Link className={styles.Link} to="/people/create">
                      Створити нового художника
                    </Link>
                  </div>
                  <PersonComboboxField
                    selectedPeople={field.state.value}
                    onChange={field.handleChange}
                    isLocked={isLockedField('artists')}
                  />
                </Field.Root>
              )}
            />

            <form.Field
              name="sources"
              children={(field) => {
                const visibleFields = field.state.value
                const maxFieldsReached =
                  visibleFields.length >= MAX_NUMBER_OF_SOURCE_FIELDS
                const hasEmptyFields = visibleFields.some(
                  (el) => el.url.trim() === '',
                )

                function handleAddSource() {
                  if (hasEmptyFields || maxFieldsReached) {
                    return
                  }

                  field.handleChange(
                    produce((draft) => {
                      draft.push({
                        id: createId(),
                        url: '',
                      })
                    }),
                  )
                }

                function handleRemoveSource(id: string) {
                  field.handleChange(
                    produce((draft) => {
                      const index = draft.findIndex((link) => link.id === id)
                      if (index !== -1) draft.splice(index, 1)
                    }),
                  )
                }

                function handleChangeSource(id: string, newSource: string) {
                  field.handleChange(
                    produce((draft) => {
                      const source = draft.find((source) => source.id === id)
                      if (source) source.url = newSource
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
                    <div className={styles.SourcesHeader}>
                      <Field.Label
                        nativeLabel={false}
                        render={<div />}
                        className={styles.Label}
                      >
                        Посилання на зовнішні ресруси
                        <Tooltip
                          className={styles.YellowTooltip}
                          text="Обов'язково вказуйте на початку https://"
                          align="start"
                        >
                          <Asterisk size={14} />
                        </Tooltip>
                      </Field.Label>
                      <AnimatePresence>
                        {visibleFields.length > 1 && (
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
                            className={styles.HideSourcesButton}
                            onClick={(e) => {
                              e.preventDefault()
                              handleSourcesPresence()
                            }}
                          >
                            <ClickTargetHelper />
                            <motion.div
                              initial={false}
                              animate={{
                                rotate: isSourcesSectionShown
                                  ? '180deg'
                                  : '0deg',
                              }}
                              transition={{
                                type: 'spring',
                                duration: 0.4,
                                bounce: 0,
                              }}
                            >
                              <ChevronUp size={18} />
                              <VisuallyHidden>
                                {isSourcesSectionShown
                                  ? 'Сховати зовнішні ресурси'
                                  : 'Показати зовнішні ресурси'}
                              </VisuallyHidden>
                            </motion.div>
                          </MotionButton>
                        )}
                      </AnimatePresence>
                    </div>

                    <Accordion.Root
                      value={isSourcesSectionShown ? ['sources'] : []}
                      onValueChange={(values) =>
                        setIsSourcesSectionShown(values.length > 0)
                      }
                    >
                      <Accordion.Item value="sources">
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
                            className={clsx(styles.SourcesList, {
                              [styles.MarginEnd]:
                                visibleFields.length > 0 && !maxFieldsReached,
                            })}
                          >
                            <AnimatePresence>
                              {visibleFields.map((source, index) => {
                                return (
                                  <div
                                    key={source.id}
                                    className={styles.FieldInputWrapper}
                                    data-locked={
                                      isLockedField('sources') ? '' : undefined
                                    }
                                  >
                                    <SourceInputField
                                      source={source}
                                      fieldIndex={index}
                                      onChangeSource={(id, value) =>
                                        handleChangeSource(id, value)
                                      }
                                      onRemoveSource={(id) =>
                                        handleRemoveSource(id)
                                      }
                                      hasAccordionAnimationFinished={
                                        hasAccordionAnimationFinished
                                      }
                                      isLocked={isLockedField('sources')}
                                    />
                                    {isLockedField('sources') && (
                                      <LockOverlay />
                                    )}
                                  </div>
                                )
                              })}
                            </AnimatePresence>
                          </div>

                          {!maxFieldsReached && !isLockedField('sources') && (
                            <MotionButton
                              type="button"
                              disabled={hasEmptyFields}
                              onClick={handleAddSource}
                              className={styles.AddSourceButton}
                            >
                              <span>Додати посилання</span>
                              <LinkIcon size={12} />
                            </MotionButton>
                          )}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion.Root>
                  </Field.Root>
                )
              }}
            />

            <form.Field
              name="teams"
              children={(field) => (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                >
                  <div className={styles.LabelBox}>
                    <Field.Label
                      nativeLabel={false}
                      render={<div />}
                      className={styles.Label}
                    >
                      Команди
                      <Tooltip
                        className={styles.RedTooltip}
                        text="Повинна бути обрана хоча б одна команда"
                        align="start"
                      >
                        <Asterisk size={14} />
                      </Tooltip>
                    </Field.Label>
                    <Link className={styles.Link} to="/team/create">
                      Створити нову команду
                    </Link>
                  </div>

                  <UserTeamsCheckboxList
                    selectedTeams={field.state.value}
                    onChange={field.handleChange}
                  />
                </Field.Root>
              )}
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
            Очистити
          </MotionButton>
        </footer>
        <MobileNavigation />
      </div>
    </div>
  )
}

function LockOverlay() {
  return (
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
  )
}

interface SourceInputField {
  source: SourceShape
  fieldIndex: number
  onChangeSource: (id: string, value: string) => void
  onRemoveSource: (id: string) => void
  hasAccordionAnimationFinished: boolean
  isLocked: boolean
}

export function SourceInputField({
  source,
  fieldIndex,
  onChangeSource,
  onRemoveSource,
  hasAccordionAnimationFinished,
  isLocked,
}: SourceInputField) {
  const isValid = isValidUrl(source.url)
  const fieldId = useId()
  return (
    <motion.div
      layout={true}
      initial={
        hasAccordionAnimationFinished
          ? { opacity: 0, height: 0, scale: 0.96 }
          : false
      }
      animate={
        hasAccordionAnimationFinished
          ? {
              opacity: 1,
              height: 'auto',
              scale: 1,
              transition: {
                type: 'spring',
                duration: 0.25,
                bounce: 0,
              },
            }
          : false
      }
      exit={{
        x: -80,
        opacity: 0,
        height: 0,
        marginTop: 0,
        marginBottom: 0,
        overflow: 'hidden',
        transition: {
          x: { duration: 0.25, ease: 'easeOut' },
          opacity: { delay: 0.1, duration: 0.2 },
          height: { delay: 0.25, duration: 0.25, ease: 'easeInOut' },
          marginTop: { delay: 0.25, duration: 0.25 },
          marginBottom: { delay: 0.25, duration: 0.25 },
        },
      }}
      className={styles.FieldInputWrapper}
    >
      <input
        type="url"
        placeholder="https://example.com"
        id={`source-${fieldId}`}
        aria-label={`Посилання на ресурс ${fieldIndex + 1}`}
        value={source.url}
        onChange={(e) => onChangeSource(source.id, String(e.target.value))}
        autoComplete="off"
        className={styles.SourceFieldInput}
        autoFocus={true}
        disabled={isLocked}
      />

      <div className={styles.SourceFieldButtonsWrapper}>
        {isValid ? (
          <MotionButton
            className={clsx(
              styles.SourceFieldButton,
              styles.SourceExternalButton,
            )}
            render={
              <a
                href={
                  ['https://', 'http://'].some((protocol) =>
                    source.url.startsWith(protocol),
                  )
                    ? source.url
                    : `https://${source.url}`
                }
                target="_blank"
              />
            }
            nativeButton={false}
            disabled={isLocked}
          >
            <Link2Icon size={16} />
            <VisuallyHidden>Перейти за наданим посиланням</VisuallyHidden>
          </MotionButton>
        ) : (
          <MotionButton
            className={clsx(
              styles.SourceFieldButton,
              styles.SourceExternalButton,
            )}
            disabled={true}
          >
            <Link2Icon size={16} />
            <VisuallyHidden>
              Неможливо перейти за посиланням (надайте коректне посилання)
            </VisuallyHidden>
          </MotionButton>
        )}

        <MotionButton
          className={clsx(styles.SourceFieldButton, styles.TrashButton)}
          onClick={() => onRemoveSource(source.id)}
          disabled={isLocked}
        >
          <Trash2 size={16} />
          <VisuallyHidden>Видалити поле</VisuallyHidden>
        </MotionButton>
      </div>
    </motion.div>
  )
}

export default TitleForm
