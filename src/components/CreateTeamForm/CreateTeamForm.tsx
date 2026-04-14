import GoBackHeader from '../GoBackHeader'
import {
  ChevronUp,
  CircleAlert,
  Link,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { Image } from '@unpic/react'
import { Accordion } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import { AnimatePresence, motion } from 'motion/react'
import CropImageDialog from '../CropImageDialog'
import { showTimedToast } from '@/lib/toast'
import styles from './CreateTeamForm.module.scss'
import { Tooltip } from './Tooltip'
import clsx from 'clsx'
import { LinkType } from '@/generated/prisma/enums'
import MotionButton, { tapAnimation } from '../MotionButton'
import MobileNavigation from '../MobileNavigation'
import { produce } from 'immer'
import { createId } from '@paralleldrive/cuid2'
import { LinkInputField } from './LinkInputField'
import { LINK_META, useTeamForm } from './use-team-form'

const MAX_DESCRIPTION_LENGTH = 500

function CreateTeamForm() {
  const {
    avatar,
    background,
    form,
    handleClearForm,
    handleLinksPresence,
    hasAccordionAnimationFinished,
    setHasAccordionAnimationFinished,
    isOverflowVisible,
    isLinksSectionShown,
    setIsLinksSectionShown,
  } = useTeamForm()

  return (
    <div className={styles.MaxWidthWrapper}>
      <GoBackHeader title="Створення команди" />
      <div className={styles.Wrapper}>
        <div className={styles.Content}>
          <h1 className={styles.ContentTitle}>Створення команди</h1>
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
                  Аватар
                  <Tooltip text="Обов'язкове поле" />
                </span>
                <div className={styles.UploadAvatarWrapper}>
                  {!avatar.fileState && (
                    <motion.div
                      {...tapAnimation}
                      {...avatar.getRootProps({
                        role: 'button',
                        'aria-label': 'drag and drop area',
                      })}
                      className={styles.UploadZone}
                      data-drag-active={avatar.isDragActive}
                    >
                      <input {...avatar.getInputProps()} />
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

                  {avatar.fileState && (
                    <div className={styles.UploadedCover}>
                      <Image
                        layout="fullWidth"
                        alt={avatar.fileState.file.name}
                        src={avatar.fileState.objectUrl ?? ''}
                        draggable={false}
                      />

                      {avatar.fileState.uploading &&
                        !avatar.fileState.isDeleting && (
                          <div className={styles.Overlay}>
                            {avatar.fileState.progress}%
                          </div>
                        )}

                      {!avatar.fileState.uploading &&
                        !avatar.fileState.isDeleting &&
                        avatar.fileState.error && (
                          <div className={styles.Overlay}>
                            <CircleAlert className={styles.Error} size={30} />
                          </div>
                        )}

                      {!avatar.fileState.uploading && (
                        <div className={styles.TrashButtonWrapper}>
                          <MotionButton
                            focusableWhenDisabled={true}
                            disabled={avatar.fileState.isDeleting}
                            onClick={avatar.removeFile}
                            className={styles.TrashButton}
                          >
                            <ClickTargetHelper />
                            {avatar.fileState.isDeleting ? (
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
                    {avatar.imageToCrop && avatar.cropImageUrl && (
                      <CropImageDialog
                        src={avatar.cropImageUrl}
                        originalName={avatar.imageToCrop.name}
                        croppedWidth={avatar.croppedWidth}
                        croppedHeight={avatar.croppedHeight}
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
                          avatar.uploadFile(file)
                        }}
                        onClose={() => {
                          avatar.setImageToCrop(null)
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
                            disabled={background.fileState.isDeleting}
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
              <label htmlFor="title" className={styles.Label}>
                Назва
                <Tooltip text="Обов'язкове поле" />
              </label>
              <form.Field
                name="title"
                children={(field) => (
                  <input
                    id="title"
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
                  <div>
                    <div className={styles.LinksHeader}>
                      <span className={styles.Label}>
                        Посилання
                        <Tooltip text="Наполегливо просимо надати принаймні одне посилання на групу чи сайт команди для більш ймовірного схвалення" />
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
            />
          </form>
        </div>
        <footer className={styles.FooterMenu}>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <MotionButton
                onClick={() => form.handleSubmit()}
                disabled={!canSubmit || isSubmitting}
                className={clsx(styles.SendButton, 'Gradient')}
              >
                {isSubmitting ? 'Створення...' : 'Створити'}
              </MotionButton>
            )}
          />

          <MotionButton
            onClick={handleClearForm}
            className={clsx(styles.ClearButton, 'Gradient')}
          >
            Очистити
          </MotionButton>
        </footer>
        <MobileNavigation />
      </div>
    </div>
  )
}

export default CreateTeamForm
