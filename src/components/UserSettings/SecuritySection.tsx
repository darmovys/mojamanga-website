import { Button, Field } from '@base-ui/react'
import { useSecuritySection } from './use-security-section'
import MotionButton from '../MotionButton'
import { Eye, EyeClosed, LoaderCircle, MailIcon } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import ClickTargetHelper from '../ClickTargetHelper'
import VisuallyHidden from '../VisuallyHidden'
import ShiftBy from '../ShiftBy/ShiftBy'
import { Link } from '@tanstack/react-router'
import PasswordConditionsPopover from '../PasswordConditionsPopover'
import { PasswordConditionsContent } from '../PasswordConditionsPopover/PasswordConditions'
import Skeleton from '../Skeleton'
import styles from './Section.module.scss'

function SecuritySection() {
  const {
    form,
    data,
    isUploading,
    isPasswordPopoverOpen,
    setIsPasswordPopoverOpen,
    passwordWrapperRef,
    passwordConditions,
    strengthScore,
    isEditMode,
    setIsEditMode,
  } = useSecuritySection()

  return (
    <form
      className={styles.Form}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        children={(field) => (
          <Field.Root
            name={field.name}
            invalid={!field.state.meta.isValid}
            dirty={field.state.meta.isDirty}
            touched={field.state.meta.isTouched}
          >
            {!data.emailVerified && (
              <div className={styles.NotVerifiedAlert}>
                <MailIcon size={16} />
                Будь-ласка, підтвердьте свою електронну пошту.
                <Link to="/verify-email" className={styles.VerfiyLink}>
                  Підтвердити
                </Link>
              </div>
            )}
            <div className={styles.EmailLabelWrapper}>
              {isEditMode ? (
                <Field.Label htmlFor={field.name} className={styles.Label}>
                  Електронна пошта
                </Field.Label>
              ) : (
                <div className={styles.Label}>Електронна пошта</div>
              )}
              <div
                className={clsx(
                  styles.EmailBadge,
                  data.emailVerified ? styles.Verified : styles.NotVerified,
                )}
              >
                <ShiftBy y={1}>
                  {data.emailVerified ? 'Підтверджена' : 'Не підтверджена'}
                </ShiftBy>
              </div>
            </div>
            <EmailField
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(newValue) => field.handleChange(newValue)}
              isEditMode={isEditMode}
              onEditModeChange={setIsEditMode}
            />
          </Field.Root>
        )}
      />

      <div className={styles.PasswordGroupWrapper}>
        <span className={styles.Label}>Зміна паролю</span>
        <div className={styles.PasswordGroup}>
          <form.Field
            name="currentPassword"
            children={(field) => (
              <Field.Root
                name={field.name}
                invalid={!field.state.meta.isValid}
                dirty={field.state.meta.isDirty}
                touched={field.state.meta.isTouched}
                style={{ marginBlockEnd: 'var(--12px)' }}
              >
                <Field.Label
                  htmlFor={field.name}
                  className={styles.LabelSecondary}
                >
                  Поточний пароль
                </Field.Label>
                <PasswordField
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(newValue) => field.handleChange(newValue)}
                />
              </Field.Root>
            )}
          />

          <form.Field
            name="newPassword"
            children={(field) => (
              <Field.Root
                name={field.name}
                invalid={!field.state.meta.isValid}
                dirty={field.state.meta.isDirty}
                touched={field.state.meta.isTouched}
              >
                <Field.Label
                  htmlFor={field.name}
                  className={styles.LabelSecondary}
                >
                  Новий пароль
                </Field.Label>
                <div
                  onFocus={() => setIsPasswordPopoverOpen(true)}
                  onBlur={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget)) return
                    setIsPasswordPopoverOpen(false)
                  }}
                >
                  <PasswordField
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(newValue) => field.handleChange(newValue)}
                    wrapperRef={passwordWrapperRef}
                  />
                </div>
                <div className={styles.ForgotPasswordInfo}>
                  Якщо ви не пам'ятаєте свій поточний пароль, то можете його
                  скинути на{' '}
                  <Link
                    className={styles.ForgotPasswordLink}
                    to="/forgot-password"
                  >
                    цій сторінці
                  </Link>
                  .
                </div>

                <PasswordConditionsPopover
                  open={isPasswordPopoverOpen}
                  anchorRef={passwordWrapperRef}
                  conditions={passwordConditions}
                  strengthScore={strengthScore}
                  placement={'bottom-end'}
                  className={styles.PasswordPopover}
                />

                <div className={styles.MobileConditions}>
                  <PasswordConditionsContent
                    conditions={passwordConditions}
                    strengthScore={strengthScore}
                  />
                </div>
              </Field.Root>
            )}
          />
        </div>
      </div>

      <MotionButton
        type="submit"
        focusableWhenDisabled={true}
        disabled={isUploading}
        className={clsx(styles.SaveButton, 'Gradient', {
          [styles.Loading]: isUploading,
        })}
      >
        {isUploading ? (
          <>
            <span>Зберігаємо..</span>
            <LoaderCircle size={14} />
          </>
        ) : (
          'Зберегти зміни'
        )}
      </MotionButton>
    </form>
  )
}

