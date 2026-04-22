import { LinkType } from '@/generated/prisma/enums'
import z from 'zod'

export const activeLinkSchema = z.object({
  id: z.string(),
  type: z.enum(LinkType).nullable(),
  url: z.url({ error: 'Некоректний формат посилання' }),
})

export type ActiveLink = z.infer<typeof activeLinkSchema>

export const createTeamSchema = z.object({
  avatarKey: z.string({ error: 'Прикріпіть обкладинку своєї команди' }),
  backgroundKey: z.string().nullable().optional(),
  title: z.string().min(1, { error: 'Надайте назву своїй команді' }),
  description: z.string(),
  links: z.array(activeLinkSchema).default([]),
})
