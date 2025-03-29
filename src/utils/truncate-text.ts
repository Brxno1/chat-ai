interface TruncateTextProps {
  text: string
  maxLength?: number
}

export const truncateText = ({ text, maxLength = 20 }: TruncateTextProps) => {
  if (text.length < maxLength) {
    return text
  }

  return `${text.slice(0, maxLength - 3)}...`
}
