export async function clipboardWriteText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error)
    return false
  }
}
