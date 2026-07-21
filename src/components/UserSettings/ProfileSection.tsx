import { Field } from '@base-ui/react'
import {
  MAX_DESCRIPTION_LENGTH,
  useProfileSection,
} from './use-profile-section'
import { AnimatePresence } from 'motion/react'
import MotionButton from '../MotionButton'
import { CircleAlert, LoaderCircle, Trash2, UploadCloud } from 'lucide-react'
import { Image } from '@unpic/react'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import CropImageDialog from '../CropImageDialog'
import clsx from 'clsx'
import Skeleton from '../Skeleton'
import { range } from '@/lib/utils'
import styles from './Section.module.scss'

function ProfileSection() {
  const { form, data, isUploading, avatar, background } = useProfileSection()

  return (
    <form
      className={styles.Form}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="avatarKey"
        children={(field) => {
          const currentAvatarKey = field.state.value

          // 1. Перевіряємо, чи завантажено нову аватарку (блоб/тимчасовий файл)
          const hasNewAvatar = !!avatar.fileState?.objectUrl

          // 2. Перевіряємо, чи є оригінальна аватарка з бази і чи користувач її ще НЕ видалив
          const hasOriginalAvatar =
            !avatar.fileState && data.image && currentAvatarKey === data.image

          // Картка поруч відображається лише тоді, коли є що показувати (нова або стара збережена аватарка)
          const shouldShowPreview = hasNewAvatar || hasOriginalAvatar

          return (
            <Field.Root
              invalid={
                !field.state.meta.isValid && form.state.submissionAttempts > 0
              }
            >
              <Field.Label
                nativeLabel={false}
                render={<div />}
                className={styles.Label}
              >
                Аватар
              </Field.Label>

              <div className={styles.AvatarWrapper}>
                {/* ЗОНА ЗАВАНТАЖЕННЯ */}
                <MotionButton
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
                </MotionButton>

                {/* КАРТКА ПРЕВ'Ю: З'являється праворуч, якщо є активне зображення */}
                {shouldShowPreview && (
                  <div className={styles.UploadedCover}>
                    <Image
                      layout="fullWidth"
                      alt={`Аватар користувача ${data.displayUsername}`}
                      src={
                        hasNewAvatar
                          ? avatar.fileState!.objectUrl!
                          : `${import.meta.env.VITE_STORAGE_URL}${data.image}`
                      }
                      draggable={false}
                    />

                    {/* Ефекти завантаження на S3 для нових файлів */}
                    {hasNewAvatar &&
                      avatar.fileState!.uploading &&
                      !avatar.fileState!.isDeleting && (
                        <div className={styles.Overlay}>
                          {avatar.fileState!.progress}%
                        </div>
                      )}

                    {/* Помилка завантаження */}
                    {hasNewAvatar &&
                      !avatar.fileState!.uploading &&
                      !avatar.fileState!.isDeleting &&
                      avatar.fileState!.error && (
                        <div className={styles.Overlay}>
                          <CircleAlert className={styles.Error} size={30} />
                        </div>
                      )}

                    {/* Кнопка видалення картки прев'ю */}
                    {(!hasNewAvatar || !avatar.fileState!.uploading) && (
                      <div className={styles.FloatingButtonWrapper}>
                        <MotionButton
                          focusableWhenDisabled={true}
                          disabled={
                            hasNewAvatar
                              ? avatar.fileState!.isDeleting || isUploading
                              : isUploading
                          }
                          onClick={() => {
                            if (hasNewAvatar) {
                              // Якщо це була нова тимчасова аватарка, видаляємо її з /temp сховища
                              avatar.removeFile()
                            } else {
                              // Якщо це стара аватарка з бази, просто очищуємо значення у формі
                              field.handleChange('')
                            }
                          }}
                          className={styles.TrashImageButton}
                        >
                          <ClickTargetHelper />
                          {hasNewAvatar && avatar.fileState!.isDeleting ? (
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

                {/* Кропер (діалогове вікно) */}
                <AnimatePresence>
                  {avatar.imageToCrop && avatar.cropImageUrl && (
                    <CropImageDialog
                      src={avatar.cropImageUrl}
                      originalName={avatar.imageToCrop.name}
                      fileType={avatar.imageToCrop.type}
                      originalFile={avatar.imageToCrop}
                      croppedWidth={avatar.croppedWidth}
                      croppedHeight={avatar.croppedHeight}
                      onCropped={(file) => {
                        if (!file) return
                        avatar.uploadFile(file)
                      }}
                      onClose={() => {
                        avatar.setImageToCrop(null)
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

          // 1. Перевіряємо, чи завантажено новий фон (блоб/тимчасовий файл)
          const hasNewBackground = !!background.fileState?.objectUrl

          // 2. Перевіряємо, чи є оригінальний фон з бази і чи користувач його ще НЕ видалив
          const hasOriginalBackground =
            !background.fileState &&
            data.backgroundUrl &&
            currentBackgroundKey === data.backgroundUrl

          // Картка поруч відображається лише тоді, коли є що показувати (новий або старий збережений фон)
          const shouldShowPreview = hasNewBackground || hasOriginalBackground

          return (
            <Field.Root
              invalid={
                !field.state.meta.isValid && form.state.submissionAttempts > 0
              }
            >
              <Field.Label
                nativeLabel={false}
                render={<div />}
                className={styles.Label}
              >
                Фонове зображення
              </Field.Label>

              <div className={styles.BackgroundWrapper}>
                {/* ЗОНА ЗАВАНТАЖЕННЯ */}
                <MotionButton
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
                </MotionButton>

                {/* КАРТКА ПРЕВ'Ю: З'являється праворуч, якщо є активне зображення */}
                {shouldShowPreview && (
                  <div className={styles.UploadedCover}>
                    <Image
                      layout="fullWidth"
                      alt={`Фонове зображення користувача ${data.displayUsername}`}
                      src={
                        hasNewBackground
                          ? background.fileState!.objectUrl!
                          : `${import.meta.env.VITE_STORAGE_URL}${data.backgroundUrl}`
                      }
                      draggable={false}
                    />

                    {/* Ефекти завантаження на S3 для нових файлів */}
                    {hasNewBackground &&
                      background.fileState!.uploading &&
                      !background.fileState!.isDeleting && (
                        <div className={styles.Overlay}>
                          {background.fileState!.progress}%
                        </div>
                      )}

                    {/* Помилка завантаження */}
                    {hasNewBackground &&
                      !background.fileState!.uploading &&
                      !background.fileState!.isDeleting &&
                      background.fileState!.error && (
                        <div className={styles.Overlay}>
                          <CircleAlert className={styles.Error} size={30} />
                        </div>
                      )}

                    {/* Кнопка видалення картки прев'ю */}
                    {(!hasNewBackground ||
                      !background.fileState!.uploading) && (
                      <div className={styles.FloatingButtonWrapper}>
                        <MotionButton
                          focusableWhenDisabled={true}
                          disabled={
                            hasNewBackground
                              ? background.fileState!.isDeleting || isUploading
                              : isUploading
                          }
                          onClick={() => {
                            if (hasNewBackground) {
                              // Якщо це був новий тимчасовий фон, видаляємо його з /temp сховища
                              background.removeFile()
                            } else {
                              // Якщо це старий фон з бази, просто очищуємо значення у формі
                              field.handleChange('')
                            }
                          }}
                          className={styles.TrashImageButton}
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

                {/* Кропер (діалогове вікно) */}
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
        name="username"
        children={(field) => (
          <Field.Root
            name={field.name}
            invalid={!field.state.meta.isValid}
            dirty={field.state.meta.isDirty}
            touched={field.state.meta.isTouched}
          >
            <Field.Label htmlFor={field.name} className={styles.Label}>
              Псевдонім
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

      <MotionButton
        type="submit"
        focusableWhenDisabled={true}
        disabled={isUploading}
        className={clsx(styles.SaveButton, 'Gradient', {
          [styles.Loading]: isUploading,
        })}
      >
        {isUploading ? (
          <>
            <span>Зберігаємо..</span>
            <LoaderCircle size={14} />
          </>
        ) : (
          'Зберегти зміни'
        )}
      </MotionButton>
    </form>
  )
}

export function ProfileSectionSkeleton() {
  return (
    <div className={styles.Form}>
      <div>
        <span className={styles.Label}>Аватар</span>
        <div className={styles.AvatarWrapper}>
          {range(2).map((index) => (
            <Skeleton
              key={index}
              width="var(--128px)"
              height="var(--128px)"
              borderRadius="var(--4px)"
            />
          ))}
        </div>
      </div>

      <div>
        <span className={styles.Label}>Фонове зображення</span>
        <Skeleton
          height="var(--200px)"
          width="100%"
          borderRadius="var(--4px)"
        />
      </div>

      <div>
        <span className={styles.Label}>Псевдонім</span>
        <Skeleton height="var(--40px)" width="100%" borderRadius="var(--4px)" />
      </div>

      <div>
        <span className={styles.Label}>Опис</span>
        <Skeleton
          height="var(--160px)"
          width="100%"
          borderRadius="var(--4px)"
        />
      </div>
    </div>
  )
}

export default ProfileSection
