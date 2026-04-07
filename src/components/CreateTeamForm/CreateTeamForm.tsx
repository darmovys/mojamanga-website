import GoBackHeader from '../GoBackHeader'
import { CircleAlert, LoaderCircle, Trash2, UploadCloud } from 'lucide-react'
import { Image } from '@unpic/react'
import { Button } from '@base-ui/react'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import { AnimatePresence } from 'motion/react'
import CropImageDialog from '../CropImageDialog'
import { showTimedToast } from '@/lib/toast'
import styles from './CreateTeamForm.module.scss'
import { useImageUpload } from './use-image-upload'

function CreateTeamForm() {
  const avatar = useImageUpload({ width: 375, height: 525 })
  const background = useImageUpload({ width: 1450, height: 540 })

  return (
    <div className={styles.MaxWidthWrapper}>
      <GoBackHeader title="Створення команди" />
      <div className={styles.Wrapper}>
        <div className={styles.Content}>
          <div>
            <h1 className={styles.ContentTitle}>Створення команди</h1>
            <span className={styles.Label}>Обкладинка</span>
            <div className={styles.UploadAvatarWrapper}>
              {!avatar.fileState && (
                <div
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
                </div>
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
                    <Button
                      className={styles.TrashButton}
                      focusableWhenDisabled={true}
                      disabled={avatar.fileState.isDeleting}
                      onClick={avatar.removeFile}
                    >
                      <ClickTargetHelper />
                      {avatar.fileState.isDeleting ? (
                        <>
                          <LoaderCircle className={styles.Loader} size={16} />
                          <VisuallyHidden>Видаляємо зображення</VisuallyHidden>
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          <VisuallyHidden>Видалити зображення</VisuallyHidden>
                        </>
                      )}
                    </Button>
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
                <div
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
                </div>
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
                    <Button
                      className={styles.TrashButton}
                      focusableWhenDisabled={true}
                      disabled={background.fileState.isDeleting}
                      onClick={background.removeFile}
                    >
                      <ClickTargetHelper />
                      {background.fileState.isDeleting ? (
                        <>
                          <LoaderCircle className={styles.Loader} size={16} />
                          <VisuallyHidden>Видаляємо зображення</VisuallyHidden>
                        </>
                      ) : (
                        <>
                          <Trash2 size={16} />
                          <VisuallyHidden>Видалити зображення</VisuallyHidden>
                        </>
                      )}
                    </Button>
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
        <footer className={styles.FooterMenu}>
          <Button>Створити</Button>
          <Button>Очистити</Button>
        </footer>
      </div>
    </div>
  )
}

export default CreateTeamForm
