import { S3 } from '@/lib/s3-client'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createClientOnlyFn } from '@tanstack/react-start'
import { displayable, formatCss, random } from 'culori'
import { differenceInHours, format, isSameYear } from 'date-fns'
import { uk } from 'date-fns/locale'

// ============================================================================
// РОБОТА З МАСИВАМИ ТА ЧИСЛАМИ
// ============================================================================

/**
 * Генерує масив чисел у заданому діапазоні.
 * @param start - Початкове значення (або кінцеве, якщо параметр end не передано)
 * @param end - Кінцеве значення (не включно)
 * @param step - Крок генерації (за замовчуванням 1)
 * @returns Масив чисел
 */
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

/**
 * Генерує випадкове число у заданому діапазоні.
 * @param min - Мінімальне можливе значення
 * @param max - Максимальне можливе значення (включно)
 * @returns Число
 */
export function getRandom(min: number, max: number) {
  const floatRandom = Math.random()

  const difference = max - min

  const random = Math.round(difference * floatRandom)

  const randomWithinRange = random + min

  return randomWithinRange
}

// ============================================================================
// РОБОТА З ДАТАМИ
// ============================================================================

/**
 * Форматує дату відповідно до часу, що минув.
 *
 * @param dateInput - Об'єкт Date, timestamp або ISO-рядок дати
 * @returns Відформатований рядок дати
 */
export function formatCustomDate(dateInput: Date | number | string): string {
  const targetDate = new Date(dateInput)
  const now = new Date()

  // 1. Перевірка, чи минуло менше 24 годин
  const hoursDifference = differenceInHours(now, targetDate)

  if (hoursDifference < 24) {
    return format(targetDate, 'HH:mm')
  }

  // 2. Якщо минуло більше 24 годин — перевіряємо, чи це поточний рік
  if (isSameYear(now, targetDate)) {
    return format(targetDate, 'd MMM.', { locale: uk })
  }

  // 3. Якщо дата з іншого року
  return format(targetDate, 'd MMM. yyyy', { locale: uk })
}

// ============================================================================
// РОБОТА З КОЛЬОРОМ
// ============================================================================

/**
 * Повертає випадковий колір у форматі OKLCH.
 *
 * Отриманий колір не буде дуже світлим або дуже темним,
 * щоб однаково нормально відображатися на поверхнях в залежності від режиму
 *
 * @returns OKLCH-код кольору, напр. "oklch(0.62 0.18 250)"
 */
export const randomOklch = (): string => {
  while (true) {
    const color = random('oklch', {
      l: [0.35, 0.75],
      c: [0.08, 0.2],
      h: [0, 360],
    })

    // Чи відобратиметься на sRGB-екранах
    if (displayable(color)) {
      const rounded = {
        mode: 'oklch' as const,
        l: Number(color.l.toFixed(3)),
        c: Number(color.c.toFixed(3)),
        h: Number(color.h?.toFixed(1)),
      }

      return formatCss(rounded)
    }
  }
}

// ============================================================================
// РОБОТА З ТЕКСТОМ ТА ЛОКАЛІЗАЦІЄЮ
// ============================================================================

const ukPluralRules = new Intl.PluralRules('uk-UA')

/**
 * Функція для плюралізації слів на основі числа.
 * * @param count - Кількість (число)
 * @param forms - Масив з трьох форм: [для 1, для 2-4, для 5+] (наприклад: ['коментар', 'коментарі', 'коментарів'])
 * @param isCompact - Чи відображається число у компактному форматі (тис., млн). За замовчуванням false.
 * @returns Відповідна форма слова
 */
export function pluralize(
  count: number,
  forms: string[],
  isCompact: boolean = false,
): string {
  if (isCompact && Math.abs(count) >= 1000) {
    return forms[2]
  }

  const rule = ukPluralRules.select(count)

  switch (rule) {
    case 'one':
      return forms[0]
    case 'few':
      return forms[1]
    case 'many':
    case 'other':
    default:
      return forms[2]
  }
}

