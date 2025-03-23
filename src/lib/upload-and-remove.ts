import fs from 'fs/promises'
import path from 'path'

interface UploadAndDeleteFileProps {
  file: File | null | undefined
  timer: number
}

export async function uploadAndDeleteFile({
  file,
  timer,
}: UploadAndDeleteFileProps) {
  try {
    if (file) {
      const bufferFile = Buffer.from(await file.arrayBuffer())

      const uploadDir = path.join(process.cwd(), 'public/uploads')

      await fs.mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, file.name)

      await fs.writeFile(filePath, bufferFile)

      setTimeout(async () => {
        try {
          await fs.access(filePath)
          await fs.unlink(filePath)
        } catch (error) {
          if (error instanceof Error) {
            console.error('Erro ao excluir o arquivo:', error.message)
          }
        }
      }, timer)
    }
  } catch (error) {
    console.error('Erro no upload do arquivo:', error)
    throw error
  }
}
