import { Vibrant } from 'node-vibrant/node'
import sharp from 'sharp'
import { converter, formatCss } from 'culori'

/**
 * Вилучає акцентний колір із зображення.
 * @param imageBuffer - буфер вихідного зображення (jpg, png, webp тощо)
 * @returns OKLCH-код акцентного кольору, напр. "oklch(0.62 0.18 250)"
 */
export const extractAccentColor = async (
  imageBuffer: Buffer,
): Promise<string> => {
  const processedBuffer = await sharp(imageBuffer)
    .resize(300, 300, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat('png')
    .toBuffer()

  const palette = await Vibrant.from(processedBuffer).quality(1).getPalette()

  const swatch =
    palette.DarkVibrant ??
    palette.DarkMuted ??
    palette.Muted ??
    palette.LightMuted ??
    palette.Vibrant ??
    palette.LightVibrant

  if (!swatch) {
    throw new Error('Не вдалося визначити акцентний колір зображення')
  }

  const [r, g, b] = swatch.rgb

  const oklch = converter('oklch')({
    mode: 'rgb',
    r: r / 255,
    g: g / 255,
    b: b / 255,
  })

  const rounded = {
    mode: 'oklch' as const,
    l: Number(oklch.l?.toFixed(3)),
    c: Number(oklch.c?.toFixed(3)),
    h: Number(oklch.h?.toFixed(1)),
  }

  return formatCss(rounded)
}
