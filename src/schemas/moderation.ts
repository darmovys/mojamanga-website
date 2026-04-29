import z from 'zod'

export const moderationMenuTypes = [
  'works',
  'suggestions',
  'chapters',
  'teams',
  'comment-complaints',
  'users-management',
] as const

export const moderationMenuSchema = z.object({
  type: z.enum(moderationMenuTypes).catch('teams'),
  
  page: z.coerce
    .number()
    .int()
    .positive()
    .optional() // Параметр необов'язковий (перша сторінка його не має)
    .catch(undefined), // Якщо ввели літери, скидаємо до undefined (що логікою обробиться як 1 сторінка)
})

export type ModerationMenuType = (typeof moderationMenuTypes)[number]
export type ModerationMenuSearch = z.infer<typeof moderationMenuSchema>