import * as z from 'zod'

export const trimmedString = z.string().trim()

export const ALLOWED_SYMBOLS = /[-_&/,^@.#:%\\='$!?*`;+"|~[\](){}<>]/

export const usernameSchema = trimmedString
  .min(1, { error: "Псевдонім є обов'язковим" })
  .min(3, {
    error: 'Псевдонім занадто короткий',
  })
  .max(30, {
    error: 'Псевдонім занадто довгий',
  })
  .refine((val) => !val.includes('@'), {
    message: 'Псевдонім не може містити символ @',
  })

export const emailSchema = trimmedString
  .min(1, { error: "Електронна пошта є обов'язковою" })
  .pipe(z.email({ error: 'Неправильна електронна пошта' }))

export const passwordSchema = z
  .string()
  .min(12, { error: 'Пароль має містити не менше 12 символів' })
  .max(50, { error: 'Пароль має містити не більше 50 символів' })
  .refine((val) => !/\p{L}/u.test(val.replace(/[A-Za-z]/g, '')), {
    error: 'Пароль має містити лише англійські літери',
    abort: true,
  })
  .refine((val) => /[A-Z]/.test(val), {
    error: 'Пароль має містити хоча б одну велику літеру',
    abort: true,
  })
  .refine((val) => /[a-z]/.test(val), {
    error: 'Пароль має містити хоча б одну малу літеру',
    abort: true,
  })
  .refine((val) => /[0-9]/.test(val), {
    error: 'Пароль має містити хоча б одну цифру',
    abort: true,
  })
  .refine((val) => ALLOWED_SYMBOLS.test(val), {
    error: 'Пароль має містити хоча б один символ',
    abort: true,
  })

export const signupSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  cfToken: z.string(),
})

export const loginSchema = z.object({
  usernameOrEmail: trimmedString,
  password: z.string(),
  cfToken: z.string(),
  rememberMe: z.boolean(),
})

export const createForgotPasswordSchema = ({
  isServer = false,
}: {
  isServer?: boolean
} = {}) => {
  const minMessage = isServer
    ? "Електронна пошта є обов'язковою"
    : 'Заповніть це поле'
  const emailMessage = isServer
    ? 'Неправильна електронна пошта'
    : 'Вкажіть коректну пошту'
  return z.object({
    email: trimmedString
      .min(1, { error: minMessage })
      .pipe(z.email({ error: emailMessage })),
    cfToken: z.string(),
  })
}

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
})
