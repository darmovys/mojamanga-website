import {
  AgeRestriction,
  TranslationStatus,
  TitleStatus,
  TitleType,
} from '@/generated/prisma/enums'
import { useImageUpload } from '@/hooks/use-image-upload'
import { api } from '@/lib/api-client'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { Genre, Person, Tag, Team } from '@/lib/treaty-types'
import { sendNewTitleDataSchema, SourceShape } from '@/schemas/titles'
import {
  TitleEditableData,
  titlesQueries,
  usersQueries,
} from '@/services/queries'
import { useForm } from '@tanstack/react-form-start'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, useTransition } from 'react'

export type TitleFormMode = 'create' | 'revise' | 'edit'

export function useTitleForm(
  initialData?: TitleEditableData,
  mode: TitleFormMode = 'create',
) {
  const [isUploading, startUploadingTransition] = useTransition()
  const [isSourcesSectionShown, setIsSourcesSectionShown] = useState(true)
  const [isOverflowVisible, setIsOverflowVisible] = useState(true)
  const [hasAccordionAnimationFinished, setHasAccordionAnimationFinished] =
    useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      coverKey: initialData?.coverUrl ?? null,
      backgroundKey: initialData?.backgroundUrl ?? null,
      ukrName: initialData?.nameUkr ?? '',
      enName: initialData?.nameEng ?? '',
      alternativeNames: initialData?.alternativeNames.join(' / ') ?? '',
      description: initialData?.description ?? '',
      type: initialData?.type ?? (null as TitleType | null),
      titleStatus: initialData?.titleStatus ?? (null as TitleStatus | null),
      translationStatus:
        initialData?.translationStatus ?? (null as TranslationStatus | null),
      ageRestriction:
        initialData?.ageRestriction ?? (null as AgeRestriction | null),
      releaseYear: initialData?.releaseYear ?? '',
      genres: initialData?.genres ?? ([] as Genre[]),
      tags: initialData?.tags ?? ([] as Tag[]),
      authors: initialData?.authors ?? ([] as Person[]),
      artists: initialData?.artists ?? ([] as Person[]),
      teams: initialData?.teams ?? ([] as Team[]),
      sources: initialData?.sources ?? ([] as SourceShape[]),
    },
    onSubmit: async ({ value: formValues }) => {
      const parsedResult = sendNewTitleDataSchema.safeParse(formValues)

      if (!parsedResult.success) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: parsedResult.error.issues[0].message,
          },
          4000,
        )
        return
      }

      const validData = parsedResult.data

      if (mode == 'revise' && initialData) {
        startUploadingTransition(async () => {
          const { error, data } = await api()
            .titles({ id: initialData.id })
            .revise.patch(validData)
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

          await Promise.all([
            queryClient.invalidateQueries({ queryKey: titlesQueries.all }),
            queryClient.invalidateQueries({ queryKey: usersQueries.all }),
          ])
          navigate({
            to: '/user/$id/requests/titles',
            params: { id: data.userId },
            search: { status: 'pending' },
          })
          showTimedToast(
            {
              type: 'success',
              title: 'Успіх',
              description: data.message,
            },
            4000,
          )
        })
        return
      }

      startUploadingTransition(async () => {
        const { error, data } =
          await api().titles['add-new-title'].post(validData)
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
        await queryClient.invalidateQueries({ queryKey: titlesQueries.all })
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
      form.validateField('backgroundKey', 'change')
    },
  })

  function handleClearForm() {
    if (cover.fileState !== null) cover.removeFile({ quietCompletion: true })
    if (background.fileState !== null)
      background.removeFile({ quietCompletion: true })

    form.reset()

    setIsSourcesSectionShown(true)
    setIsOverflowVisible(true)
    setHasAccordionAnimationFinished(false)
  }

  function handleSourcesPresence() {
    if (!isSourcesSectionShown) {
      setIsSourcesSectionShown(true)
      setTimeout(() => setIsOverflowVisible(true), 250)
    } else {
      setHasAccordionAnimationFinished(false)
      setIsOverflowVisible(false)
      setIsSourcesSectionShown(false)
    }
  }

  return {
    cover,
    background,
    form,
    isUploading,
    handleClearForm,
    isSourcesSectionShown,
    setIsSourcesSectionShown,
    isOverflowVisible,
    hasAccordionAnimationFinished,
    setHasAccordionAnimationFinished,
    handleSourcesPresence,
  }
}
