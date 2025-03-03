import fs from 'fs/promises'
import path from 'path'

export async function uploadAndDeleteFile(
  file: File | null | undefined,
  timer: number = 60 * 5, // 5 minutes
) {
  try {
    // Primeiro, faz o upload do arquivo
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, file.name)

      // Escreve o arquivo
      await fs.writeFile(filePath, buffer)

      // Configura a exclusão após 5 minutos
      setTimeout(async () => {
        try {
          // Verifica se o arquivo existe usando fs.access
          await fs.access(filePath)
          await fs.unlink(filePath)
          console.log(`Arquivo ${file.name} excluído após 5 minutos`)
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
