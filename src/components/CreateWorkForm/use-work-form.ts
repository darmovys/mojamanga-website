import { useImageUpload } from '@/hooks/use-image-upload'
import { showTimedToast } from '@/lib/toast'
import { useForm } from '@tanstack/react-form-start'
import { useTransition } from 'react'

export function useWorkForm() {
  const cover = useImageUpload({ width: 375, height: 525 })
  const background = useImageUpload({ width: 1450, height: 540 })
  const [isUploading, startUploadingTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      ukrName: '',
      enName: '',
      alternativeNames: '',
      description: '',
      type: '',
      ageRestriction: '',
      releaseYear: '',
      workStatus: '',
      translationStatus: '',
      genres: [],
      tags: [],
    },
    onSubmit: async ({ value }) => {
      if (cover.fileState === null || cover.fileState.key === undefined) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Прикріпіть обкладинку твору',
          },
          4000,
        )
        return
      }
      if (value.ukrName.trim() === '' || value.enName.trim() === '') {
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

      // const safeCoverKey = cover.fileState.key
      console.log('Значення: ', value)

      // startUploadingTransition(async () => {
      //   const { error, data } = await api().teams['create-team'].post({
      //     title: value.title,
      //     description: value.description,
      //     avatarKey: safeAvatarKey,
      //     backgroundKey: background.fileState?.key,
      //     links: value.links,
      //   })
      //   if (error) {
      //     if (error.status === 401) {
      //       showAuthToast()
      //     } else if (error.status === 422) {
      //       showTimedToast(
      //         {
      //           type: 'warning',
      //           title: 'Попередження',
      //           description: error.value.message,
      //         },
      //         4000,
      //       )
      //     } else if (
      //       error.status === 500 ||
      //       error.status === 404 ||
      //       error.status === 409
      //     ) {
      //       showTimedToast(
      //         {
      //           type: 'error',
      //           title: 'Помилка',
      //           description: error.value,
      //         },
      //         4000,
      //       )
      //     } else {
      //       showTimedToast(
      //         {
      //           type: 'warning',
      //           title: 'Попередження',
      //           description: error.value,
      //         },
      //         4000,
      //       )
      //     }
      //     return
      //   }
      //   await queryClient.invalidateQueries({ queryKey: teamsQueries.all })
      //   navigate({ to: '/' })
      //   showTimedToast(
      //     {
      //       type: 'success',
      //       title: 'Успіх',
      //       description: data.message,
      //     },
      //     4000,
      //   )
      // })
    },
  })

  return {
    cover,
    background,
    form,
    isUploading,
  }
}
