import { SystemFolderType } from '@/generated/prisma/enums'
import { z } from 'zod'

const baseFolderDataSchema = z.object({
  id: z.string(),
  bookmarks: z.array(
    z.object({ id: z.string(), lastChapterId: z.string().nullable() }),
  ),
})

const systemFolderDataSchema = z.object({
  isSystem: z.literal(true),
  name: z.null(),
  color: z.null(),
  systemType: z.enum(SystemFolderType),
})

const userFolderDataSchema = z.object({
  isSystem: z.literal(false),
  name: z.string(),
  color: z.string(),
  systemType: z.null(),
})

export const bookmarkFolderInputSchema = z.discriminatedUnion('isSystem', [
  systemFolderDataSchema,
  userFolderDataSchema,
])

export const systemFolderSchema = baseFolderDataSchema.extend(
  systemFolderDataSchema.shape,
)

export const userFolderSchema = baseFolderDataSchema.extend(
  userFolderDataSchema.shape,
)

export const bookmarkFolderSchema = z.discriminatedUnion('isSystem', [
  systemFolderSchema,
  userFolderSchema,
])

export type BookmarkFolder = z.infer<typeof bookmarkFolderSchema>

export const FOLDER_NAME_LENGTH_LIMIT = 30

export const upsertBookmarkSchema = z.object({
  titleId: z.cuid2(),
  folderId: z.cuid2(),
})

export const addNewFolderSchema = z.object({
  name: z
    .string()
    .min(1, { error: 'Заповніть поле' })
    .max(FOLDER_NAME_LENGTH_LIMIT, {
      error: `Скоротіть назву (до ${FOLDER_NAME_LENGTH_LIMIT} символ.)`,
    }),
})

export const deleteBookmarkSchema = z.object({
  titleId: z.cuid2(),
})
