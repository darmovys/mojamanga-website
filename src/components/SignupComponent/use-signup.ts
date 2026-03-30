import { authClient } from '@/lib/auth-client'
import { showTimedToast } from '@/lib/toast'
import { ALLOWED_SYMBOLS, signupSchema } from '@/schemas/auth'
import { authQueries } from '@/services/queries'
import { revalidateLogic, useForm, useStore } from '@tanstack/react-form-start'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useRef, useState, useTransition } from 'react'

type StrengthScore = 1 | 2 | 3 | 4 | 5

export function useSignup() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isPasswordPopoverOpen, setIsPasswordPopoverOpen] = useState(false)
  const [turnstileError, setTurnstileError] = useState<undefined | string>(
    undefined,
  )
  const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false)
  const passwordWrapperRef = useRef<HTMLDivElement | null>(null)

  const form = useForm({
    defaultValues: { username: '', email: '', password: '', cfToken: '' },
    validators: { onDynamic: signupSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    onSubmit: ({ value }) => {
      startTransition(async () => {
        const { data: response } = await authClient.isUsernameAvailable({
          username: value.username,
        })

        if (!response?.available) {
          showTimedToast(
            {
              type: 'error',
              title: 'Сталася помилка',
              description: 'Псевдонім вже використовується',
            },
            4000,
          )
          return
        }

        await authClient.signUp.email({
          email: value.email,
          password: value.password,
          username: value.username,
          displayUsername: value.username,
          name: value.username,
          fetchOptions: {
            headers: { 'x-captcha-response': value.cfToken },
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                queryKey: authQueries.all,
              })
              navigate({ to: '/' })
              showTimedToast(
                {
                  type: 'success',
                  title: 'Ви успішно зареєструвалися',
                  description: 'Тепер ви можете увійти в свій акаунт',
                },
                4000,
              )
            },
            onError: ({ error }) => {
              showTimedToast(
                {
                  type: 'error',
                  title: 'Сталася помилка',
                  description: error.message,
                },
                4000,
              )
            },
          },
        })
      })
    },
  })

  const passwordValue = useStore(
    form.store,
    (state) => state.values.password ?? '',
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
    isPending,
    isTurnstileLoaded,
    isPasswordShown,
    setIsPasswordShown,
    isPasswordPopoverOpen,
    setIsPasswordPopoverOpen,
    turnstileError,
    setTurnstileError,
    setIsTurnstileLoaded,
    passwordWrapperRef,
    passwordConditions,
    strengthScore,
  }
}
