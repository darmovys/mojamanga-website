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
})

export type ModerationMenuType = (typeof moderationMenuTypes)[number]
