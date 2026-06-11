import { useForm } from '@tanstack/react-form-start'
import { useState, useTransition } from 'react'
import { useImageUpload } from '../../hooks/use-image-upload'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { ActiveLink, activeLinkSchema } from '@/schemas/teams'
import { api } from '@/lib/api-client'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { teamsQueries } from '@/services/queries'

export function useTeamForm() {
  const avatar = useImageUpload({ width: 375, height: 525 })
  const background = useImageUpload({ width: 1450, height: 540 })
  const [isLinksSectionShown, setIsLinksSectionShown] = useState(true)
  const [isOverflowVisible, setIsOverflowVisible] = useState(true)
  const [hasAccordionAnimationFinished, setHasAccordionAnimationFinished] =
    useState(false)
  const [isUploading, startUploadingTransition] = useTransition()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      links: [] as ActiveLink[],
    },
    onSubmit: async ({ value }) => {
      if (avatar.fileState === null || avatar.fileState.key === undefined) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Прикріпіть обкладинку своєї команди',
          },
          4000,
        )
        return
      }
      if (value.title.trim() === '') {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Надайте назву своїй команді',
          },
          4000,
        )
        return
      }
      if (value.links.some((el) => el.url === '' || el.type === null)) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Заповніть усі відкриті поля посилань',
          },
          4000,
        )
        return
      }
      const hasInvalidUrl = value.links.some((el) => {
        const result = activeLinkSchema.shape.url.safeParse(el.url)
        return !result.success
      })
      if (hasInvalidUrl) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Некоректний формат посилання',
          },
          4000,
        )
        return
      }

      const safeAvatarKey = avatar.fileState.key
      console.log('Значення: ', value)

      startUploadingTransition(async () => {
        const { error, data } = await api().teams['create-team'].post({
          title: value.title,
          description: value.description,
          avatarKey: safeAvatarKey,
          backgroundKey: background.fileState?.key,
          links: value.links,
        })
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
        await queryClient.invalidateQueries({ queryKey: teamsQueries.all })
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

  function handleClearForm() {
    if (avatar.fileState !== null) avatar.removeFile({ quietCompletion: true })
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
    avatar,
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
