import { Button } from '@base-ui/react'
import styles from './CreateWorkForm.module.scss'
import { useGoBack } from '@/hooks/use-go-back'
import ClickTargetHelper from '../ClickTargetHelper'
import {
  ArrowLeft,
  CircleAlert,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import Tooltip from '../Tooltip'
import { AnimatePresence, motion } from 'motion/react'
import MotionButton, { tapAnimation } from '../MotionButton'
import MobileNavigation from '../MobileNavigation'
import clsx from 'clsx'
import { Image } from '@unpic/react'
import { useWorkForm } from './use-work-form'
import CropImageDialog from '../CropImageDialog'
import { showTimedToast } from '@/lib/toast'
import { SelectField } from './SelectField'
import {
  AgeRestriction,
  TranslationStatus,
  WorkStatus,
  WorkType,
} from '@/generated/prisma/enums'
import {
  AGE_RESTRICTION_LABELS,
  GENRES,
  TAGS,
  TRANSLATION_STATUS_LABELS,
  WORK_STATUS_LABELS,
  WORK_TYPE_LABELS,
} from '@/lib/constants'
import { useState } from 'react'
import ShiftBy from '../ShiftBy/ShiftBy'
import { ComboboxField } from './ComboboxField'

const MAX_DESCRIPTION_LENGTH = 1000

function CreateWorkForm() {
  const { handleGoBack } = useGoBack()
  const { form, cover, background, isUploading } = useWorkForm()
  const [workType, setWorkType] = useState<WorkType | null>(null)
  const [workStatus, setWorkStatus] = useState<WorkStatus | null>(null)
  const [translationStatus, setTranslationStatus] =
    useState<TranslationStatus | null>(null)
  const [ageRestriction, setAgeRestriction] = useState<AgeRestriction | null>(
    null,
  )
  const [releaseYear, setReleaseYear] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Створення твору</h1>
        {/* <HelperDialog
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
        /> */}
      </div>
      <div className={styles.Wrapper}>
        <div className={styles.Content}>
          <div className={styles.ContentHeaderWrapper}>
            <h1 className={styles.ContentTitle}>Створення твору</h1>
            {/* <HelperDialog
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
            /> */}
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
              <div>
                <span className={styles.Label}>
                  Обкладинка
                  <Tooltip text="Обов'язкове поле" align="start" />
                </span>
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
                            <CircleAlert className={styles.Error} size={30} />
                          </div>
                        )}

                      {!cover.fileState.uploading && (
                        <div className={styles.TrashButtonWrapper}>
                          <MotionButton
                            focusableWhenDisabled={true}
                            disabled={cover.fileState.isDeleting || isUploading}
                            onClick={cover.removeFile}
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
                                description: 'Не вдалося обрізати зображення',
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
              </div>

              <div>
                <span className={styles.Label}>Задній фон</span>
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
                            <CircleAlert className={styles.Error} size={30} />
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
                            onClick={background.removeFile}
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
                                description: 'Не вдалося обрізати зображення',
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
              </div>
            </div>

            <div>
              <label htmlFor="ukrName" className={styles.Label}>
                Назва українською
                <Tooltip text="Обов'язкове поле" align="start" />
              </label>
              <form.Field
                name="ukrName"
                children={(field) => (
                  <input
                    id="ukrName"
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="off"
                    className={styles.FieldInput}
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="enName" className={styles.Label}>
                Назва англійською
                <Tooltip text="Обов'язкове поле" align="start" />
              </label>
              <form.Field
                name="enName"
                children={(field) => (
                  <input
                    id="enName"
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="off"
                    className={styles.FieldInput}
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="alternativeNames" className={styles.Label}>
                Альтернативні назви
                <Tooltip
                  color="yellow"
                  text='Назви вказуйте за допомогою роздільника "/" через пробіл (назва 1 / назва 2 / назва 3)'
                  align="start"
                />
              </label>

              <form.Field
                name="alternativeNames"
                children={(field) => (
                  <input
                    id="alternativeNames"
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="off"
                    className={styles.FieldInput}
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="description" className={styles.Label}>
                Опис
              </label>
              <form.Field
                name="description"
                children={(field) => {
                  const remainingSymbols =
                    MAX_DESCRIPTION_LENGTH - field.state.value.length

                  return (
                    <>
                      <textarea
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
                    </>
                  )
                }}
              />
            </div>

            <div className={styles.MetadataWrapper}>
              <h3 className={styles.MetadataHeading}>
                <span>Метадані</span>
                <ShiftBy x={1} y={1.5}>
                  <Tooltip text="Усі поля обов'язкові" align="start" />
                </ShiftBy>
              </h3>
              <div className={styles.MetadataField}>
                <label htmlFor="workType" className={styles.Label}>
                  Тип
                </label>
                <SelectField
                  id="workType"
                  onValueChange={setWorkType}
                  value={workType}
                  options={Object.values(WorkType)}
                  labels={WORK_TYPE_LABELS}
                />
              </div>
              <div className={styles.MetadataField}>
                <label htmlFor="workStatus" className={styles.Label}>
                  Статус твору
                </label>
                <SelectField
                  id="workStatus"
                  onValueChange={setWorkStatus}
                  value={workStatus}
                  options={Object.values(WorkStatus)}
                  labels={WORK_STATUS_LABELS}
                />
              </div>
              <div className={styles.MetadataField}>
                <label htmlFor="translationStatus" className={styles.Label}>
                  Статус перекладу
                </label>
                <SelectField
                  id="translationStatus"
                  onValueChange={setTranslationStatus}
                  value={translationStatus}
                  options={Object.values(TranslationStatus)}
                  labels={TRANSLATION_STATUS_LABELS}
                />
              </div>
              <div className={styles.MetadataField}>
                <label htmlFor="ageRestriction" className={styles.Label}>
                  Вікові обмеження
                </label>
                <SelectField
                  id="ageRestriction"
                  onValueChange={setAgeRestriction}
                  value={ageRestriction}
                  options={Object.values(AgeRestriction)}
                  labels={AGE_RESTRICTION_LABELS}
                />
              </div>
              <div className={styles.MetadataField}>
                <label htmlFor="releaseYear" className={styles.Label}>
                  Рік випуску
                </label>
                <input
                  id="releaseYear"
                  name="releaseYear"
                  type="text"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(e.target.value)}
                  autoComplete="off"
                  className={styles.FieldInput}
                />
              </div>
            </div>

            <div>
              <span className={styles.Label}>Жанри</span>
              <ComboboxField
                items={GENRES}
                value={genres}
                onChange={setGenres}
              />
            </div>

            <div>
              <span className={styles.Label}>Теги</span>
              <ComboboxField items={TAGS} value={tags} onChange={setTags} />
            </div>

            {/* <form.Field
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
                  <div>
                    <div className={styles.LinksHeader}>
                      <span className={styles.Label}>
                        Посилання
                        <Tooltip text="Наполегливо просимо надати принаймні одне посилання на групу чи сайт команди" align='start' />
                      </span>
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
                  </div>
                )
              }}
            /> */}
          </form>
        </div>
        <footer className={styles.FooterMenu}>
          <MotionButton
            onClick={() => form.handleSubmit()}
            focusableWhenDisabled={true}
            // disabled={isUploading}
            className={clsx(styles.SendButton, 'Gradient', {
              // [styles.Loading]: isUploading,
            })}
          >
            {/* {isUploading ? (
              <>
                <span>Надсилаємо..</span>
                <LoaderCircle size={14} />
              </>
            ) : (
              'Надіслати на розгляд'
            )} */}
            Надіслати на розгляд
          </MotionButton>

          <MotionButton
            // onClick={handleClearForm}
            focusableWhenDisabled={true}
            className={clsx(styles.ClearButton, 'Gradient', {
              // [styles.Loading]: isUploading,
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

export default CreateWorkForm
