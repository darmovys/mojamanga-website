import { LinkType } from '@/generated/prisma/enums'
import z from 'zod'

export const activeLinkSchema = z
  .object({
    id: z.string(),
    type: z.enum(LinkType).nullable(),
    url: z.string(),
  })
  .transform((data, ctx) => {
    if (data.type === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Задайте всім прикріпленим посиланням тип',
        path: ['url'],
      })
      return z.NEVER
    }

    if (data.url.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Задайте всім прикріпленим посиланням адресу',
        path: ['url'],
      })
      return z.NEVER
    }

    const isUrlValid = z.url().safeParse(data.url).success
    if (!isUrlValid) {
      ctx.addIssue({
        code: 'custom',
        message: 'Некоректний формат посилання',
        path: ['url'],
      })
      return z.NEVER
    }

    return {
      id: data.id,
      type: data.type,
      url: data.url,
    }
  })

export type ActiveLinkInput = z.input<typeof activeLinkSchema>

export type ActiveLinkOutput = z.output<typeof activeLinkSchema>

export const sendNewTeamDataSchema = z.object({
  coverKey: z.string({ error: 'Прикріпіть обкладинку своєї команди' }),
  backgroundKey: z.string().nullable().optional(),
  title: z.string().trim().min(1, { error: 'Надайте назву своїй команді' }),
  description: z.string(),
  links: z.array(activeLinkSchema).default([]),
})
