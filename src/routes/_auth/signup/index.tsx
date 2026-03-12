import { createFileRoute, Link } from '@tanstack/react-router'
import {
  revalidateLogic,
  useForm,
  useStore,
  type DeepKeys,
  type ValidationError,
} from '@tanstack/react-form-start'
import {
  ALLOWED_SYMBOLS,
  signupSchema,
  type SignupValues,
} from '@/schemas/signup'
import { useState, useTransition } from 'react'
import { Button, Field, Separator } from '@base-ui/react'
import {
  Circle,
  CircleCheckBig,
  Eye,
  EyeClosed,
  LoaderCircle,
  Moon,
  Sun,
  SunMoon,
  TriangleAlert,
} from 'lucide-react'
import VisuallyHidden from '@/components/VisuallyHidden'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import styles from './signup.module.scss'
import { authClient } from '@/lib/auth-client'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTheme } from '@/lib/theme-provider'
import clsx from 'clsx'
import z from 'zod'
import Logo from '@/components/Logo'

export const Route = createFileRoute('/_auth/signup/')({
  component: RouteComponent,
})

const PASSWORD_CONDITIONS = [
  { key: 'onlyLatin', label: 'Лише англійські літери' },
  { key: 'minLength', label: 'Принаймні 12 символів' },
  { key: 'hasCase', label: 'Великі та малі літери' },
  { key: 'hasNumber', label: 'Числа' },
  { key: 'hasSymbol', label: "Символи (-_&/,^@.#:%\\\=\'$!?*`;+”|~[](){}<>)" },
] as const

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState<undefined | string>(
    undefined,
  )
  const { theme, toggleTheme } = useTheme()

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      cfToken: '',
    },
    validators: {
      onDynamic: signupSchema,
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await new Promise((r) => setTimeout(r, 4000))
        console.log({ value })
      })
    },
  })

  const passwordValue = useStore(
    form.store,
    (state) => state.values.password ?? '',
  )
  const isSubmitted = useStore(form.store, (state) => state.isSubmitted)

  const passwordConditions = {
    minLength: passwordValue.length >= 12 && passwordValue.length <= 50,
    onlyLatin:
      passwordValue.length > 0 &&
      !/\p{L}/u.test(passwordValue.replace(/[A-Za-z]/g, '')),
    hasCase: /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue),
    hasNumber: /[0-9]/.test(passwordValue),
    hasSymbol: ALLOWED_SYMBOLS.test(passwordValue),
  }

  // async function sendData() {
  //   await authClient.signIn.email({
  //     email: 'user@example.com',
  //     password: 'secure-password',
  //     fetchOptions: {
  //       headers: {
  //         'x-captcha-response': turnstileToken,
  //       },
  //     },
  //   })
  // }

  return (
    <div className={styles.Wrapper}>
      <header className={styles.MainHeader}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo className={styles.Logo} />
        </Link>
        <Button onClick={toggleTheme} className={styles.ThemeButton}>
          {theme === 'system' && (
            <>
              <SunMoon />
              <VisuallyHidden>Системна тема</VisuallyHidden>
            </>
          )}
          {theme === 'light' && (
            <>
              <Sun />
              <VisuallyHidden>Світла тема</VisuallyHidden>
            </>
          )}
          {theme === 'dark' && (
            <>
              <Moon />
              <VisuallyHidden>Темна тема</VisuallyHidden>
            </>
          )}
        </Button>
      </header>
      <div className={styles.MainSectionWrapper}>
        <main className={styles.MainSection}>
          <div className={styles.Content}>
            <div className={styles.RegistrationHeader}>
              <h1 className={styles.RegistrationTitle}>Реєстрація</h1>
            </div>
            <form
              className={styles.FormContent}
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                form.handleSubmit()
              }}
            >
              <form.Field
                name="username"
                validators={{
                  onDynamic: signupSchema.shape.username,
                }}
                children={(field) => {
                  const isInvalid = !field.state.meta.isValid
                  return (
                    <Field.Root
                      name={field.name}
                      invalid={!field.state.meta.isValid}
                      dirty={field.state.meta.isDirty}
                      touched={field.state.meta.isTouched}
                    >
                      <Field.Label className={styles.FieldLabel}>
                        Псевдонім
                      </Field.Label>
                      <div className={styles.FieldInputWrapper}>
                        <Field.Control
                          id={field.name}
                          name={field.name}
                          className={styles.FieldInput}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => {
                            field.handleBlur()
                            setFocusedField(null)
                          }}
                          data-submitted={isSubmitted}
                          autoComplete="off"
                          type="text"
                        />
                      </div>
                      <Field.Error className={styles.Error} match={isInvalid}>
                        <TriangleAlert size={14} />
                        {/* {field.state.meta.errors.map((e) => e?.message).join(', ')} */}
                        {field.state.meta.errors[0]?.message}
                      </Field.Error>
                    </Field.Root>
                  )
                }}
              />

              <form.Field
                name="email"
                validators={{
                  onDynamic: signupSchema.shape.email,
                }}
                children={(field) => {
                  const isInvalid = !field.state.meta.isValid
                  return (
                    <Field.Root
                      name={field.name}
                      invalid={!field.state.meta.isValid}
                      dirty={field.state.meta.isDirty}
                      touched={field.state.meta.isTouched}
                    >
                      <Field.Label className={styles.FieldLabel}>
                        Електронна пошта
                      </Field.Label>
                      <div className={styles.FieldInputWrapper}>
                        <Field.Control
                          id={field.name}
                          name={field.name}
                          className={styles.FieldInput}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => {
                            field.handleBlur()
                            setFocusedField(null)
                          }}
                          autoComplete="off"
                          type="email"
                        />
                      </div>
                      <Field.Error className={styles.Error} match={isInvalid}>
                        <TriangleAlert size={14} />
                        {field.state.meta.errors[0]?.message}
                      </Field.Error>
                    </Field.Root>
                  )
                }}
              />

              <form.Field
                name="password"
                validators={{
                  onDynamic: signupSchema.shape.password,
                }}
                children={(field) => {
                  const isInvalid = !field.state.meta.isValid
                  return (
                    <Field.Root
                      name={field.name}
                      invalid={!field.state.meta.isValid}
                      dirty={field.state.meta.isDirty}
                      touched={field.state.meta.isTouched}
                    >
                      <Field.Label className={styles.FieldLabel}>
                        Пароль
                      </Field.Label>
                      <div
                        className={styles.FieldInputWrapper}
                        onFocus={() => setFocusedField('password')}
                        onBlur={(e) => {
                          if (e.currentTarget.contains(e.relatedTarget)) return
                          setFocusedField(null)
                        }}
                      >
                        <Field.Control
                          id={field.name}
                          name={field.name}
                          className={styles.PasswordFieldInput}
                          value={field.state.value}
                          onValueChange={field.handleChange}
                          onBlur={field.handleBlur}
                          autoComplete="off"
                          type={isPasswordShown ? 'text' : 'password'}
                        />
                        <Button
                          className={styles.ShowPassword}
                          onClick={() => setIsPasswordShown(!isPasswordShown)}
                        >
                          <ClickTargetHelper />
                          <VisuallyHidden>Показати пароль</VisuallyHidden>
                          {isPasswordShown ? (
                            <Eye size={16} />
                          ) : (
                            <EyeClosed size={16} />
                          )}
                        </Button>
                      </div>

                      {focusedField === 'password' ? (
                        <div className={styles.ConditionsWrapper}>
                          <h4 className={styles.ConditionsHeader}>
                            Пароль повинен містити:
                          </h4>
                          <ul className={styles.ConditionList}>
                            {PASSWORD_CONDITIONS.map(({ key, label }) => {
                              const isDone = passwordConditions[key]
                              return (
                                <li
                                  key={key}
                                  className={clsx(styles.Condition, {
                                    [styles.Done]: isDone,
                                  })}
                                >
                                  {isDone ? (
                                    <CircleCheckBig size={14} />
                                  ) : (
                                    <Circle size={14} />
                                  )}
                                  <span>{label}</span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ) : (
                        <Field.Error className={styles.Error} match={isInvalid}>
                          <TriangleAlert size={14} />
                          Не всі умови виконані
                        </Field.Error>
                      )}
                    </Field.Root>
                  )
                }}
              />

              <form.Field
                name="cfToken"
                validators={{
                  onDynamic: ({ value }) => {
                    if (!value) {
                      return (
                        turnstileError ||
                        'Будь ласка, пройдіть перевірку безпеки'
                      )
                    }
                    return undefined
                  },
                }}
                children={(field) => {
                  const isInvalid = !field.state.meta.isValid
                  return (
                    <Field.Root
                      name={field.name}
                      invalid={!field.state.meta.isValid}
                      dirty={field.state.meta.isDirty}
                      touched={field.state.meta.isTouched}
                      className={styles.TurnstileWrapper}
                    >
                      <Turnstile
                        siteKey={import.meta.env.VITE_FAKE_TURNSTILE_SITEKEY}
                        options={{ theme: theme === 'system' ? 'auto' : theme }}
                        onError={() => {
                          setTurnstileError(
                            'Перевірка безпеки провалилася. Будь-ласка, повторіть спробу.',
                          )

                          field.handleChange('')
                        }}
                        onExpire={() => {
                          setTurnstileError(
                            'Термін дії перевірки безпеки закінчився. Будь ласка, підтвердьте знову.',
                          )

                          field.handleChange('')
                        }}
                        onWidgetLoad={() => {
                          setTurnstileError(undefined)
                        }}
                        onSuccess={(token) => {
                          setTurnstileError(undefined)

                          field.handleChange(token)
                        }}
                      />
                      <Field.Error className={styles.Error} match={isInvalid}>
                        <TriangleAlert size={14} />
                        {field.state.meta.errors[0] as string}
                      </Field.Error>
                    </Field.Root>
                  )
                }}
              />

              <Button
                className={clsx('Gradient', styles.SubmitButton, {
                  [styles.Disabled]: isPending,
                })}
                disabled={isPending}
                focusableWhenDisabled={true}
                type="submit"
              >
                <span className={styles.Side}></span>
                {isPending ? 'Виконується реєстрація' : 'Зареєструватися'}
                <span className={styles.Side}>
                  {isPending && (
                    <>
                      <LoaderCircle className={styles.Loader} size={16} />
                      <VisuallyHidden>Завантаження</VisuallyHidden>
                    </>
                  )}
                </span>
              </Button>
            </form>
            <div className={styles.LoginText}>
              <span>Вже маєте обліковий запис?</span>
              <Link to="/login" className={styles.LoginLink}>
                Увійти
                <ClickTargetHelper />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
