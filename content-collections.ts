import { defineCollection, defineConfig } from '@content-collections/core'
import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdx from 'remark-mdx'
import { remarkMarkAndUnravel } from 'safe-mdx/parse'
import { z } from 'zod'

const toCamelCase = (value: string) =>
  value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[]

const normalizeStyleKey = (key: string) => {
  const trimmed = key.trim()
  if (!trimmed) return ''
  return toCamelCase(trimmed)
}

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('uk-UA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))

const toStyleObjectLiteral = (value: string) => {
  const entries = value
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [rawKey, ...rest] = entry.split(':')
      const key = normalizeStyleKey(rawKey ?? '')
      const val = rest.join(':').trim()
      if (!key || !val) return null
      return `${key}: ${JSON.stringify(val)}`
    })
    .filter(Boolean)
  return entries.length ? `{ ${entries.join(', ')} }` : ''
}

const normalizeMdxContent = (content: string) => {
  const lines = content.split('\n')
  let inFence = false
  return lines
    .map((line) => {
      const trimmed = line.trimStart()
      if (trimmed.startsWith('```')) {
        inFence = !inFence
        return line
      }
      if (inFence) return line
      return line
        .replace(/\sstyle="([^"]*)"/g, (_, styleValue: string) => {
          const objectLiteral = toStyleObjectLiteral(styleValue)
          return objectLiteral ? ` style={{${objectLiteral.slice(1, -1)}}}` : ''
        })
        .replace(/\bframeborder=/g, 'frameBorder=')
        .replace(/\ballowfullscreen\b/g, 'allowFullScreen')
    })
    .join('\n')
}

const mdxProcessor = remark()
  .use(remarkMdx)
  .use(remarkFrontmatter, ['yaml', 'toml'])
  .use(remarkMarkAndUnravel)
  .use(() => {
    return (tree, file) => {
      file.data.ast = tree
    }
  })

const parseMdxAst = async (content: string): Promise<JsonValue> => {
  const file = await mdxProcessor.process(content)
  return JSON.parse(JSON.stringify(file.data.ast))
}

const news = defineCollection({
  name: 'news',
  directory: 'src/data/news',
  include: '**/*.{md,mdx}',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.iso.date(),
    content: z.string(),
  }),
  transform: async (document) => {
    const content = normalizeMdxContent(document.content)
    const mdast = await parseMdxAst(content)
    const date = new Date(document.publishDate)
    return {
      ...document,
      content,
      mdast,
      publishDate: formatDate(document.publishDate),
      date,
    }
  },
})

const helperInfos = defineCollection({
  name: 'helperInfos',
  directory: 'src/data/helper-infos',
  include: '**/*.{md,mdx}',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  transform: async (document) => {
    const content = normalizeMdxContent(document.content)
    const mdast = await parseMdxAst(content)
    return {
      ...document,
      content,
      mdast,
    }
  },
})

export default defineConfig({
  content: [news, helperInfos],
})
