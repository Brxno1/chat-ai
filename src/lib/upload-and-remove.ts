import fs from 'fs/promises'
import path from 'path'

export async function uploadAndDeleteFile(
  file: File | null | undefined,
  timer: number = 60 * 5, // 5 minutes
) {
  try {
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, file.name)

      await fs.writeFile(filePath, buffer)

      setTimeout(async () => {
        try {
          await fs.access(filePath)
          await fs.unlink(filePath)
        } catch (error) {
          console.error('Erro ao excluir o arquivo:', error)
        }
      }, timer)
    }
  } catch (error) {
    console.error('Erro no upload do arquivo:', error)
    throw error
  }
}
