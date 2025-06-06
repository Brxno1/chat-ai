export function generateTitleFromMessages(messages: string[]): string {
  const stopWords = new Set([
    'e',
    'a',
    'o',
    'que',
    'de',
    'do',
    'da',
    'em',
    'para',
    'com',
    'um',
    'uma',
    'na',
    'no',
    'dos',
    'das',
  ])

  const combinedMessages = messages.join(' ')
  const words = combinedMessages.split(' ')
  const wordCount: { [key: string]: number } = {}

  words.forEach((word) => {
    const cleanedWord = word.toLowerCase().replace(/[.,!?]/g, '')
    if (cleanedWord && !stopWords.has(cleanedWord)) {
      wordCount[cleanedWord] = (wordCount[cleanedWord] || 0) + 1
    }
  })

  const sortedWords = Object.entries(wordCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([word]) => word)

  const title = sortedWords.slice(0, 3).join(' ') || 'Nova conversa'

  const formattedTitle = title
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())

  return formattedTitle
}