interface FieldProps {
  name: string
  value: string
  onBlur: () => void
  onChange: (value: string) => void
}

interface EmailFieldProps extends FieldProps {
  isEditMode: boolean
  onEditModeChange: (mode: boolean) => void
}

interface PasswordFieldProps extends FieldProps {
  wrapperRef?: React.RefObject<HTMLDivElement | null>
}

function EmailField({
  name,
  value,
  onBlur,
  onChange,
  isEditMode,
  onEditModeChange,
}: EmailFieldProps) {
  const [isEmailShown, setIsEmailShown] = useState(false)

  if (!isEditMode) {
    return (
      <div className={styles.EmailWrapper}>
        <div
          className={styles.Email}
          aria-label={isEmailShown ? value : 'Прихована'}
        >
          {value}
          <Button
            onClick={() => setIsEmailShown(!isEmailShown)}
            className={styles.Filter}
            data-hidden={!isEmailShown}
          >
            <VisuallyHidden>Показати пошту</VisuallyHidden>
          </Button>
        </div>
        <Button
          onClick={() => onEditModeChange(true)}
          className={styles.EditEmail}
        >
          Змінити пошту
        </Button>
      </div>
    )
  }

  return (
    <>
      <Field.Control
        id={name}
        name={name}
        type="text"
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className={styles.FieldInput}
      />
      <p className={styles.Paragraph}>
        Електронну пошту буде змінено лише після підтвердження через лист, який
        надійде на вашу поточну адресу, та після подальшої верифікації нової
        пошти.
      </p>
    </>
  )
}

function PasswordField({
  name,
  value,
  onBlur,
  onChange,
  wrapperRef,
}: PasswordFieldProps) {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  return (
    <div className={styles.PasswordInputWrapper}>
      <Field.Control
        id={name}
        name={name}
        type={isPasswordShown ? 'text' : 'password'}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        ref={wrapperRef}
        className={styles.PasswordFieldInput}
      />
      <Button
        className={styles.ShowPassword}
        onClick={() => setIsPasswordShown(!isPasswordShown)}
      >
        <ClickTargetHelper />
        <VisuallyHidden>Показати пароль</VisuallyHidden>
        {isPasswordShown ? <Eye size={16} /> : <EyeClosed size={16} />}
      </Button>
    </div>
  )
}

export function SecuritySectionSkeleton() {
  return (
    <div className={styles.Form}>
      <div>
        <span className={styles.Label}>Електронна пошта</span>
        <Skeleton height="var(--40px)" width="100%" borderRadius="var(--4px)" />
      </div>

      <div>
        <span className={styles.Label}>Зміна паролю</span>
        <Skeleton height="10.625rem" width="100%" borderRadius="var(--4px)" />
      </div>
    </div>
  )
}

export default SecuritySection
