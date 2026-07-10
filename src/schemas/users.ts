import { z } from 'zod'

export const changeUserProfileSchema = z.object({
  avatarKey: z.string().optional(),
  backgroundKey: z.string().optional(),
  username: z
    .string()
    .trim()
    .min(1, { error: 'Поле псевдоніму не може бути пустим' })
    .max(20, { error: 'Задовгий псевдонім' }),
  description: z.string().trim().max(1000, { error: 'Задовгий опис' }),
})
