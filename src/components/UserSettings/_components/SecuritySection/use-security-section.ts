import { useForm, useStore } from '@tanstack/react-form-start'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { authQueries, usersQueries } from '@/services/queries'
import { getRouteApi } from '@tanstack/react-router'
import { useTransition, useState, useRef } from 'react'
import { showAuthToast, showTimedToast } from '@/lib/toast'
import { ALLOWED_SYMBOLS } from '@/schemas/auth'
import { changeUserSecuritySchema } from '@/schemas/users'
import { api } from '@/lib/api-client'

const routeApi = getRouteApi('/user/$id_/settings/security')
type StrengthScore = 1 | 2 | 3 | 4 | 5

export function useSecuritySection() {
  const { id } = routeApi.useParams()
  const { data } = useSuspenseQuery(
    usersQueries.getUserSecuritySettingsInfo(id),
  )
  const [isUploading, startUploadingTransition] = useTransition()
  const [isPasswordPopoverOpen, setIsPasswordPopoverOpen] = useState(false)
  const passwordWrapperRef = useRef<HTMLDivElement | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      email: data.email,
      currentPassword: '',
      newPassword: '',
    },
    onSubmit: async ({ value: formValues }) => {
      const parsedResult = changeUserSecuritySchema.safeParse(formValues)

      if (!parsedResult.success) {
        showTimedToast({
          type: 'warning',
          title: 'Попередження',
          description: parsedResult.error.issues[0].message,
        })
        return
      }

      startUploadingTransition(async () => {
        const { error, data: responseData } = await api()
          .users.user({ id })
          .settings.security.patch(parsedResult.data)

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
          } else if (error.status === 403 || error.status === 404) {
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
            description: responseData,
          },
          4000,
        )
        setIsEditMode(false)
        form.reset()
      })
    },
  })

  const passwordValue = useStore(
    form.store,
    (state) => state.values.newPassword ?? '',
  )

  const passwordConditions = {
    minLength: passwordValue.length >= 12 && passwordValue.length <= 50,
    onlyLatin:
      passwordValue.length > 0 &&
      !/\p{L}/u.test(passwordValue.replace(/[A-Za-z]/g, '')),
    hasCase: /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue),
    hasNumber: /[0-9]/.test(passwordValue),
    hasSymbol: ALLOWED_SYMBOLS.test(passwordValue),
  }

  const strengthScore = Object.values(passwordConditions).filter(Boolean)
    .length as StrengthScore

  return {
    form,
    data,
    isUploading,
    passwordConditions,
    strengthScore,
    isPasswordPopoverOpen,
    setIsPasswordPopoverOpen,
    passwordWrapperRef,
    isEditMode,
    setIsEditMode,
  }
}
