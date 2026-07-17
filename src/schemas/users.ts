import { z } from 'zod'
import { ALLOWED_SYMBOLS, emailSchema, usernameSchema } from './auth'

export const newPasswordSchema = z
  .string()
  .min(12, { error: 'Новий пароль має містити не менше 12 символів' })
  .max(50, { error: 'Новий пароль має містити не більше 50 символів' })
  .refine((val) => !/\p{L}/u.test(val.replace(/[A-Za-z]/g, '')), {
    error: 'Новий пароль має містити лише англійські літери',
    abort: true,
  })
  .refine((val) => /[A-Z]/.test(val), {
    error: 'Новий пароль має містити хоча б одну велику літеру',
    abort: true,
  })
  .refine((val) => /[a-z]/.test(val), {
    error: 'Новий пароль має містити хоча б одну малу літеру',
    abort: true,
  })
  .refine((val) => /[0-9]/.test(val), {
    error: 'Новий пароль має містити хоча б одну цифру',
    abort: true,
  })
  .refine((val) => ALLOWED_SYMBOLS.test(val), {
    error: 'Новий пароль має містити хоча б один символ',
    abort: true,
  })

export const changeUserProfileSchema = z.object({
  avatarKey: z.string().optional(),
  backgroundKey: z.string().optional(),
  username: usernameSchema,
  description: z.string().trim().max(1000, { error: 'Задовгий опис' }),
})

export const changeUserSecuritySchema = z
  .object({
    email: emailSchema,
    currentPassword: z.string().optional().or(z.literal('')),
    newPassword: z
      .string()
      .default('')
      .superRefine((val, ctx) => {
        if (val == '') return
        const parsed = newPasswordSchema.safeParse(val)
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) => {
            ctx.addIssue({
              code: 'custom',
              message: issue.message,
              input: issue.input,
            })
          })
        }
      }),
  })
  .refine(
    (data) => {
      const hasCurrent =
        !!data.currentPassword && data.currentPassword.length > 0
      const hasNew = !!data.newPassword && data.newPassword.length > 0
      return (hasCurrent && hasNew) || (!hasCurrent && !hasNew)
    },
    {
      error:
        'Для зміни пароля потрібно заповнити як новий, так і поточний пароль',
    },
  )
