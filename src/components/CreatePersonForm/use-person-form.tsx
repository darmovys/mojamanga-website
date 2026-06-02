import { useImageUpload } from '@/hooks/use-image-upload'
import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { peopleQueries } from '@/services/queries'
import { useForm } from '@tanstack/react-form-start'
import { useQueryClient } from '@tanstack/react-query'

import { useTransition } from 'react'

export function usePersonForm() {
  const cover = useImageUpload({ width: 375, height: 525 })
  const [isUploading, startUploadingTransition] = useTransition()
  const queryClient = useQueryClient()
  const form = useForm({
    defaultValues: {
      nameUkr: '',
      nameLat: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      if (value.nameUkr.trim() === '' || value.nameLat.trim() === '') {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: "Заповніть усі обов'язкові поля",
          },
          4000,
        )
        return
      }

      startUploadingTransition(async () => {
        const { error, data } = await api().people['create-person'].post({
          nameUkr: value.nameUkr,
          nameLat: value.nameLat,
          description: value.description,
          coverKey: cover.fileState?.key,
        })
        if (error) {
          console.log(error)
          if (error.status === 401) {
            showAuthToast()
          } else if (error.status === 422) {
            showTimedToast(
              {
                type: 'warning',
                title: 'Попередження',
                description: error.value.message,
              },
              4000,
            )
          } else if (error.status === 500 || error.status === 404) {
            showTimedToast(
              {
                type: 'error',
                title: 'Помилка',
                description: error.value,
              },
              4000,
            )
          } else {
            showTimedToast(
              {
                type: 'warning',
                title: 'Попередження',
                description: error.value,
              },
              4000,
            )
          }
          return
        }
        await queryClient.invalidateQueries({ queryKey: peopleQueries.all })
        showTimedToast(
          {
            type: 'success',
            title: 'Успіх',
            description: data.message,
          },
          4000,
        )
        form.reset()
        cover.clearFile()
      })
    },
  })

  function handleClearForm() {
    if (cover.fileState !== null) cover.removeFile()
    form.reset()
  }

  return {
    cover,
    form,
    isUploading,
    handleClearForm,
  }
}
