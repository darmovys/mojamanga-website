import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { convertToWebP, getImageDimensions } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'

interface FileState {
  file: File
  uploading: boolean
  progress: number
  key?: string
  isDeleting: boolean
  error: boolean
  objectUrl?: string
  accentColor?: string
  isExtractingAccentColor: boolean
}

interface ImageUploadConfig {
  width: number
  height: number
  onKeyChange?: (key: string | null) => void
  onAccentColorChange?: (color: string | null) => void
}

export function useImageUpload({
  width,
  height,
  onKeyChange,
  onAccentColorChange,
}: ImageUploadConfig) {
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

  function clearFile() {
    if (!fileState) return
    if (fileState.objectUrl) URL.revokeObjectURL(fileState.objectUrl)
    setFileState(null)
  }

  async function removeFile({
    quietCompletion = false,
  }: { quietCompletion?: boolean } = {}) {
    if (!fileState) return

    if (!fileState.key) {
      if (fileState.objectUrl) URL.revokeObjectURL(fileState.objectUrl)
      setFileState(null)
      return
    }

    setFileState((prev) => (prev ? { ...prev, isDeleting: true } : null))

    try {
      const { data, error } = await api().files.temp.file.delete({
        key: fileState.key,
      })

      if (error !== null) {
        if (error.status === 401) {
          showAuthToast()
        } else if (error.status === 422) {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.value.message,
            },
            3000,
          )
        } else {
          showTimedToast(
            { type: 'error', title: 'Помилка', description: error.value },
            3000,
          )
        }

        setFileState((prev) =>
          prev ? { ...prev, isDeleting: false, error: true } : null,
        )
        return
      }

      if (!quietCompletion) {
        showTimedToast(
          { type: 'success', title: 'Успіх', description: data.message },
          4000,
        )
      }

      onKeyChange?.(null)
      onAccentColorChange?.(null)
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

  async function getImageAccentColor(file: File) {
    try {
      const { error, data } = await api().files['extract-accent-color'].post({
        file,
      })

      if (error || !data.accentColor) {
        setFileState((prev) =>
          prev
            ? {
                ...prev,
                accentColor: undefined,
                isExtractingAccentColor: false,
              }
            : null,
        )
        onAccentColorChange?.(null)
        return
      }

      setFileState((prev) =>
        prev
          ? {
              ...prev,
              accentColor: data.accentColor,
              isExtractingAccentColor: false,
            }
          : null,
      )

      onAccentColorChange?.(data.accentColor)
    } catch (_) {
      setFileState((prev) =>
        prev
          ? { ...prev, accentColor: undefined, isExtractingAccentColor: false }
          : null,
      )
      onAccentColorChange?.(null)
    }
  }

  async function uploadFile(file: File) {
    const objectUrl = URL.createObjectURL(file)

    if (
      fileState?.uploading ||
      fileState?.isExtractingAccentColor ||
      fileState?.isDeleting
    )
      return

    setFileState({
      file,
      uploading: true,
      progress: 0,
      isDeleting: false,
      error: false,
      objectUrl,
      accentColor: undefined,
      isExtractingAccentColor: true,
    })

    try {
      const { data, error } = await api().files.temp.upload.post({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      })

      if (error !== null) {
        if (error.status === 401) {
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
        } else if (error.status === 400 || error.status === 429) {
          showTimedToast(
            {
              type: 'warning',
              title: 'Попередження',
              description: error.value,
            },
            4000,
          )
        } else {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.value,
            },
            4000,
          )
        }

        setFileState((prev) =>
          prev
            ? {
                ...prev,
                uploading: false,
                error: true,
                isExtractingAccentColor: false,
              }
            : null,
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
            onKeyChange?.(key)
            getImageAccentColor(file)
            resolve()
          } else {
            setFileState((prev) =>
              prev
                ? {
                    ...prev,
                    accentColor: undefined,
                    isExtractingAccentColor: false,
                  }
                : null,
            )
            onAccentColorChange?.(null)
            reject(new Error(`Помилка завантаження. Статус: ${xhr.status}`))
          }
        }

        xhr.onerror = () => {
          setFileState((prev) =>
            prev
              ? {
                  ...prev,
                  accentColor: undefined,
                  isExtractingAccentColor: false,
                }
              : null,
          )
          onAccentColorChange?.(null)
          reject(new Error('Помилка завантаження'))
        }

        xhr.open('PUT', presignedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
    } catch (error) {
      showTimedToast({ type: 'error', title: 'Помилка завантаження' }, 3000)
      setFileState((prev) =>
        prev
          ? {
              ...prev,
              uploading: false,
              error: true,
              progress: 0,
              isExtractingAccentColor: false,
            }
          : null,
      )
    }
  }

  async function cropFile(file: File) {
    if (file.type === 'image/gif') {
      setImageToCrop(file)
    } else {
      const webpFile = await convertToWebP(file)
      setImageToCrop(webpFile)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const receivedFile = acceptedFiles[0]
        try {
          const dimensions = await getImageDimensions(receivedFile)
          if (dimensions.height < height) {
            showTimedToast(
              {
                type: 'warning',
                title: 'Попередження',
                description: `Висота зображення повинна становити принаймні ${height}px`,
              },
              4000,
            )
            return
          }
          if (dimensions.width < width) {
            showTimedToast(
              {
                type: 'warning',
                title: 'Попередження',
                description: `Ширина зображення повинна становити принаймні ${width}px`,
              },
              4000,
            )
            return
          }
          if (dimensions.width === width && dimensions.height === height) {
            if (receivedFile.type === 'image/gif') {
              uploadFile(receivedFile)
            } else {
              const webpFile = await convertToWebP(receivedFile)
              uploadFile(webpFile)
            }
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
    disabled:
      fileState?.isDeleting ||
      fileState?.isExtractingAccentColor ||
      fileState?.uploading,
  })

  return {
    fileState,
    getRootProps,
    getInputProps,
    isDragActive,
    cropFile,
    removeFile,
    clearFile,
    uploadFile,
    imageToCrop,
    setImageToCrop,
    cropImageUrl,
    croppedWidth: width,
    croppedHeight: height,
  }
}