/**
 * Форматує число у компактний вигляд (наприклад, 1500 -> 1,5 тис.).
 * * @param number - Число для форматування
 * @param accuracy - Кількість символів після коми (за замовчуванням: 1)
 * @returns Відформатоване число у вигляді рядка
 */
export function formatCompactNumber(
  number: number,
  accuracy: number = 1,
): string {
  return new Intl.NumberFormat('uk-UA', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: accuracy,
  }).format(number)
}

/**
 * Конвертація українського тексту в латиницю за системою Максима Прудеуса.
 *
 * Абетка:
 * A=а  B=б  C=ц  Č=ч  D=д  E=е  F=ф
 * G=г  Ĝ=ґ  H=х  I=і  J=й  K=к  L=л
 * M=м  N=н  O=о  P=п  R=р  S=с  Š=ш
 * T=т  U=у  V=в  Y=и  Z=з  Ž=ж
 * ' = ь (м'який знак) та апостроф — спільний символ
 *
 * Комбіновані літери:
 * Є = JE,  Ї = JI,  Ю = JU,  Я = JA, Щ = ŠČ
 */
// prettier-ignore
const UKRAINIAN_TO_LATIN: Record<string, string> = {
  // ─── Малі літери ───
  а: 'a', б: 'b', в: 'v', г: 'g', ґ: 'ĝ', д: 'd', е: 'e', є: 'je', ж: 'ž',
  з: 'z', и: 'y', і: 'i', ї: 'ji', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n',
  о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
  ч: 'č', ш: 'š', щ: 'šč', ь: "'", ю: 'ju', я: 'ja',
  // ─── Великі літери ───
  А: 'A', Б: 'B', В: 'V', Г: 'G', Ґ: 'Ĝ', Д: 'D', Е: 'E', Є: 'JE', Ж: 'Ž',
  З: 'Z', И: 'Y', І: 'I', Ї: 'JI', Й: 'J', К: 'K', Л: 'L', М: 'M', Н: 'N',
  О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'H', Ц: 'C',
  Ч: 'Č', Ш: 'Š', Щ: 'ŠČ', Ь: "'", Ю: 'JU', Я: 'JA',
  // ─── Апостроф ───
  '\u2019': "'", // '
  '\u0027': "'", // '
}

/**
 * Транслітерує український текст у латиницю.
 * * @param text - Рядок з українським текстом
 * @returns Рядок латиницею
 */
export function ukrainianToLatin(text: string): string {
  return [...text].map((char) => UKRAINIAN_TO_LATIN[char] ?? char).join('')
}

/**
 * Перетворює довільний текстовий рядок у безпечний URL-slug (kebab-case).
 * @remarks
 * Функція видаляє пробіли та спецсимволи, замінюючи їх на дефіси,
 * що запобігає проблемам з кодуванням шляхів у браузерах, CSS (`url()`) та S3
 * @param text - Вхідний рядок для форматування
 * @returns Очищений рядок у нижньому реєстрі з дефісами замість пробілів
 */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Замінює послідовності пробілів, дефісів та небуквено-цифрових символів на один дефіс
      .replace(/[\s\W-]+/g, '-')
      // Прибирає зайві дефіси на самому початку та в кінці рядка
      .replace(/^-+|-+$/g, '')
  )
}

/**
 * Створює короткий попередній перегляд тексту (preview).
 * @param text - Вхідний рядок опису.
 * @param minLength - Мінімальна кількість символів перед пошуком крапки (за замовчуванням 220).
 * @returns Обрізаний рядок для попереднього перегляду.
 */
