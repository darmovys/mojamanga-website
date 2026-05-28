import z from 'zod'

export const createPersonSchema = z.object({
  coverKey: z.string().nullable().optional(),
  nameUkr: z
    .string()
    .trim()
    .min(1, { error: 'Поле "ім\'я українською" не заповнене' }),
  nameLat: z
    .string()
    .trim()
    .min(1, { error: 'Поле "ім\'я латиною" не заповнене' }),
  description: z.string().trim().optional(),
})
