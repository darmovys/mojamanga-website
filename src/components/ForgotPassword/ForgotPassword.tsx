import MotionButton from '../MotionButton'
import { motion } from 'motion/react'
import { LoaderCircleIcon, TriangleAlert } from 'lucide-react'
import { Field } from '@base-ui/react'
import ShiftBy from '../ShiftBy/ShiftBy'
import { Turnstile } from '@marsidev/react-turnstile'
import { useTheme } from '@/lib/theme-provider'
import { useMediaQuery } from '@/hooks/use-media-query'
import MobileNavigation from '../MobileNavigation'
import { useForgotPassword } from './use-forgot-password'
import clsx from 'clsx'
import styles from './ForgotPassword.module.scss'

function ForgotPassword() {
  const { theme } = useTheme()
  const matches = useMediaQuery('(min-width: 24.125rem)')
  const {
    form,
    turnstileError,
    isTurnstileLoaded,
    turnstileRef,
    setTurnstileError,
    setIsTurnstileLoaded,
    isSending,
  } = useForgotPassword()

  return (
    <>
      <div className={styles.Wrapper}>
        <h1 className={styles.Heading}>Забули пароль?</h1>
        <p className={styles.Paragraph}>
          Вкажіть електронну пошту, яку ви використовували для входу на сайт.
          <br />
          На неї надійде лист зі скиданням.
        </p>
        <form
          className={styles.Card}
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid = !field.state.meta.isValid
              return (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                  className={styles.EmailFieldWrapper}
                >
                  <Field.Label htmlFor={field.name} className={styles.Label}>
                    Електронна пошта
                  </Field.Label>
                  <Field.Control
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    autoComplete="off"
                    className={styles.FieldInput}
                  />
                  <Field.Error className={styles.Error} match={isInvalid}>
                    <ShiftBy y={1}>
                      <TriangleAlert size={14} />
                    </ShiftBy>
                    {field.state.meta.errors[0]?.message}
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
                    ref={turnstileRef}
                    siteKey={import.meta.env.VITE_FAKE_TURNSTILE_SITEKEY}
                    options={{
                      theme: theme,
                      size: matches ? 'normal' : 'compact',
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
          <MotionButton
            className={clsx(styles.Button, 'Gradient')}
            disabled={isSending || !isTurnstileLoaded}
            focusableWhenDisabled={true}
            type="submit"
            layout
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
            }}
          >
            <motion.span
              key={isSending ? 'sending' : 'idle'}
              initial={{
                opacity: 0,
                filter: 'blur(4px)',
              }}
              animate={{
                opacity: 1,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                filter: 'blur(4px)',
              }}
              transition={{
                type: 'spring',
                duration: 0.6,
                bounce: 0,
              }}
              // layout="position" запобігає деформації/розтягуванню тексту
              layout="position"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--4px)',
              }}
            >
              {isSending ? (
                <>
                  <LoaderCircleIcon className={styles.Loader} size={14} />
                  Відправляємо...
                </>
              ) : (
                'Відправити лист'
              )}
            </motion.span>
          </MotionButton>
        </form>
      </div>
      <MobileNavigation />
    </>
  )
}

export default ForgotPassword