export function createDescriptionPreview(
  text: string,
  minLength: number = 220,
): string {
  // 1. Якщо текст порожній або його довжина менша за мінімальний ліміт
  if (!text || text.length <= minLength) {
    return text || ''
  }

  // 2. Беремо частину тексту, починаючи з 220-го символу
  const textFromMinLength = text.slice(minLength)

  // 3. Шукаємо першу крапку, після якої йде пробіл або перенесення рядка
  const dotWithSpaceMatch = textFromMinLength.match(/\.\s/)

  if (dotWithSpaceMatch && typeof dotWithSpaceMatch.index === 'number') {
    // Індекс знайденої крапки відносно початку всього тексту + 1 (щоб включити саму крапку)
    const cutIndex = minLength + dotWithSpaceMatch.index + 1
    return text.slice(0, cutIndex).trim()
  }

  // 4. Fallback: якщо крапки з пробілом немає, шукаємо перший доступний пробіл після 220 символів
  const nextSpaceIndex = text.indexOf(' ', minLength)
  if (nextSpaceIndex !== -1) {
    return text.slice(0, nextSpaceIndex).trim() + '...'
  }

  // Якщо пробілів взагалі немає — повертаємо початкові 220 символів
  return text.slice(0, minLength).trim() + '...'
}

// ============================================================================
// ВАЛІДАЦІЯ
// ============================================================================

/**
 * Перевіряє, чи є рядок валідним HTTP/HTTPS URL-посиланням.
 * * @param value - Рядок для перевірки
 * @returns true, якщо рядок є валідним URL, інакше false
 */
export function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (e) {
    return false
  }
}

// ============================================================================
// РОБОТА З ФАЙЛАМИ ТА МЕДІА (DOM)
// ============================================================================

/**
 * Отримує фізичні розміри зображення (ширину та висоту) з об'єкта File.
 * * @param file - Об'єкт файлу зображення
 * @returns Promise з об'єктом, що містить width та height
 */
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
 * Конвертує вхідний файл зображення у формат WebP за допомогою нативного Canvas API.
 * @param file - Початковий файл зображення для конвертації.
 * @returns Проміс, що повертає новий об'єкт `File` у форматі `image/webp` із максимальною якістю (1.0).
 * @throws {Error} Якщо не вдалося отримати 2D контекст canvas або створити blob.
 */
export async function convertToWebP(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height

  const ctx = canvas.getContext('2d')
  ctx?.drawImage(bitmap, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Помилка конвертації зображення у WebP'))
          return
        }
        const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp'
        resolve(new File([blob], newFileName, { type: 'image/webp' }))
      },
      'image/webp',
      1.0,
    )
  })
}

// ============================================================================
// РОБОТА З LOCAL STORAGE (CLIENT ONLY)
// ============================================================================

const STORAGE_KEY = 'trusted_hostnames'

/**
 * Отримує масив довірених доменів (хостнеймів) з localStorage.
 * Виконується виключно на клієнті.
 * * @returns Масив рядків з довіреними доменами
 */
export const getTrustedHostnames = createClientOnlyFn((): string[] => {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
})

/**
 * Додає новий домен до списку довірених у localStorage (без дублікатів).
 * Виконується виключно на клієнті.
 * * @param hostname - Назва домену для додавання
 */
export const addTrustedHostname = createClientOnlyFn(
  (hostname: string): void => {
    const current = getTrustedHostnames()
    if (!current.includes(hostname)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, hostname]))
    }
  },
)

/**
 * Перевіряє, чи міститься домен у списку довірених збережених доменів.
 * Виконується виключно на клієнті.
 * * @param hostname - Назва домену для перевірки
 * @returns true, якщо домен є в списку
 */
export const isTrustedHostname = createClientOnlyFn(
  (hostname: string): boolean => {
    return getTrustedHostnames().includes(hostname)
  },
)

// ============================================================================
// AWS S3 / БЕКЕНД СЕРВІСИ
// ============================================================================

/**
 * Переміщує файл всередині S3 бакету (копіює на нове місце і видаляє старий).
 * * @param sourceKey - Поточний шлях до файлу (ключ)
 * @param destinationKey - Новий шлях до файлу (ключ)
 * @returns true у разі успіху, інакше false
 */
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
    console.error('Помилка переміщення файлу в S3:', error)
    return false
  }
}
