import { Button } from '@base-ui/react'
import { useGoBack } from '@/hooks/use-go-back'
import ClickTargetHelper from '../ClickTargetHelper'
import {
  ArrowLeft,
  CircleAlert,
  Info,
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
import { usePersonForm } from './use-person-form'
import CropImageDialog from '../CropImageDialog'
import { showTimedToast } from '@/lib/toast'
import { useHelperDialog } from '@/hooks/use-helper-dialog'
import { getRouteApi } from '@tanstack/react-router'
import HelperDialog from '../HelperDialog'
import styles from './CreatePersonForm.module.scss'

const MAX_DESCRIPTION_LENGTH = 500

const routeApi = getRouteApi('/people/create/')

function CreatePersonForm() {
  const { handleGoBack } = useGoBack()
  const { form, cover, isUploading, handleClearForm } = usePersonForm()

  const loaderData = routeApi.useLoaderData()

  const { title, content, mdast, isHelperOpen, handleHelperOpenChange } =
    useHelperDialog('seen_create_person_rules', loaderData)

  return (
    <div className={styles.MaxWidthWrapper}>
      <div className={styles.GoBackHeader}>
        <Button onClick={handleGoBack} className={styles.GoBackHeaderButton}>
          <ClickTargetHelper />
          <ArrowLeft size={20} />
          <VisuallyHidden>Повернутися на попередню сторінку</VisuallyHidden>
        </Button>
        <h1 className={styles.GoBackHeading}>Додавання персони</h1>
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
            <h1 className={styles.ContentTitle}>Додаваня персони</h1>
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
            <div>
              <span className={styles.Label}>Обкладинка</span>
              <div className={styles.UploadWrapper}>
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
              <label htmlFor="nameUkr" className={styles.Label}>
                Ім'я українською
                <Tooltip text="Обов'язкове поле" align="start" />
              </label>
              <form.Field
                name="nameUkr"
                children={(field) => (
                  <input
                    id="nameUkr"
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
              <label htmlFor="nameLat" className={styles.Label}>
                Ім'я латиною (Романджі, Піньїнь і т.п.)
                <Tooltip text="Обов'язкове поле" align="start" />
              </label>
              <form.Field
                name="nameLat"
                children={(field) => (
                  <input
                    id="nameLat"
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

export default CreatePersonForm
