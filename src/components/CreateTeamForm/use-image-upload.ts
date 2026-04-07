import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { getImageDimensions } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import Resizer from 'react-image-file-resizer'

interface FileState {
  file: File
  uploading: boolean
  progress: number
  key?: string
  isDeleting: boolean
  error: boolean
  objectUrl?: string
}

interface ImageUploadConfig {
  width: number
  height: number
}

export function useImageUpload(config: ImageUploadConfig) {
  const { width, height } = config

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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const receivedFile = acceptedFiles[0]
        try {
          const dimensions = await getImageDimensions(receivedFile)
          if (dimensions.width === width && dimensions.height === height) {
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
          } else if (dimensions.height < height) {
            showTimedToast(
              {
                type: 'warning',
                title: 'Попередження',
                description: `Висота зображення повинна становити принаймні ${height}px`,
              },
              4000,
            )
            return
          } else if (dimensions.width < width) {
            showTimedToast(
              {
                type: 'warning',
                title: 'Попередження',
                description: `Ширина зображення повинна становити принаймні ${width}px`,
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
    },
    [width, height],
  )

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

  return {
    fileState,
    getRootProps,
    getInputProps,
    isDragActive,
    cropFile,
    removeFile,
    uploadFile,
    imageToCrop,
    setImageToCrop,
    cropImageUrl,
    croppedWidth: width,
    croppedHeight: height,
  }
}
