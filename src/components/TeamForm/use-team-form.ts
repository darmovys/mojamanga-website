import { useForm } from '@tanstack/react-form-start'
import { useState, useTransition } from 'react'
import { useImageUpload } from '../../hooks/use-image-upload'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { ActiveLinkInput, sendNewTeamDataSchema } from '@/schemas/teams'
import { api } from '@/lib/api-client'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { TeamEditData, teamsQueries, usersQueries } from '@/services/queries'

export function useTeamForm(initialData?: TeamEditData, isEditMode = false) {
  const [isLinksSectionShown, setIsLinksSectionShown] = useState(true)
  const [isOverflowVisible, setIsOverflowVisible] = useState(true)
  const [hasAccordionAnimationFinished, setHasAccordionAnimationFinished] =
    useState(false)
  const [isUploading, startUploadingTransition] = useTransition()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      coverKey: initialData?.coverUrl ?? null,
      backgroundKey: initialData?.backgroundUrl ?? null,
      backgroundAccentColor: '',
      title: initialData?.name ?? '',
      description: initialData?.description ?? '',
      links: initialData?.links ?? ([] as ActiveLinkInput[]),
    },
    onSubmit: async ({ value: formValues }) => {
      const parsedResult = sendNewTeamDataSchema.safeParse(formValues)

      if (!parsedResult.success) {
        showTimedToast({
          type: 'warning',
          title: 'Попередження',
          description: parsedResult.error.issues[0].message,
        })
        return
      }

      const validData = parsedResult.data

      if (isEditMode && initialData) {
        startUploadingTransition(async () => {
          const { error, data } = await api()
            .teams({ id: initialData.id })
            .edit.patch(validData)
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
            } else if (error.status === 403) {
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
            return
          }

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: teamsQueries.all,
            }),
            queryClient.invalidateQueries({
              queryKey: usersQueries.getUserTeams(data.userId).queryKey,
            }),
          ])
          navigate({ to: '/user/$id/teams', params: { id: data.userId } })
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
        const { error, data } = await api().teams['create-team'].post(validData)
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
          } else if (
            error.status === 500 ||
            error.status === 404 ||
            error.status === 409
          ) {
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
          queryClient.invalidateQueries({
            queryKey: teamsQueries.all,
          }),
          queryClient.invalidateQueries({
            queryKey: usersQueries.getUserTeams(data.userId).queryKey,
          }),
        ])
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
    width: 260,
    height: 260,
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
    onAccentColorChange: (color) => {
      form.setFieldValue('backgroundAccentColor', color ?? '')
      form.validateField('backgroundAccentColor', 'change')
    },
  })

  function handleClearForm() {
    if (cover.fileState !== null) cover.removeFile({ quietCompletion: true })
    if (background.fileState !== null)
      background.removeFile({ quietCompletion: true })

    form.reset()

    setIsLinksSectionShown(true)
    setIsOverflowVisible(true)
    setHasAccordionAnimationFinished(false)
  }

  function handleLinksPresence() {
    if (!isLinksSectionShown) {
      setIsLinksSectionShown(true)
      setTimeout(() => setIsOverflowVisible(true), 250)
    } else {
      setHasAccordionAnimationFinished(false)
      setIsOverflowVisible(false)
      setIsLinksSectionShown(false)
    }
  }
  return {
    form,
    cover,
    background,
    handleClearForm,
    handleLinksPresence,
    isLinksSectionShown,
    setIsLinksSectionShown,
    isOverflowVisible,
    hasAccordionAnimationFinished,
    setHasAccordionAnimationFinished,
    isUploading,
  }
}
