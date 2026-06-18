import {
  AgeRestriction,
  TranslationStatus,
  TitleStatus,
  TitleType,
} from '@/generated/prisma/enums'
import { z } from 'zod'

interface PersonShape {
  id: string
  nameUkr: string
  nameLat: string
}

interface TeamShape {
  id: string
  name: string
}

interface TagShape {
  id: string
  name: string
}

interface GenreShape {
  id: string
  name: string
}

type FieldTypes = { [key: string]: 'string' | 'number' | 'boolean' }

function zodObjectArray<T>(fields: FieldTypes, errorMsg: string) {
  return z.array(
    z.custom<T>((val) => {
      if (typeof val !== 'object' || val === null) return false
      return Object.entries(fields).every(
        ([key, type]) => typeof (val as Record<string, unknown>)[key] === type,
      )
    }),
    { error: errorMsg },
  )
}

const zodTeamArray = zodObjectArray<TeamShape>(
  { id: 'string', name: 'string' },
  'Масив не відповідає типу Team',
)

const zodPersonArray = zodObjectArray<PersonShape>(
  { id: 'string', nameUkr: 'string', nameLat: 'string' },
  'Масив не відповідає типу Person',
)

const zodTagArray = zodObjectArray<TagShape>(
  { id: 'string', name: 'string' },
  'Масив не відповідає типу Tag',
)
const zodGenreArray = zodObjectArray<GenreShape>(
  { id: 'string', name: 'string' },
  'Масив не відповідає типу Genre',
)

export const addTitleSchema = z.object({
  coverKey: z
    .string({ error: 'Прикріпіть обкладинку твору' })
    .min(1, { error: 'Прикріпіть обкладинку твору' }),
  backgroundKey: z.string().optional(),
  ukrName: z.string().min(1, { error: "Назва українською обов'язкова" }),
  enName: z.string().min(1, { error: "Назва англійською обов'язкова" }),
  alternativeNames: z
    .string()
    .refine((val) => val === '' || /^[^/]+( \/ [^/]+)*$/.test(val), {
      error: 'Дотримуйтесь формату: Назва 1 / Назва 2 (з пробілами)',
    }),
  description: z.string().trim().max(1000, { error: 'Задовгий опис' }),
  type: z
    .enum(TitleType, { error: 'Оберіть тип твору' })
    .nullable()
    .refine((val) => val !== null, { error: 'Оберіть тип твору' }),
  titleStatus: z
    .enum(TitleStatus, { error: 'Оберіть статус твору' })
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
  genres: zodGenreArray,
  tags: zodTagArray,
  authors: zodPersonArray.min(1, { error: 'Додайте хоча б одного автора' }),
  artists: zodPersonArray.min(1, { error: 'Додайте хоча б одного художника' }),
  teams: zodTeamArray.min(1, { error: 'Оберіть хоча б одну команду' }),
})
