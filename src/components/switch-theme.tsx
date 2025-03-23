'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useId, useState } from 'react'

import { Switch } from '@/components/ui/switch'

export function ComponentSwitchTheme() {
  const id = useId()
  const { setTheme, theme } = useTheme()
  const [checked, setChecked] = useState(theme === 'light')

  const toggleSwitch = () => {
    setChecked((prev) => !prev)
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div
      className="group inline-flex items-center gap-2"
      data-state={checked ? 'checked' : 'unchecked'}
    >
      <span
        id={`${id}-off`}
        className="flex-1 text-right text-sm font-medium group-data-[state=checked]:text-muted-foreground/70"
        aria-controls={id}
      >
        <MoonIcon size={16} aria-hidden="true" />
      </span>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={toggleSwitch}
        aria-labelledby={`${id}-off ${id}-on`}
        aria-label="Toggle between dark and light mode"
      />
      <span
        id={`${id}-on`}
        className="flex-1 text-left text-sm font-medium group-data-[state=unchecked]:text-muted-foreground/70"
        aria-controls={id}
      >
        <SunIcon size={16} aria-hidden="true" />
      </span>
    </div>
  )
}
