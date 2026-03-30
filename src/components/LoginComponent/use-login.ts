import { authClient } from '@/lib/auth-client'
import { showTimedToast } from '@/lib/toast'
import { loginSchema } from '@/schemas/auth'
import { authQueries } from '@/services/queries'
import { revalidateLogic, useForm } from '@tanstack/react-form-start'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, useTransition } from 'react'

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isPending, startIsPendingTransition] = useTransition()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [turnstileError, setTurnstileError] = useState<undefined | string>(
    undefined,
  )
  const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false)

  const form = useForm({
    defaultValues: {
      usernameOrEmail: '',
      password: '',
      cfToken: '',
      rememberMe: false,
    },
    validators: { onDynamic: loginSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    onSubmit: ({ value }) => {
      startIsPendingTransition(async () => {
        if (value.usernameOrEmail.includes('@')) {
          const email = value.usernameOrEmail
          await authClient.signIn.email({
            email: email,
            password: value.password,
            rememberMe: value.rememberMe,
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
                    title: 'Ви успішно увійшли',
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
        } else {
          const username = value.usernameOrEmail
          await authClient.signIn.username({
            username: username,
            password: value.password,
            rememberMe: value.rememberMe,
            fetchOptions: {
              headers: { 'x-captcha-response': value.cfToken },
              onSuccess: () => {
                navigate({ to: '/' })
                showTimedToast(
                  {
                    type: 'success',
                    title: 'Ви успішно увійшли',
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
        }
      })
    },
  })

  return {
    form,
    isPending,
    isPasswordShown,
    setIsPasswordShown,
    turnstileError,
    setTurnstileError,
    isTurnstileLoaded,
    setIsTurnstileLoaded,
  }
}
