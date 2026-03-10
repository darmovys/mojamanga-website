import * as z from 'zod'

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Псевдонім занадто короткий')
    .max(15, 'Псевдонім занадто довгий'),
  email: z.email('Електронна пошта введена некоректно'),
  password: z
    .string()
    .min(6, 'Пароль має містити не менше 3 символів')
    .max(50, 'Пароль має містити не більше 50 символів'),
  // cfToken: z.string().min(1, 'Будь ласка, підтвердіть, що ви не робот'),
})

export type signupSchemaProps = z.infer<typeof signupSchema>
