import { ArrowRightIcon, MailIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function ButtonMail() {
  return (
    <Button className="group" variant="secondary">
      <MailIcon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
      Enviar email
      <ArrowRightIcon
        className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
        size={16}
        aria-hidden="true"
      />
    </Button>
  )
}
