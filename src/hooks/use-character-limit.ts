'use client'

import { ChangeEvent, useState } from 'react'

type UseCharacterLimitProps = {
  maxLengthForBio: number
  initialValue?: string
}

export function useCharacterLimit({
  maxLengthForBio,
  initialValue = '',
}: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue)
  const [characterCount, setCharacterCount] = useState(initialValue.length)

  const handleChange = (
    ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = ev.target.value
    if (newValue.length <= maxLengthForBio) {
      setValue(newValue)
      setCharacterCount(newValue.length)
    }
  }

  return {
    value,
    characterCount,
    handleChange,
    maxLengthForBio,
  }
}
