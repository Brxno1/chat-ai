import sharp from 'sharp'

export async function processImage(
  file: File,
  isGif: boolean,
): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (isGif) {
    return buffer
  }

  return sharp(buffer).webp({ quality: 80 }).toBuffer()
}
