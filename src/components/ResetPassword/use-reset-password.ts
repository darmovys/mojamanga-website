import { authClient } from '@/lib/auth-client'
import { showTimedToast } from '@/lib/toast'
import { ALLOWED_SYMBOLS, resetPasswordSchema } from '@/schemas/auth'
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form-start'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useTransition } from 'react'
type StrengthScore = 1 | 2 | 3 | 4 | 5

const routeApi = getRouteApi('/reset-password')

export function useResetPassword() {
  const { token } = routeApi.useSearch()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isPasswordPopoverOpen, setIsPasswordPopoverOpen] = useState(false)
  const passwordWrapperRef = useRef<HTMLDivElement | null>(null)
  const [isSending, startTransition] = useTransition()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      newPassword: '',
    },
    validators: {
      onDynamic: resetPasswordSchema,
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    onSubmit: ({ value: formValues }) => {
      startTransition(async () => {
        const { error } = await authClient.resetPassword({
          newPassword: formValues.newPassword,
          token,
        })
        if (error) {
          showTimedToast(
            {
              type: 'error',
              title: 'Помилка',
              description: error.message ?? 'Невідома помилка',
            },
            4000,
          )
          return
        }

        showTimedToast(
          {
            type: 'success',
            title: 'Пароль скинуто',
            description: 'Ви можете увійти в свій акаунт з новим паролем.',
          },
          4000,
        )
        setTimeout(() => {
          navigate({ to: '/' })
        }, 4000)
        form.reset()
      })
    },
  })

  const newPasswordValue = useStore(
    form.store,
    (state) => state.values.newPassword ?? '',
  )

  const passwordConditions = {
    minLength: newPasswordValue.length >= 12 && newPasswordValue.length <= 50,
    onlyLatin:
      newPasswordValue.length > 0 &&
      !/\p{L}/u.test(newPasswordValue.replace(/[A-Za-z]/g, '')),
    hasCase: /[A-Z]/.test(newPasswordValue) && /[a-z]/.test(newPasswordValue),
    hasNumber: /[0-9]/.test(newPasswordValue),
    hasSymbol: ALLOWED_SYMBOLS.test(newPasswordValue),
  }

  const strengthScore = Object.values(passwordConditions).filter(Boolean)
    .length as StrengthScore

  return {
    form,
    isPasswordShown,
    setIsPasswordShown,
    isPasswordPopoverOpen,
    setIsPasswordPopoverOpen,
    passwordWrapperRef,
    passwordConditions,
    strengthScore,
    isSending,
  }
}
