import { Button, Field } from '@base-ui/react'
import { useGoBack } from '@/hooks/use-go-back'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import Tooltip from '../Tooltip'
import { AnimatePresence, motion } from 'motion/react'
import MotionButton, { tapAnimation } from '../MotionButton'
import MobileNavigation from '../MobileNavigation'
import clsx from 'clsx'
import { Image } from '@unpic/react'
import { useTitleForm } from './use-title-form'
import CropImageDialog from '../CropImageDialog'
import { showTimedToast } from '@/lib/toast'
import { SelectField } from './SelectField'
import ShiftBy from '../ShiftBy/ShiftBy'
import { PersonComboboxField } from './PersonComboboxField'
import { getRouteApi, Link } from '@tanstack/react-router'
import { UserTeamsCheckboxList } from './UserTeamsCheckboxList'
import {
  ArrowLeft,
  CircleAlert,
  Info,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import {
  AgeRestriction,
  TranslationStatus,
  TitleStatus,
  TitleType,
} from '@/generated/prisma/enums'
import {
  AGE_RESTRICTION_LABELS,
  TRANSLATION_STATUS_LABELS,
  TITLE_STATUS_LABELS,
  TITLE_TYPE_LABELS,
} from '@/lib/constants'
import { TagComboboxField } from './TagComboboxField'
import { GenreComboboxField } from './GenreComboboxField'
import styles from './CreateTitleForm.module.scss'
import { useHelperDialog } from '@/hooks/use-helper-dialog'
import HelperDialog from '../HelperDialog'

const MAX_DESCRIPTION_LENGTH = 1000

const routeApi = getRouteApi('/title/create/')

function CreateTitleForm() {
  const { handleGoBack } = useGoBack()
  const { form, cover, background, isUploading, handleClearForm } =
    useTitleForm()
  const loaderData = routeApi.useLoaderData()

  const { title, content, mdast, isHelperOpen, handleHelperOpenChange } =
    useHelperDialog('seen_create_title_rules', loaderData)

  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Створення твору</h1>
        <HelperDialog
          title={title}
          content={content}
          mdast={mdast}
          open={isHelperOpen}
          onOpenChange={handleHelperOpenChange}
          trigger={(openDialog) => (
            <Button onClick={openDialog} className={styles.InfoButton}>
              <ClickTargetHelper />
              <Info size={20} />
              <VisuallyHidden>Довідка</VisuallyHidden>
            </Button>
          )}
        />
      </div>
      <div className={styles.Wrapper}>
        <div className={styles.Content}>
          <div className={styles.ContentHeaderWrapper}>
            <h1 className={styles.ContentTitle}>Створення твору</h1>
            <HelperDialog
              title={title}
              content={content}
              mdast={mdast}
              open={isHelperOpen}
              onOpenChange={handleHelperOpenChange}
              trigger={(openDialog) => (
                <Button onClick={openDialog} className={styles.HelperButton}>
                  <Info size={16} />
                  <span>Довідка</span>
                </Button>
              )}
            />
          </div>
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
                children={(field) => (
                  <Field.Root
                    invalid={
                      !field.state.meta.isValid &&
                      form.state.submissionAttempts > 0
                    }
                  >
                    <Field.Label className={styles.Label}>
                      Обкладинка
                      <Tooltip text="Обов'язкове поле" align="start" />
                    </Field.Label>
                    <div className={styles.UploadAvatarWrapper}>
                      {!cover.fileState && (
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

                      {cover.fileState && (
                        <div className={styles.UploadedCover}>
                          <Image
                            layout="fullWidth"
                            alt={cover.fileState.file.name}
                            src={cover.fileState.objectUrl ?? ''}
                            draggable={false}
                          />

                          {cover.fileState.uploading &&
                            !cover.fileState.isDeleting && (
                              <div className={styles.Overlay}>
                                {cover.fileState.progress}%
                              </div>
                            )}

                          {!cover.fileState.uploading &&
                            !cover.fileState.isDeleting &&
                            cover.fileState.error && (
                              <div className={styles.Overlay}>
                                <CircleAlert
                                  className={styles.Error}
                                  size={30}
                                />
                              </div>
                            )}

                          {!cover.fileState.uploading && (
                            <div className={styles.TrashButtonWrapper}>
                              <MotionButton
                                focusableWhenDisabled={true}
                                disabled={
                                  cover.fileState.isDeleting || isUploading
                                }
                                onClick={() => cover.removeFile()}
                                className={styles.TrashButton}
                              >
                                <ClickTargetHelper />
                                {cover.fileState.isDeleting ? (
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
                            croppedWidth={cover.croppedWidth}
                            croppedHeight={cover.croppedHeight}
                            onCropped={(file) => {
                              if (!file) {
                                showTimedToast(
                                  {
                                    type: 'error',
                                    title: 'Помилка',
                                    description:
                                      'Не вдалося обрізати зображення',
                                  },
                                  3000,
                                )
                                return
                              }
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
                )}
              />

              <form.Field
                name="backgroundKey"
                children={(field) => (
                  <Field.Root
                    invalid={
                      !field.state.meta.isValid &&
                      form.state.submissionAttempts > 0
                    }
                  >
                    <Field.Label className={styles.Label}>
                      Задній фон
                    </Field.Label>
                    <div className={styles.UploadBackgroundWrapper}>
                      {!background.fileState && (
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

                      {background.fileState && (
                        <div className={styles.UploadedCover}>
                          <Image
                            layout="fullWidth"
                            alt={background.fileState.file.name}
                            src={background.fileState.objectUrl ?? ''}
                            draggable={false}
                          />

                          {background.fileState.uploading &&
                            !background.fileState.isDeleting && (
                              <div className={styles.Overlay}>
                                {background.fileState.progress}%
                              </div>
                            )}

                          {!background.fileState.uploading &&
                            !background.fileState.isDeleting &&
                            background.fileState.error && (
                              <div className={styles.Overlay}>
                                <CircleAlert
                                  className={styles.Error}
                                  size={30}
                                />
                              </div>
                            )}

                          {!background.fileState.uploading && (
                            <div className={styles.TrashButtonWrapper}>
                              <MotionButton
                                className={styles.TrashButton}
                                focusableWhenDisabled={true}
                                disabled={
                                  background.fileState.isDeleting || isUploading
                                }
                                onClick={() => background.removeFile()}
                              >
                                <ClickTargetHelper />
                                {background.fileState.isDeleting ? (
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
                            croppedWidth={background.croppedWidth}
                            croppedHeight={background.croppedHeight}
                            onCropped={(file) => {
                              if (!file) {
                                showTimedToast(
                                  {
                                    type: 'error',
                                    title: 'Помилка',
                                    description:
                                      'Не вдалося обрізати зображення',
                                  },
                                  3000,
                                )
                                return
                              }
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
                )}
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
                    <Tooltip text="Обов'язкове поле" align="start" />
                  </Field.Label>
                  <Field.Control
                    id="ukrName"
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
                    <Tooltip text="Обов'язкове поле" align="start" />
                  </Field.Label>
                  <Field.Control
                    id="enName"
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
                      color="yellow"
                      text='Назви вказуйте за допомогою роздільника "/" через пробіл (назва 1 / назва 2 / назва 3)'
                      align="start"
                    />
                  </Field.Label>
                  <Field.Control
                    id="alternativeNames"
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
                    <Field.Label htmlFor="description" className={styles.Label}>
                      Опис
                    </Field.Label>
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
                    />
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
                  <Tooltip text="Усі поля обов'язкові" align="start" />
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
                    <Field.Label htmlFor={field.name} className={styles.Label}>
                      Тип
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(TitleType)}
                      labels={TITLE_TYPE_LABELS}
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
                    <Field.Label htmlFor={field.name} className={styles.Label}>
                      Статус твору
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(TitleStatus)}
                      labels={TITLE_STATUS_LABELS}
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
                    <Field.Label htmlFor={field.name} className={styles.Label}>
                      Статус перекладу
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(TranslationStatus)}
                      labels={TRANSLATION_STATUS_LABELS}
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
                    <Field.Label htmlFor={field.name} className={styles.Label}>
                      Вікові обмеження
                    </Field.Label>
                    <SelectField
                      id={field.name}
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      options={Object.values(AgeRestriction)}
                      labels={AGE_RESTRICTION_LABELS}
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
                    <Field.Label htmlFor={field.name} className={styles.Label}>
                      Рік випуску
                    </Field.Label>
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
                    />
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
                  <Field.Label className={styles.Label}>Жанри</Field.Label>
                  <GenreComboboxField
                    value={field.state.value}
                    onChange={field.handleChange}
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
                  <Field.Label className={styles.Label}>Теги</Field.Label>
                  <TagComboboxField
                    value={field.state.value}
                    onChange={field.handleChange}
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
                    <Field.Label className={styles.Label}>
                      Автори
                      <Tooltip text="Обов'язкове поле" align="start" />
                    </Field.Label>
                    <Link className={styles.Link} to="/people/create">
                      Створити нового автора
                    </Link>
                  </div>
                  <PersonComboboxField
                    selectedPeople={field.state.value}
                    onChange={field.handleChange}
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
                    <Field.Label className={styles.Label}>
                      Художники
                      <Tooltip text="Обов'язкове поле" align="start" />
                    </Field.Label>
                    <Link className={styles.Link} to="/people/create">
                      Створити нового художника
                    </Link>
                  </div>
                  <PersonComboboxField
                    selectedPeople={field.state.value}
                    onChange={field.handleChange}
                  />
                </Field.Root>
              )}
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
                    <Field.Label className={styles.Label}>
                      Команди
                      <Tooltip
                        text="Повинна бути обрана хоча б одна команда"
                        align="start"
                      />
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

export default CreateTitleForm
