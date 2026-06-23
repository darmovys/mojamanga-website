import { S3 } from '@/lib/s3-client'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createClientOnlyFn } from '@tanstack/react-start'

export const getImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }

    img.onerror = () => {
      reject(new Error('Не вдалося завантажити зображення'))
      URL.revokeObjectURL(url)
    }

    img.src = url
  })
}

/**
 * Конвертація українського тексту в латиницю за системою Максима Прудеуса.
 *
 * Абетка:
 *   A=а  B=б  C=ц  Č=ч  D=д  E=е  F=ф
 *   G=г  Ĝ=ґ  H=х  I=і  J=й  K=к  L=л
 *   M=м  N=н  O=о  P=п  R=р  S=с  Š=ш
 *   T=т  U=у  V=в  Y=и  Z=з  Ž=ж
 *   ' = ь (м'який знак) та апостроф — спільний символ
 *
 * Комбіновані літери:
 *   Є = JE,  Ї = JI,  Ю = JU,  Я = JA, Щ = ŠČ
 */

const UKRAINIAN_TO_LATIN: Record<string, string> = {
  // ─── Малі літери ───
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  ґ: 'ĝ',
  д: 'd',
  е: 'e',
  є: 'je',
  ж: 'ž',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'ji',
  й: 'j',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'č',
  ш: 'š',
  щ: 'šč',
  ь: "'",
  ю: 'ju',
  я: 'ja',

  // ─── Великі літери ───
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Ґ: 'Ĝ',
  Д: 'D',
  Е: 'E',
  Є: 'JE',
  Ж: 'Ž',
  З: 'Z',
  И: 'Y',
  І: 'I',
  Ї: 'JI',
  Й: 'J',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'H',
  Ц: 'C',
  Ч: 'Č',
  Ш: 'Š',
  Щ: 'ŠČ',
  Ь: "'",
  Ю: 'JU',
  Я: 'JA',

  // ─── Апостроф ───
  '\u2019': "'", // '
  '\u0027': "'", // '
}

export function ukrainianToLatin(text: string): string {
  return [...text].map((char) => UKRAINIAN_TO_LATIN[char] ?? char).join('')
}

export function range(start: number, end?: number, step: number = 1): number[] {
  let output: number[] = []
  if (typeof end === 'undefined') {
    end = start
    start = 0
  }
  for (let i = start; i < end; i += step) {
    output.push(i)
  }
  return output
}

export async function moveS3File(sourceKey: string, destinationKey: string) {
  try {
    await S3.send(
      new CopyObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        CopySource: `${process.env.S3_BUCKET_NAME}/${sourceKey}`,
        Key: destinationKey,
      }),
    )

    await S3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: sourceKey,
      }),
    )
    return true
  } catch (error) {
    console.error('Помилка переміщення файлу в S3: error')
    return false
  }
}

export function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (e) {
    return false
  }
}

const STORAGE_KEY = 'trusted_hostnames'

export const getTrustedHostnames = createClientOnlyFn((): string[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
})

export const addTrustedHostname = createClientOnlyFn(
  (hostname: string): void => {
    const current = getTrustedHostnames()
    if (!current.includes(hostname)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, hostname]))
    }
  },
)

export const isTrustedHostname = createClientOnlyFn(
  (hostname: string): boolean => {
    return getTrustedHostnames().includes(hostname)
  },
)
