import { Link } from '@tanstack/react-router'
import Logo from '../Logo'
import { Button, Checkbox, Field } from '@base-ui/react'
import { useTheme } from '@/lib/theme-provider'
import {
  Check,
  Eye,
  EyeClosed,
  LoaderCircle,
  Moon,
  Sun,
  TriangleAlert,
} from 'lucide-react'
import VisuallyHidden from '../VisuallyHidden'
import { loginSchema } from '@/schemas/auth'
import ClickTargetHelper from '../ClickTargetHelper'
import { Turnstile } from '@marsidev/react-turnstile'
import clsx from 'clsx'
import { useLogin } from './use-login'
import styles from './LoginComponent.module.scss'

function LoginComponent() {
  const { theme, toggleTheme } = useTheme()
  const {
    form,
    isPending,
    turnstileError,
    setTurnstileError,
    isTurnstileLoaded,
    setIsTurnstileLoaded,
    isPasswordShown,
    setIsPasswordShown,
  } = useLogin()

  return (
    <div className={styles.Wrapper}>
      <div className={styles.Flex}>
        <header className={styles.MainHeader}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo className={styles.Logo} />
          </Link>
          <Button onClick={toggleTheme} className={styles.ThemeButton}>
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
      </div>
      <div className={styles.MainSectionWrapper}>
        <main className={styles.MainSection}>
          <div className={styles.Content}>
            <div className={styles.LoginHeader}>
              <h1 className={styles.LoginTitle}>Вхід</h1>
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
                name="usernameOrEmail"
                validators={{
                  onDynamic: loginSchema.shape.usernameOrEmail,
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
                        Е-пошта або псевдонім
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
                          type="text"
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
                  onDynamic: loginSchema.shape.password,
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

                      <div className={styles.FieldInputWrapper}>
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

                      <Field.Error className={styles.Error} match={isInvalid}>
                        <TriangleAlert size={14} />
                        {field.state.meta.errors[0]?.message}
                      </Field.Error>
                    </Field.Root>
                  )
                }}
              />

              <form.Field
                name="rememberMe"
                validators={{
                  onDynamic: loginSchema.shape.rememberMe,
                }}
                children={(field) => {
                  return (
                    <Field.Root
                      name={field.name}
                      invalid={!field.state.meta.isValid}
                      dirty={field.state.meta.isDirty}
                      touched={field.state.meta.isTouched}
                    >
                      <div className={styles.CheckboxWrapper}>
                        <Checkbox.Root
                          id="stayLoggedIn"
                          nativeButton
                          render={<Button />}
                          className={styles.Checkbox}
                          checked={field.state.value}
                          onCheckedChange={field.handleChange}
                        >
                          <Checkbox.Indicator
                            keepMounted
                            className={styles.Indicator}
                          >
                            <Check className={styles.CheckIcon} size={16} />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <div className={styles.CheckboxText}>
                          <label htmlFor="stayLoggedIn">Не виходити</label>
                          <span className={styles.NoteText}>
                            Рекомендовано на довірених пристроях
                          </span>
                        </div>
                      </div>
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
                {isPending ? 'Виконується вхід' : 'Увійти'}
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
            <div className={styles.SignupText}>
              <span>Вперше на Моя Манга?</span>
              <Link to="/signup" className={styles.SignupLink}>
                Зареєструватися
                <ClickTargetHelper />
              </Link>
            </div>
            {/* <div className={styles.OAuthSection}>
              <h4 className={styles.OAuthHeader}>Інші методи входу</h4>
              <div className={styles.OAuthProviders}>
                <Button
                  className={clsx(styles.ProviderButton, 'Gradient')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 19 18"
                  >
                    <path
                      fill="#FBBB00"
                      d="m5.324 10.565-.522 1.949-1.908.04A7.47 7.47 0 0 1 2 9c0-1.244.302-2.417.839-3.45l1.699.312.744 1.69a4.46 4.46 0 0 0 .042 3.013"
                    ></path>
                    <path
                      fill="#518EF8"
                      d="M16.87 7.6a7.5 7.5 0 0 1-.034 2.966 7.5 7.5 0 0 1-2.64 4.283l-2.14-.11-.304-1.89a4.47 4.47 0 0 0 1.923-2.283h-4.01V7.6h7.204"
                    ></path>
                    <path
                      fill="#28B446"
                      d="M14.195 14.848A7.47 7.47 0 0 1 9.5 16.5a7.5 7.5 0 0 1-6.606-3.946l2.43-1.99a4.46 4.46 0 0 0 6.428 2.284z"
                    ></path>
                    <path
                      fill="#F14336"
                      d="m14.287 3.227-2.43 1.989A4.46 4.46 0 0 0 5.283 7.55l-2.443-2A7.5 7.5 0 0 1 9.5 1.5c1.82 0 3.488.648 4.787 1.727"
                    ></path>
                  </svg>
                  Google
                </Button>
              </div>
            </div> */}
          </div>
        </main>
      </div>
      <div className={styles.Flex} />
    </div>
  )
}

export default LoginComponent
