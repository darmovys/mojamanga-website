import { createFileRoute, Link } from '@tanstack/react-router'
import Logo from '@/components/Logo'
import { revalidateLogic, useForm } from '@tanstack/react-form-start'
import { signupSchema } from '@/schemas/signup'
import { useState, useTransition } from 'react'
import { Button, Field } from '@base-ui/react'
import { Eye, EyeClosed, Loader, TriangleAlert } from 'lucide-react'
import VisuallyHidden from '@/components/VisuallyHidden'
import ClickTargetHelper from '@/components/ClickTargetHelper'
import styles from './signup.module.scss'

export const Route = createFileRoute('/_auth/signup/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isPending, startTransition] = useTransition()
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signupSchema,
      onBlur: signupSchema,
    },

    validationLogic: revalidateLogic(),
    onSubmit: () => {
      console.log('TODO')
    },
  })

  return (
    <div className={styles.Wrapper}>
      <div className={styles.Content}>
        <header className={styles.Header}>
          <h1 className={styles.HeaderTitle}>Реєстрація</h1>
        </header>
        <form className={styles.FormContent}>
          <form.Field
            name="username"
            children={(field) => {
              return (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                  className={styles.FieldRoot}
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
                      onBlur={field.handleBlur}
                      autoComplete="off"
                      type="text"
                    />
                  </div>
                  <Field.Error
                    className={styles.Error}
                    match={!field.state.meta.isValid}
                  >
                    <TriangleAlert size={14} />
                    {field.state.meta.errors.map((e) => e?.message).join(', ')}
                  </Field.Error>
                </Field.Root>
              )
            }}
          />

          <form.Field
            name="email"
            children={(field) => {
              return (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                  className={styles.FieldRoot}
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
                  <Field.Error
                    className={styles.Error}
                    match={!field.state.meta.isValid}
                  >
                    <TriangleAlert size={14} />
                    {field.state.meta.errors.map((e) => e?.message).join(', ')}
                  </Field.Error>
                </Field.Root>
              )
            }}
          />

          <form.Field
            name="password"
            children={(field) => {
              return (
                <Field.Root
                  name={field.name}
                  invalid={!field.state.meta.isValid}
                  dirty={field.state.meta.isDirty}
                  touched={field.state.meta.isTouched}
                  className={styles.FieldRoot}
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
                  <Field.Error
                    className={styles.Error}
                    match={!field.state.meta.isValid}
                  >
                    <TriangleAlert size={14} />
                    {field.state.meta.errors.map((e) => e?.message).join(', ')}
                  </Field.Error>
                </Field.Root>
              )
            }}
          />
        </form>

        {/* <div className={styles.BottomSection}>
          <p className={styles.BottomText}>Новий користувач?</p>
        </div> */}
        {/* <Loader className={styles.Loader} /> */}
      </div>
    </div>
  )
}
