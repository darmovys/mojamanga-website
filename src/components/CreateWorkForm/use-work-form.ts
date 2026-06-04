import {
  AgeRestriction,
  TranslationStatus,
  WorkStatus,
  WorkType,
} from '@/generated/prisma/enums'
import { useImageUpload } from '@/hooks/use-image-upload'
import { showTimedToast } from '@/lib/toast'
import { Genre, Person, Tag, Team } from '@/lib/treaty-types'
import { useForm } from '@tanstack/react-form-start'
import { useTransition } from 'react'
import z from 'zod'

const workFormSchema = z.object({
  ukrName: z.string().min(1, { error: "Назва українською обов'язкова" }),
  enName: z.string().min(1, { error: "Назва англійською обов'язкова" }),
  alternativeNames: z
    .string()
    .refine((val) => val === '' || /^[^/]+( \/ [^/]+)*$/.test(val), {
      error: 'Дотримуйтесь формату: Назва 1 / Назва 2 (з пробілами)',
    }),
  type: z
    .enum(WorkType, { error: 'Оберіть тип твору' })
    .nullable()
    .refine((val) => val !== null, { error: 'Оберіть тип твору' }),
  workStatus: z
    .enum(WorkStatus, { error: 'Оберіть статус твору' })
    .nullable()
    .refine((val) => val !== null, { error: 'Оберіть статус твору' }),
  translationStatus: z
    .enum(TranslationStatus, { error: 'Оберіть статус перекладу' })
    .nullable()
    .refine((val) => val !== null, { error: 'Оберіть статус перекладу' }),
  ageRestriction: z
    .enum(AgeRestriction, { error: 'Вкажіть вікове обмеження' })
    .nullable()
    .refine((val) => val !== null, { error: 'Вкажіть вікове обмеження' }),
  releaseYear: z
    .string()
    .min(1, { error: 'Вкажіть рік випуску' })
    .regex(/^\d{4}$/, { error: 'Рік випуску має складатися з 4 цифр' })
    .refine(
      (val) => {
        const year = parseInt(val)
        return year >= 1900 && year <= new Date().getFullYear() + 10
      },
      { error: 'Вкажіть коректний рік випуску' },
    ),
  genres: z.array(z.string()),
  tags: z.array(z.string()),
  authors: z
    .array(z.custom<Person>())
    .min(1, { error: 'Додайте хоча б одного автора' }),
  artists: z
    .array(z.custom<Person>())
    .min(1, { error: 'Додайте хоча б одного художника' }),
  teams: z
    .array(z.custom<Team>())
    .min(1, { error: 'Оберіть хоча б одну команду' }),
})

export function useWorkForm() {
  const cover = useImageUpload({ width: 375, height: 525 })
  const background = useImageUpload({ width: 1450, height: 540 })
  const [isUploading, startUploadingTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      ukrName: '',
      enName: '',
      alternativeNames: '',
      description: '',
      type: null as WorkType | null,
      workStatus: null as WorkStatus | null,
      translationStatus: null as TranslationStatus | null,
      ageRestriction: null as AgeRestriction | null,
      releaseYear: '',
      genres: [] as string[],
      tags: [] as string[],
      authors: [] as Person[],
      artists: [] as Person[],
      teams: [] as Team[],
    },
    onSubmit: async ({ value: formValues }) => {
      if (!cover.fileState?.key) {
        showTimedToast(
          {
            type: 'warning',
            title: 'Попередження',
            description: 'Прикріпіть обкладинку твору',
          },
          4000,
        )
        return
      }

      const result = workFormSchema.safeParse(formValues)

      if (!result.success) {
        showTimedToast({
          type: 'warning',
          title: 'Попередження',
          description: result.error.issues[0].message,
        })
        return
      }

      console.log('Дані форми готової до відправки:', formValues)
    },
  })

  return {
    cover,
    background,
    form,
    isUploading,
  }
}
