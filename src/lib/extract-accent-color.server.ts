import { Vibrant } from 'node-vibrant/node'
import sharp from 'sharp'

/**
 * Вилучає акцентний колір із зображення.
 * @param imageBuffer - буфер вихідного зображення (jpg, png, webp тощо)
 * @returns HEX-код акцентного кольору, напр. "#3a7bd5"
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

  return swatch.hex
}
