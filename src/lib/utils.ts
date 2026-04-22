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
