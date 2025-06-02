'use client'

import React from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Switch } from '@/components/ui/switch'

export function ComponentSwitchTheme() {
  const id = React.useId()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSwitch = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const isLight = resolvedTheme === 'light'

  return (
    <div
      className="group inline-flex items-center gap-2"
      data-state={isLight || !mounted ? 'checked' : 'unchecked'}
    >
      <span
        id={`${id}-off`}
        className="flex-1 text-right text-sm font-medium group-data-[state=checked]:text-muted-foreground/70"
        aria-controls={id}
      >
        <MoonIcon size={16} aria-hidden="true" />
      </span>
      {mounted ? (
        <Switch
          id={id}
          checked={isLight}
          onCheckedChange={toggleSwitch}
          aria-labelledby={`${id}-off ${id}-on`}
          aria-label="Troque entre o tema claro e escuro"
        />
      ) : (
        <Switch
          id={id}
          checked={false}
          disabled
          aria-labelledby={`${id}-off ${id}-on`}
          aria-label="Troque entre o tema claro e escuro"
        />
      )}
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
