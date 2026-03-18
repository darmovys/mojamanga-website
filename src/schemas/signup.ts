import * as z from 'zod'

export const requiredTrimmedString = z
  .string()
  .trim()
  .check(
    z.refine((val) => val.length > 0, {
      error: "Це поле є обов'язковим",
      abort: true,
    }),
  )

export const ALLOWED_SYMBOLS = /[-_&/,^@.#:%\\='$!?*`;+"|~[\](){}<>]/

export const signupSchema = z.object({
  username: requiredTrimmedString
    .max(30, {
      error: 'Псевдонім занадто довгий',
    })
    .refine((val) => !val.includes('@'), {
      message: 'Псевдонім не може містити символ @',
    }),
  email: requiredTrimmedString.pipe(
    z.email({ error: 'Неправильна електронна адреса' }),
  ),
  password: z
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
    }),
  cfToken: z.string(),
})

export type SignupValues = z.infer<typeof signupSchema>
