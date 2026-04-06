import { useCreateAvatar } from './use-create-avatar'
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

function CreateTeamForm() {
  const {
    fileState,
    getRootProps,
    isDragActive,
    getInputProps,
    removeFile,
    imageToCrop,
    cropImageUrl,
    uploadFile,
    setImageToCrop,
  } = useCreateAvatar()
  return (
    <div className={styles.MaxWidthWrapper}>
      <GoBackHeader title="Створення команди" />
      <div className={styles.Wrapper}>
        <div className={styles.Content}>
          <h1 className={styles.ContentTitle}>Створення команди</h1>
          <span className={styles.Label}>Обкладинка</span>
          <div className={styles.UploadAvatarWrapper}>
            {!fileState && (
              <div
                {...getRootProps({
                  role: 'button',
                  'aria-label': 'drag and drop area',
                })}
                className={styles.UploadZone}
                data-drag-active={isDragActive}
              >
                <input {...getInputProps()} />
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

            {fileState && (
              <div className={styles.UploadedAvatar}>
                <Image
                  layout="fullWidth"
                  alt={fileState.file.name}
                  src={fileState.objectUrl ?? ''}
                  draggable={false}
                />

                {fileState.uploading && !fileState.isDeleting && (
                  <div className={styles.Overlay}>{fileState.progress}%</div>
                )}

                {!fileState.uploading &&
                  !fileState.isDeleting &&
                  fileState.error && (
                    <div className={styles.Overlay}>
                      <CircleAlert className={styles.Error} size={30} />
                    </div>
                  )}

                {!fileState.uploading && (
                  <Button
                    className={styles.TrashButton}
                    focusableWhenDisabled={true}
                    disabled={fileState.isDeleting}
                    onClick={removeFile}
                  >
                    <ClickTargetHelper />
                    {fileState.isDeleting ? (
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
              {imageToCrop && cropImageUrl && (
                <CropImageDialog
                  src={cropImageUrl}
                  originalName={imageToCrop.name}
                  croppedWidth={375}
                  croppedHeight={525}
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
                    uploadFile(file)
                  }}
                  onClose={() => {
                    setImageToCrop(null)
                  }}
                />
              )}
            </AnimatePresence>
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
