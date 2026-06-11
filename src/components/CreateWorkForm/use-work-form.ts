import {
  AgeRestriction,
  TranslationStatus,
  WorkStatus,
  WorkType,
} from '@/generated/prisma/enums'
import { useImageUpload } from '@/hooks/use-image-upload'
import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { Genre, Person, Tag, Team } from '@/lib/treaty-types'
import { addWorkSchema } from '@/schemas/works'
import { worksQueries } from '@/services/queries'
import { useForm } from '@tanstack/react-form-start'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTransition } from 'react'

export function useWorkForm() {
  const [isUploading, startUploadingTransition] = useTransition()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      coverKey: '',
      backgroundKey: '',
      ukrName: '',
      enName: '',
      alternativeNames: '',
      description: '',
      type: null as WorkType | null,
      workStatus: null as WorkStatus | null,
      translationStatus: null as TranslationStatus | null,
      ageRestriction: null as AgeRestriction | null,
      releaseYear: '',
      genres: [] as Genre[],
      tags: [] as Tag[],
      authors: [] as Person[],
      artists: [] as Person[],
      teams: [] as Team[],
    },
    onSubmit: async ({ value: formValues }) => {
      const parsedResult = addWorkSchema.safeParse(formValues)

      if (!parsedResult.success) {
        showTimedToast({
          type: 'warning',
          title: 'Попередження',
          description: parsedResult.error.issues[0].message,
        })
        return
      }

      startUploadingTransition(async () => {
        const { error, data } = await api().works['add-work'].post(
          parsedResult.data,
        )
        if (error) {
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
        await queryClient.invalidateQueries({ queryKey: worksQueries.all })
        navigate({ to: '/' })
        showTimedToast(
          {
            type: 'success',
            title: 'Успіх',
            description: data.message,
          },
          4000,
        )
      })
    },
  })

  const cover = useImageUpload({
    width: 375,
    height: 525,
    onKeyChange: (key) => {
      form.setFieldValue('coverKey', key ?? '')
      form.validateField('coverKey', 'change')
    },
  })
  const background = useImageUpload({
    width: 1450,
    height: 540,
    onKeyChange: (key) => {
      form.setFieldValue('backgroundKey', key ?? '')
    },
  })

  function handleClearForm() {
    if (cover.fileState !== null) cover.removeFile({ quietCompletion: true })
    if (background.fileState !== null)
      background.removeFile({ quietCompletion: true })
    form.reset()
  }

  return {
    cover,
    background,
    form,
    isUploading,
    handleClearForm,
  }
}
