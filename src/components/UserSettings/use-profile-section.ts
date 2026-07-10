import { useForm } from '@tanstack/react-form-start'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { authQueries, usersQueries } from '@/services/queries'
import { getRouteApi } from '@tanstack/react-router'
import { useImageUpload } from '@/hooks/use-image-upload'
import { useTransition } from 'react'
import { changeUserProfileSchema } from '@/schemas/users'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { api } from '@/lib/api-client'

const routeApi = getRouteApi('/user/$id_/settings/profile')

export const MAX_DESCRIPTION_LENGTH = 1000

export function useProfileSection() {
  const { id } = routeApi.useParams()
  const { data } = useSuspenseQuery(usersQueries.getUserProfileSettingsInfo(id))
  const [isUploading, startUploadingTransition] = useTransition()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      avatarKey: data.image ?? '',
      backgroundKey: data.backgroundUrl ?? '',
      username: data.displayUsername,
      description: data.description ?? '',
    },
    onSubmit: async ({ value: formValues }) => {
      startUploadingTransition(async () => {
        const parsedResult = changeUserProfileSchema.safeParse(formValues)

        if (!parsedResult.success) {
          showTimedToast({
            type: 'warning',
            title: 'Попередження',
            description: parsedResult.error.issues[0].message,
          })
          return
        }

        const { error, data: responseData } = await api()
          .users.user({ id })
          .settings.profile.patch(parsedResult.data)

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

        queryClient.removeQueries({
          queryKey: usersQueries.all,
        })
        await queryClient.invalidateQueries({
          queryKey: authQueries.all,
        })

        showTimedToast(
          {
            type: 'success',
            title: 'Успіх',
            description: responseData.message,
          },
          4000,
        )
      })
    },
  })

  const avatar = useImageUpload({
    width: 240,
    height: 240,
    onKeyChange: (key) => {
      form.setFieldValue('avatarKey', key ?? '')
      form.validateField('avatarKey', 'change')
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

  return {
    form,
    data,
    avatar,
    background,
    isUploading,
  }
}
