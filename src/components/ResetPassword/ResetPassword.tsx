import { getRouteApi, Link } from '@tanstack/react-router'
import { useResetPassword } from './use-reset-password'
import { Button, Field } from '@base-ui/react'
import ShiftBy from '../ShiftBy'
import PasswordConditionsPopover from '../PasswordConditionsPopover'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import {
  Eye,
  EyeClosed,
  HouseIcon,
  LoaderCircleIcon,
  TriangleAlert,
} from 'lucide-react'
import { PasswordConditionsContent } from '../PasswordConditionsPopover/PasswordConditions'
import { motion } from 'motion/react'
import MotionButton from '../MotionButton'
import MobileNavigation from '../MobileNavigation'
import clsx from 'clsx'
import styles from './ResetPassword.module.scss'

const routeApi = getRouteApi('/reset-password')

function ResetPassword() {
  const { token, error } = routeApi.useSearch()
  const {
    form,
    isPasswordShown,
    setIsPasswordShown,
    isPasswordPopoverOpen,
    setIsPasswordPopoverOpen,
    passwordWrapperRef,
    passwordConditions,
    strengthScore,
    isSending,
  } = useResetPassword()

  if (error === 'INVALID_TOKEN') {
    return (
      <>
        <div className={styles.Wrapper}>
          <h1 className={styles.ErrorHeading}>
            Це посилання більше не дійсне.
          </h1>
          <Link to="/" replace={true} className={clsx(styles.Link, 'Gradient')}>
            <ShiftBy y={-0.3}>
              <HouseIcon size={14} />
            </ShiftBy>
            На головну
            <ClickTargetHelper />
          </Link>
        </div>
        <MobileNavigation />
      </>
    )
  }

  if (!token)
    return (
      <>
        <div className={styles.Wrapper}>
          <h1 className={styles.ErrorHeading}>Відсутній токен.</h1>
          <Link to="/" replace={true} className={clsx(styles.Link, 'Gradient')}>
            <ShiftBy y={-0.3}>
              <HouseIcon size={14} />
            </ShiftBy>
            На головну
            <ClickTargetHelper />
          </Link>
        </div>
        <MobileNavigation />
      </>
    )

  return (
    <>
      <div className={styles.Wrapper}>
        <h1 className={styles.Heading}>Придумайте пароль</h1>
        <p className={styles.Paragraph}>Введіть новий пароль у формі нижче.</p>
        <form
          className={styles.Card}
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="newPassword"
            children={(field) => {
              const isInvalid = !field.state.meta.isValid
              return (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                  className={styles.PasswordFieldWrapper}
                >
                  <Field.Label htmlFor={field.name} className={styles.Label}>
                    Новий пароль
                  </Field.Label>

                  <PasswordConditionsPopover
                    open={isPasswordPopoverOpen}
                    anchorRef={passwordWrapperRef}
                    conditions={passwordConditions}
                    strengthScore={strengthScore}
                    placement="right"
                    className={styles.PasswordPopover}
                  />

                  <div
                    className={styles.ShowPasswordWrapper}
                    onFocus={() => setIsPasswordPopoverOpen(true)}
                    onBlur={(e) => {
                      if (e.currentTarget.contains(e.relatedTarget)) return
                      setIsPasswordPopoverOpen(false)
                    }}
                  >
                    <Field.Control
                      id={field.name}
                      name={field.name}
                      type={isPasswordShown ? 'text' : 'password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      autoComplete="off"
                      className={styles.FieldInput}
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

          <MotionButton
            className={clsx(styles.Button, 'Gradient')}
            disabled={isSending}
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
                'Встановити новий пароль'
              )}
            </motion.span>
          </MotionButton>
        </form>
      </div>
      <MobileNavigation />
    </>
  )
}

export default ResetPassword
