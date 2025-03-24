export function formatTextWithStrong(text: string) {
  return text.split('**').map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="font-bold">
        {part}
      </span>
    ) : (
      part
    ),
  )
}
