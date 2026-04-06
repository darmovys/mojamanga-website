import { createFileRoute } from '@tanstack/react-router'
import styles from './create.module.scss'
import GoBackHeader from '@/components/GoBackHeader'
import { Button } from '@base-ui/react'
import { CircleAlert, LoaderCircle, Trash2, UploadCloud } from 'lucide-react'
import { FileRejection, useDropzone } from 'react-dropzone'
import { useCallback, useEffect, useState } from 'react'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { Image } from '@unpic/react'
import { api } from '@/lib/api-client'
import VisuallyHidden from '@/components/VisuallyHidden'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import Resizer from 'react-image-file-resizer'
import CropImageDialog from '@/components/CropImageDialog'
import { AnimatePresence } from 'motion/react'

export const Route = createFileRoute('/team/create/')({
  component: RouteComponent,
})

interface FileState {
  file: File
  uploading: boolean
  progress: number
  key?: string
  isDeleting: boolean
  error: boolean
  objectUrl?: string
}

function RouteComponent() {
  const [fileState, setFileState] = useState<FileState | null>(null)
  const [imageToCrop, setImageToCrop] = useState<File | null>(null)

  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!imageToCrop) {
      setCropImageUrl(null)
      return
    }

    const newUrl = URL.createObjectURL(imageToCrop)
    setCropImageUrl(newUrl)

    return () => {
      URL.revokeObjectURL(newUrl)
    }
  }, [imageToCrop])

  useEffect(() => {
    return () => {
      if (fileState?.objectUrl) {
        URL.revokeObjectURL(fileState.objectUrl)
      }
    }
  }, [fileState?.objectUrl])

  async function removeFile() {
    if (!fileState) return

    if (!fileState.key) {
      if (fileState.objectUrl) URL.revokeObjectURL(fileState.objectUrl)
      setFileState(null)
      return
    }

    setFileState((prev) => (prev ? { ...prev, isDeleting: true } : null))

    try {
      const { data, error } = await api()
        .files.temp({ key: encodeURIComponent(fileState.key) })
        .delete()

      if (error !== null) {
        if (error.value === 'Необхідна авторизація') {
          showAuthToast()
        } else if (error.status !== 422) {
          showTimedToast(
            { type: 'error', title: 'Помилка', description: error.value },
            3000,
          )
        } else {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.value.message,
            },
            3000,
          )
        }

        setFileState((prev) =>
          prev ? { ...prev, isDeleting: false, error: true } : null,
        )
        return
      }

      showTimedToast(
        { type: 'success', title: 'Успіх', description: data.message },
        4000,
      )

      setFileState(null)
    } catch (_) {
      showTimedToast(
        {
          type: 'error',
          title: 'Помилка',
          description: 'Не вдалося видалити файл',
        },
        3000,
      )
      setFileState((prev) =>
        prev ? { ...prev, isDeleting: false, error: true } : null,
      )
    }
  }

  async function uploadFile(file: File) {
    const objectUrl = URL.createObjectURL(file)

    setFileState({
      file,
      uploading: true,
      progress: 0,
      isDeleting: false,
      error: false,
      objectUrl,
    })

    try {
      const { data, error } = await api().files.temp.upload.post({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      })

      if (error !== null) {
        if (error.value === 'Необхідна авторизація') {
          showAuthToast()
        } else if (error.status === 422) {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.value.message,
            },
            4000,
          )
        } else {
          showTimedToast(
            { type: 'error', title: 'Помилка', description: error.value },
            4000,
          )
        }

        setFileState((prev) =>
          prev ? { ...prev, uploading: false, error: true } : null,
        )
        return
      }

      const { key, presignedUrl } = data.response

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentageCompleted = Math.round(
              (event.loaded / event.total) * 100,
            )
            setFileState((prev) =>
              prev ? { ...prev, progress: percentageCompleted, key } : null,
            )
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) =>
              prev
                ? { ...prev, progress: 100, uploading: false, error: false }
                : null,
            )
            showTimedToast(
              {
                type: 'success',
                title: 'Успіх',
                description: 'Зображення завантажено',
              },
              3000,
            )
            resolve()
          } else {
            reject(new Error(`Помилка завантаження. Статус: ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Помилка завантаження'))

        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
    } catch (error) {
      showTimedToast({ type: 'error', title: 'Помилка завантаження' }, 3000)
      setFileState((prev) =>
        prev ? { ...prev, uploading: false, error: true, progress: 0 } : null,
      )
    }
  }

  function cropFile(file: File) {
    Resizer.imageFileResizer(
      file,
      99999,
      99999,
      'webp',
      100,
      0,
      (uri) => setImageToCrop(uri as File),
      'file',
    )
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const receivedFile = acceptedFiles[0]
      try {
        const dimensions = await getImageDimensions(receivedFile)
        if (dimensions.height === 525 && dimensions.width === 375) {
          Resizer.imageFileResizer(
            receivedFile,
            99999,
            99999,
            'webp',
            100,
            0,
            (uri) => uploadFile(uri as File),
            'file',
          )
        } else if (dimensions.height < 525) {
          showTimedToast(
            {
              type: 'warning',
              title: 'Попередження',
              description:
                'Висота зображення повинна становити принаймні 375px',
            },
            4000,
          )
          return
        } else if (dimensions.width < 525) {
          showTimedToast(
            {
              type: 'warning',
              title: 'Попередження',
              description:
                'Ширина зображення повинна становити принаймні 525px',
            },
            4000,
          )
          return
        } else {
          cropFile(receivedFile)
        }
      } catch (_) {
        showTimedToast(
          {
            type: 'error',
            title: 'Помилка',
            description: 'Не вдалося завантажити зображення',
          },
          4000,
        )
        return
      }
    }
  }, [])

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const tooManyFiles = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === 'too-many-files',
      )

      const fileIsTooLarge = fileRejections.find(
        (fileRejection) => fileRejection.errors[0].code === 'file-too-large',
      )

      if (tooManyFiles) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Ви можете вибрати лише одне зображення',
          },
          4000,
        )
      }

      if (fileIsTooLarge) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Розмір зображення не має перевищувати 5МБ',
          },
          4000,
        )
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5,
    accept: {
      'image/*': [],
    },
    multiple: false,
  })

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

const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }

    img.onerror = () => {
      reject(new Error('Не вдалося завантажити зображення'))
      URL.revokeObjectURL(url)
    }

    img.src = url
  })
}
