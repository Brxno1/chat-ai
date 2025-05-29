export const truncateText = (text: string, maxLength = 20) => {
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength - 3)}...`
  }

  return text
}
