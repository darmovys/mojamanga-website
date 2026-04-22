import { Link } from '@tanstack/react-router'
import { signupSchema } from '@/schemas/auth'
import { Button, Field } from '@base-ui/react'
import {
  CircleDashed,
  Eye,
  EyeClosed,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react'
import VisuallyHidden from '@/components/VisuallyHidden'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import { Turnstile } from '@marsidev/react-turnstile'
import clsx from 'clsx'
import { PasswordConditionsPopover } from './PasswordConditionsPopover'
import { PasswordConditionsContent } from './PasswordConditions'
import { authClient } from '@/lib/auth-client'
import { useTheme } from '@/lib/theme-provider'
import { useSignup } from './use-signup'
import styles from './SignupComponent.module.scss'

function SignupComponent() {
  const { theme } = useTheme()
  const {
    form,
    isPending,
    isTurnstileLoaded,
    setIsTurnstileLoaded,
    turnstileError,
    setTurnstileError,
    isPasswordShown,
    setIsPasswordShown,
    isPasswordPopoverOpen,
    setIsPasswordPopoverOpen,
    passwordWrapperRef,
    passwordConditions,
    strengthScore,
  } = useSignup()

  return (
    <>
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
            onChangeAsyncDebounceMs: 500,
            onChange: ({ value }) => {
              const result = signupSchema.shape.username.safeParse(value)
              if (!result.success) return result.error.issues[0]

              return undefined
            },
            onChangeAsync: async ({ value }) => {
              const { data: response } = await authClient.isUsernameAvailable({
                username: value,
              })
              if (!response?.available) {
                return 'Псевдонім вже використовується'
              }

              return undefined
            },
          }}
          children={(field) => {
            const isInvalid = !field.state.meta.isValid
            const isValidating = field.state.meta.isValidating
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
                    className={styles.UsernameFieldInput}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    onBlur={field.handleBlur}
                    autoComplete="off"
                    type="text"
                  />
                  {isValidating && (
                    <div className={styles.UsernameFieldCircleWrapper}>
                      <CircleDashed
                        size={16}
                        className={styles.LoadingAnimation}
                      />
                    </div>
                  )}
                </div>
                <Field.Error className={styles.Error} match={isInvalid}>
                  <TriangleAlert size={14} />
                  {typeof field.state.meta.errors[0] === 'string'
                    ? field.state.meta.errors[0]
                    : field.state.meta.errors[0]?.message}
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
                    onBlur={field.handleBlur}
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
                <Field.Label className={styles.FieldLabel}>Пароль</Field.Label>

                <PasswordConditionsPopover
                  open={isPasswordPopoverOpen}
                  anchorRef={passwordWrapperRef}
                  conditions={passwordConditions}
                  strengthScore={strengthScore}
                />

                <div
                  className={styles.FieldInputWrapper}
                  onFocus={() => setIsPasswordPopoverOpen(true)}
                  onBlur={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget)) return
                    setIsPasswordPopoverOpen(false)
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
                    ref={passwordWrapperRef}
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

                <div className={styles.ConditionsMobile}>
                  <PasswordConditionsContent
                    conditions={passwordConditions}
                    strengthScore={strengthScore}
                  />
                </div>

                <Field.Error className={styles.Error} match={isInvalid}>
                  <TriangleAlert size={14} />
                  Не всі умови виконані
                </Field.Error>
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
                  turnstileError || 'Будь ласка, пройдіть перевірку безпеки'
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
                  options={{
                    theme: theme,
                  }}
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
                    setIsTurnstileLoaded(true)
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
            [styles.Disabled]: isPending || !isTurnstileLoaded,
          })}
          disabled={isPending || !isTurnstileLoaded}
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
    </>
  )
}

export default SignupComponent
