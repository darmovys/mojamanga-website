import { authClient } from '@/lib/auth-client'
import { showTimedToast } from '@/lib/toast'
import { createForgotPasswordSchema } from '@/schemas/auth'
import { TurnstileInstance } from '@marsidev/react-turnstile'
import { revalidateLogic, useForm } from '@tanstack/react-form-start'
import { useRef, useState, useTransition } from 'react'

export function useForgotPassword() {
  const [isSending, startTransition] = useTransition()
  const [turnstileError, setTurnstileError] = useState<undefined | string>(
    undefined,
  )
  const [isTurnstileLoaded, setIsTurnstileLoaded] = useState(false)

  const turnstileRef = useRef<TurnstileInstance | null>(null)

  const clientForgotPasswordSchema = createForgotPasswordSchema()

  const form = useForm({
    defaultValues: {
      email: '',
      cfToken: '',
    },
    validators: { onDynamic: clientForgotPasswordSchema },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    onSubmit: ({ value: formValues }) => {
      startTransition(async () => {
        const { error } = await authClient.requestPasswordReset({
          email: formValues.email,
          redirectTo: '/reset-password',
          fetchOptions: {
            headers: { 'x-captcha-response': formValues.cfToken },
          },
        })
        if (error) {
          showTimedToast(
            { type: 'error', title: 'Помилка', description: error.message },
            4000,
          )
          return
        }
        showTimedToast(
          {
            type: 'success',
            title: 'Успіх',
            description:
              'Якщо така пошта зареєстрована, ми надіслали на неї лист',
          },
          4000,
        )
        form.reset()
        turnstileRef.current?.reset()
      })
    },
  })

  return {
    isSending,
    turnstileError,
    setTurnstileError,
    isTurnstileLoaded,
    setIsTurnstileLoaded,
    turnstileRef,
    form,
  }
}
