import { LinkType } from '@/generated/prisma/enums'
import { isValidUrl } from '@/lib/utils'
import z from 'zod'

export const activeLinkSchema = z.object({
  id: z.string(),
  type: z
    .enum(LinkType)
    .nullable()
    .pipe(
      z.enum(LinkType, {
        error: 'Задайте всім прикріпленим посиланням тип',
      }),
    ),
  url: z
    .string()
    .trim()
    .min(1, { error: 'Заповніть адреси для всіх посилань' })
    .refine((val) => isValidUrl(val), {
      error: 'Введіть посилання у форматі "https://"',
    }),
})

export type ActiveLinkInput = z.input<typeof activeLinkSchema>

export type ActiveLinkOutput = z.output<typeof activeLinkSchema>

export const sendNewTeamDataSchema = z.object({
  coverKey: z.string({ error: 'Прикріпіть обкладинку своєї команди' }),
  backgroundKey: z.string().nullable().optional(),
  backgroundAccentColor: z.string().nullable().optional(),
  title: z.string().trim().min(1, { error: 'Надайте назву своїй команді' }),
  description: z.string(),
  links: z.array(activeLinkSchema).default([]),
})
